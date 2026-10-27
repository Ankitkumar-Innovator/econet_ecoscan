/**
 * EcoScan Application Engine
 * Handles searching across item names, categories, bin colors & keywords,
 * rendering item cards with color-coded borders, statistics calculations, and modal management.
 */

// Application State
let currentSearchKeyword = "";
let selectedCategory = "All";

// DOM References
const searchInput = document.getElementById("searchInput");
const resultsGrid = document.getElementById("resultsGrid");
const noResults = document.getElementById("noResults");
const resetSearchBtn = document.getElementById("resetSearchBtn");
const pillButtons = document.querySelectorAll(".pill");

// Modal Elements
const itemModal = document.getElementById("itemModal");
const modalTitle = document.getElementById("modalTitle");
const modalBadge = document.getElementById("modalBadge");
const modalBinIndicator = document.getElementById("modalBinIndicator");
const modalInstruction = document.getElementById("modalInstruction");
const modalCloseBtn = document.getElementById("modalCloseBtn");

// Stats Counters
const statTotal = document.getElementById("statTotal");
const statRecyclable = document.getElementById("statRecyclable");
const statHazardous = document.getElementById("statHazardous");

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    updateStatistics();
    renderGrid(wasteDatabase);

    // Live Keyword Search Handler
    searchInput.addEventListener("input", (e) => {
        currentSearchKeyword = e.target.value.toLowerCase().trim();
        executeFiltering();
    });

    // Category Pill Filter Handler
    pillButtons.forEach(pill => {
        pill.addEventListener("click", () => {
            pillButtons.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");

            selectedCategory = pill.getAttribute("data-category");
            executeFiltering();
        });
    });

    // Reset Filters Handler
    resetSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        currentSearchKeyword = "";
        selectedCategory = "All";
        
        pillButtons.forEach(p => p.classList.remove("active"));
        pillButtons[0].classList.add("active");

        executeFiltering();
    });

    // Modal Interaction Handlers
    modalCloseBtn.addEventListener("click", closeModal);
    itemModal.addEventListener("click", (e) => {
        if (e.target === itemModal) closeModal();
    });

    // Global Key Listener for ESC key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && itemModal.classList.contains("active")) {
            closeModal();
        }
    });
});

/**
 * Calculates and updates header summary statistics
 */
function updateStatistics() {
    statTotal.textContent = wasteDatabase.length;

    const dryCount = wasteDatabase.filter(item => item.category === "Dry Waste").length;
    statRecyclable.textContent = dryCount;

    const hazardousCount = wasteDatabase.filter(item => item.category === "Hazardous" || item.category === "E-Waste").length;
    statHazardous.textContent = hazardousCount;
}

/**
 * Core search and filter engine matching:
 * 1. Item Name
 * 2. Waste Category
 * 3. Bin Name
 * 4. Item Keywords
 * 5. Instruction text
 */
function executeFiltering() {
    const filteredItems = wasteDatabase.filter(item => {
        // Keyword Search Check
        const matchesName = item.name.toLowerCase().includes(currentSearchKeyword);
        const matchesCategory = item.category.toLowerCase().includes(currentSearchKeyword);
        const matchesBin = item.bin.toLowerCase().includes(currentSearchKeyword);
        const matchesInstruction = item.instruction.toLowerCase().includes(currentSearchKeyword);
        const matchesKeywordsList = item.keywords && item.keywords.some(kw => kw.toLowerCase().includes(currentSearchKeyword));

        const matchesSearch = matchesName || matchesCategory || matchesBin || matchesInstruction || matchesKeywordsList;

        // Category Pill Filter Check
        const matchesPillCategory = (selectedCategory === "All") || (item.category === selectedCategory);

        return matchesSearch && matchesPillCategory;
    });

    renderGrid(filteredItems);
}

/**
 * Dynamic Card Grid Rendering
 * Includes color-coded top borders according to bin theme (`blue`, `green`, `red`, `amber`)
 */
function renderGrid(items) {
    resultsGrid.innerHTML = "";

    if (items.length === 0) {
        noResults.classList.remove("hidden");
        return;
    }

    noResults.classList.add("hidden");

    items.forEach(item => {
        const card = document.createElement("div");
        // Color-coded bin theme class added directly to card class list (card blue, card green, etc.)
        card.className = `card ${item.binTheme}`;
        card.onclick = () => openModal(item);

        /* 
           IMAGE PLACEHOLDER FALLBACK:
           If local image asset is missing or fails to load, onerror hides <img> and displays fallback emoji icon.
        */
        card.innerHTML = `
            <div class="card-preview-box">
                <!-- IMAGE PLACEHOLDER: Replace imageSrc in data.js with local asset path -->
                <img 
                    src="${item.imageSrc}" 
                    alt="${item.name}" 
                    class="card-image-placeholder"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"
                />
                <span class="card-emoji-icon" style="display:none;">${item.emoji}</span>
            </div>
            <div class="card-body">
                <div class="card-header">
                    <h3 class="card-title">${item.name}</h3>
                    <span class="badge ${item.badgeClass}">${item.category}</span>
                </div>
                <div class="bin-indicator ${item.binTheme}">
                    🗑️ ${item.bin.split('(')[0]}
                </div>
                <p class="card-description">${item.instruction}</p>
                <div class="card-footer-btn">
                    <span>View Disposal Steps</span> &rarr;
                </div>
            </div>
        `;

        resultsGrid.appendChild(card);
    });
}

/**
 * Modal Window Control Functions
 */
function openModal(item) {
    modalTitle.textContent = item.name;
    modalBadge.textContent = item.category;
    modalBadge.className = `badge ${item.badgeClass}`;
    
    modalBinIndicator.textContent = `🗑️ Target Disposal: ${item.bin}`;
    modalBinIndicator.className = `bin-indicator ${item.binTheme}`;

    modalInstruction.textContent = item.instruction;

    itemModal.classList.add("active");
    document.body.style.overflow = "hidden"; // Prevent background scroll
}

function closeModal() {
    itemModal.classList.remove("active");
    document.body.style.overflow = "auto";
}