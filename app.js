/**
 * EcoScan Application Engine (`app.js`)
 * Enhanced with realistic dummy data & stream-aware live metrics for presentations.
 */

let currentSearchTerm = "";
let currentCategoryFilter = "All";
let currentFactIndex = 0;
let currentRank = "🌱 Rookie Sorter";

let userXp = parseInt(localStorage.getItem("ecoscan_xp")) || 140;
let userStreak = parseInt(localStorage.getItem("ecoscan_streak")) || 5;
let userName = localStorage.getItem("ecoscan_username") || "EcoPresentor";
let userStream = localStorage.getItem("ecoscan_stream") || "CSE";

// Dummy data injected for streams to look active and realistic during live presentations
let defaultStreamData = [
    { stream: "CSE", name: "Computer Science", totalXp: 1250, activeUsers: 24, icon: "💻" },
    { stream: "ECE", name: "Electronics & Comm.", totalXp: 980, activeUsers: 18, icon: "⚡" },
    { stream: "MECH", name: "Mechanical Eng.", totalXp: 850, activeUsers: 15, icon: "⚙️" },
    { stream: "EE", name: "Electrical Eng.", totalXp: 720, activeUsers: 12, icon: "🔌" },
    { stream: "CIVIL", name: "Civil Engineering", totalXp: 640, activeUsers: 10, icon: "🏗️" }
];

// Pre-populated initial campus nodes to make scanning/testing robust during live demo
let defaultBinsRegistry = [
    { location: "Block A - Main Lobby", stream: "CSE", status: "Live Active IoT Node (100% Operational)" },
    { location: "Library Reading Hall", stream: "ECE", status: "Live Active IoT Node (100% Operational)" },
    { location: "Cafeteria Quad", stream: "MECH", status: "Live Active IoT Node (100% Operational)" }
];

let streamLeaderboardData = JSON.parse(localStorage.getItem("ecoscan_leaderboard")) || defaultStreamData;
let campusBinsRegistry = JSON.parse(localStorage.getItem("ecoscan_bins")) || defaultBinsRegistry;

let storedWasteDb = JSON.parse(localStorage.getItem("ecoscan_waste_db"));
if (storedWasteDb && Array.isArray(storedWasteDb) && typeof wasteDatabase !== "undefined") {
    wasteDatabase = storedWasteDb;
}

const GITHUB_PAGES_BASE_URL = "https://ankitkumar-innovator.github.io/econet_ecoscan/";

document.addEventListener("DOMContentLoaded", () => {
    searchInput = document.getElementById("searchInput");
    resultsGrid = document.getElementById("resultsGrid");
    noResults = document.getElementById("noResults");
    filterPills = document.querySelectorAll(".pill");
    factTicker = document.getElementById("factTicker");
    userXpSpan = document.getElementById("userXp");
    userRankSpan = document.getElementById("userRank");
    userStreakCountSpan = document.getElementById("userStreakCount");

    userDisplayNameSpan = document.getElementById("userDisplayName");
    userStreamTagSpan = document.getElementById("userStreamTag");
    profileEditBtn = document.getElementById("profileEditBtn");
    profileModal = document.getElementById("profileModal");
    closeProfile = document.getElementById("closeProfile");
    profileForm = document.getElementById("profileForm");
    userNameInput = document.getElementById("userNameInput");
    userStreamSelect = document.getElementById("userStreamSelect");

    itemModal = document.getElementById("itemModal");
    closeModal = document.getElementById("closeModal");
    modalBody = document.getElementById("modalBody");
    xpBadge = document.getElementById("xpBadge");
    toastNotification = document.getElementById("toastNotification");
    toastText = document.getElementById("toastText");

    openBinScannerBtn = document.getElementById("openBinScannerBtn");
    binScannerModal = document.getElementById("binScannerModal");
    closeBinScanner = document.getElementById("closeBinScanner");
    dynamicBinListContainer = document.getElementById("dynamicBinListContainer");
    binStationResult = document.getElementById("binStationResult");

    openRegisterBinBtn = document.getElementById("openRegisterBinBtn");
    registerBinModal = document.getElementById("registerBinModal");
    closeRegisterBin = document.getElementById("closeRegisterBin");
    qrGeneratorForm = document.getElementById("qrGeneratorForm");
    qrPreviewArea = document.getElementById("qrPreviewArea");
    qrImageContainer = document.getElementById("qrImageContainer");
    qrDetailsText = document.getElementById("qrDetailsText");
    downloadQrBtn = document.getElementById("downloadQrBtn");

    openLeaderboardBtn = document.getElementById("openLeaderboardBtn");
    leaderboardModal = document.getElementById("leaderboardModal");
    closeLeaderboard = document.getElementById("closeLeaderboard");
    leaderboardList = document.getElementById("leaderboardList");

    if (userDisplayNameSpan) userDisplayNameSpan.textContent = userName;
    if (userStreamTagSpan) userStreamTagSpan.textContent = userStream;
    if (userXpSpan) userXpSpan.textContent = userXp;
    if (userStreakCountSpan) userStreakCountSpan.textContent = userStreak;
    updateRankDisplay();

    initTicker();
    filterAndRender();
    checkUrlForScannedNode();

    // Dynamically insert Admin Portal button cleanly into the navbar actions group
    const navActionsGroup = document.querySelector(".nav-actions-group");
    if (navActionsGroup) {
        const adminBtn = document.createElement("button");
        adminBtn.className = "nav-utility-btn admin-lock-btn";
        adminBtn.innerHTML = "🛠️ Admin Portal";
        adminBtn.title = "Secure Admin Panel";
        adminBtn.addEventListener("click", () => {
            document.getElementById("adminLoginModal").classList.remove("hidden");
        });
        navActionsGroup.appendChild(adminBtn);
    }

    const adminLoginModal = document.getElementById("adminLoginModal");
    const closeAdminLogin = document.getElementById("closeAdminLogin");
    const adminLoginForm = document.getElementById("adminLoginForm");
    const adminDashboardModal = document.getElementById("adminDashboardModal");
    const closeAdminDashboard = document.getElementById("closeAdminDashboard");

    if (closeAdminLogin) closeAdminLogin.addEventListener("click", () => adminLoginModal.classList.add("hidden"));
    if (closeAdminDashboard) closeAdminDashboard.addEventListener("click", () => adminDashboardModal.classList.add("hidden"));

    if (adminLoginForm) {
        adminLoginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const passkey = document.getElementById("adminPasskey").value.trim();
            if (passkey === "ecoscan_admin") {
                adminLoginModal.classList.add("hidden");
                document.getElementById("adminPasskey").value = "";
                adminDashboardModal.classList.remove("hidden");
                showToast("🔓 Admin Access Granted!");
            } else {
                alert("❌ Incorrect Passkey!");
            }
        });
    }

    // Admin Tabs Switching
    const tabAddWaste = document.getElementById("tabAddWaste");
    const tabManageBins = document.getElementById("tabManageBins");
    const tabManageWaste = document.getElementById("tabManageWaste");
    
    const adminWasteFormContainer = document.getElementById("adminWasteFormContainer");
    const adminBinsListContainer = document.getElementById("adminBinsListContainer");
    const adminWasteListContainer = document.getElementById("adminWasteListContainer");

    if (tabAddWaste && tabManageBins && tabManageWaste) {
        tabAddWaste.addEventListener("click", () => {
            tabAddWaste.classList.add("active");
            tabManageBins.classList.remove("active");
            tabManageWaste.classList.remove("active");
            adminWasteFormContainer.classList.remove("hidden");
            adminBinsListContainer.classList.add("hidden");
            adminWasteListContainer.classList.add("hidden");
        });

        tabManageBins.addEventListener("click", () => {
            tabManageBins.classList.add("active");
            tabAddWaste.classList.remove("active");
            tabManageWaste.classList.remove("active");
            adminBinsListContainer.classList.remove("hidden");
            adminWasteFormContainer.classList.add("hidden");
            adminWasteListContainer.classList.add("hidden");
            renderAdminBinsList();
        });

        tabManageWaste.addEventListener("click", () => {
            tabManageWaste.classList.add("active");
            tabAddWaste.classList.remove("active");
            tabManageBins.classList.remove("active");
            adminWasteListContainer.classList.remove("hidden");
            adminWasteFormContainer.classList.add("hidden");
            adminBinsListContainer.classList.add("hidden");
            renderAdminWasteList();
        });
    }

    const adminNewItemForm = document.getElementById("adminNewItemForm");
    if (adminNewItemForm) {
        adminNewItemForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("adminItemName").value.trim();
            const category = document.getElementById("adminItemCategory").value;
            const bin = document.getElementById("adminItemBin").value.trim();
            const instruction = document.getElementById("adminItemInstruction").value.trim();

            let badgeClass = "badge-dry";
            let binTheme = "blue";
            if (category === "Wet Waste") { badgeClass = "badge-wet"; binTheme = "green"; }
            else if (category === "Hazardous") { badgeClass = "badge-haz"; binTheme = "red"; }
            else if (category === "E-Waste") { badgeClass = "badge-ewaste"; binTheme = "amber"; }

            const newItem = {
                id: Date.now(),
                name: name,
                category: category,
                bin: bin,
                binTheme: binTheme,
                badgeClass: badgeClass,
                emoji: "♻️",
                imageSrc: "https://placehold.co/400x200/e2e8f0/475569?text=" + encodeURIComponent(name),
                keywords: name.toLowerCase().split(" "),
                instruction: instruction
            };

            wasteDatabase.unshift(newItem);
            localStorage.setItem("ecoscan_waste_db", JSON.stringify(wasteDatabase));
            
            adminNewItemForm.reset();
            adminDashboardModal.classList.add("hidden");
            filterAndRender();
            showToast("✨ New Waste Item Published Successfully!");
        });
    }

    if (profileEditBtn && profileModal) {
        profileEditBtn.addEventListener("click", () => {
            if (userNameInput) userNameInput.value = userName;
            if (userStreamSelect) userStreamSelect.value = userStream;
            profileModal.classList.remove("hidden");
        });
    }

    if (closeProfile && profileModal) {
        closeProfile.addEventListener("click", () => profileModal.classList.add("hidden"));
    }

    if (profileForm) {
        profileForm.addEventListener("submit", (e) => {
            e.preventDefault();
            userName = userNameInput.value.trim() || "Student";
            userStream = userStreamSelect.value;

            localStorage.setItem("ecoscan_username", userName);
            localStorage.setItem("ecoscan_stream", userStream);

            if (userDisplayNameSpan) userDisplayNameSpan.textContent = userName;
            if (userStreamTagSpan) userStreamTagSpan.textContent = userStream;
            
            profileModal.classList.add("hidden");
            showToast(`👤 Profile Saved! Representing ${userStream}`);
            renderLeaderboard();
        });
    }

    searchInput.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        if (val.length === 1 && (val === "." || val === "," || val === "-")) return;
        currentSearchTerm = val.toLowerCase();
        filterAndRender();
    });

    filterPills.forEach((pill) => {
        pill.addEventListener("click", () => {
            filterPills.forEach((p) => p.classList.remove("active"));
            pill.classList.add("active");
            currentCategoryFilter = pill.getAttribute("data-category");
            filterAndRender();
        });
    });

    closeModal.addEventListener("click", closeModalWindow);
    itemModal.addEventListener("click", (e) => {
        if (e.target === itemModal) closeModalWindow();
    });

    if (openBinScannerBtn && binScannerModal) {
        openBinScannerBtn.addEventListener("click", () => {
            renderBinScannerNodes();
            binScannerModal.classList.remove("hidden");
            if (binStationResult) binStationResult.classList.add("hidden");
        });
    }

    if (closeBinScanner && binScannerModal) {
        closeBinScanner.addEventListener("click", () => binScannerModal.classList.add("hidden"));
    }

    if (openLeaderboardBtn && leaderboardModal) {
        openLeaderboardBtn.addEventListener("click", () => {
            renderLeaderboard();
            leaderboardModal.classList.remove("hidden");
        });
    }

    if (closeLeaderboard && leaderboardModal) {
        closeLeaderboard.addEventListener("click", () => leaderboardModal.classList.add("hidden"));
    }

    if (openRegisterBinBtn && registerBinModal) {
        openRegisterBinBtn.addEventListener("click", () => registerBinModal.classList.remove("hidden"));
    }

    if (closeRegisterBin && registerBinModal) {
        closeRegisterBin.addEventListener("click", () => registerBinModal.classList.add("hidden"));
    }

    if (qrGeneratorForm) {
        qrGeneratorForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const location = document.getElementById("nodeLocationInput").value.trim();
            const stream = document.getElementById("nodeStreamSelect").value;

            campusBinsRegistry.push({
                location: location,
                stream: stream,
                status: "Live Active IoT Node (100% Operational)"
            });
            localStorage.setItem("ecoscan_bins", JSON.stringify(campusBinsRegistry));

            const stationPayload = `${GITHUB_PAGES_BASE_URL}?node=${encodeURIComponent(location)}&stream=${encodeURIComponent(stream)}&challenge=active`;
            const qrApiUrl = `https://quickchart.io/qr?text=${encodeURIComponent(stationPayload)}&size=200&margin=1`;

            if (qrImageContainer) {
                qrImageContainer.innerHTML = `
                    <div id="printableEcoStickerCard" style="background: linear-gradient(135deg, #1b4332, #2d6a4f); color: white; padding: 24px; border-radius: 16px; text-align: center; max-width: 320px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); margin: 0 auto;">
                        <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.85; margin-bottom: 4px;">🌿 Green Campus Mission 2026</div>
                        <div style="font-size: 1.4rem; font-weight: 800; margin-bottom: 4px; letter-spacing: -0.5px;">🌱 EcoScan Smart Bin</div>
                        <div style="font-size: 0.9rem; opacity: 0.95; margin-bottom: 14px; font-weight: 600;">📍 ${location}</div>
                        <div style="background: white; padding: 14px; border-radius: 12px; display: inline-block; margin-bottom: 14px;">
                            <img src="${qrApiUrl}" alt="Station QR Code" style="width: 160px; height: 160px; display: block;" />
                        </div>
                        <div style="font-size: 0.95rem; font-weight: bold; color: #bbf7d0; margin-bottom: 6px;">🚀 SCAN TO SORT & EARN +25 XP!</div>
                        <div style="font-size: 0.8rem; opacity: 0.9; margin-bottom: 10px; background: rgba(255,255,255,0.15); padding: 4px 8px; border-radius: 6px; display: inline-block;">Target Stream: <strong>${stream}</strong></div>
                        <p style="font-size: 0.78rem; line-height: 1.4; opacity: 0.9; margin-bottom: 10px;">
                            Join our college sustainability initiative! Help your department win the green leaderboard crown.
                        </p>
                        <div style="font-size: 0.7rem; opacity: 0.75; border-top: 1px dashed rgba(255,255,255,0.3); padding-top: 8px;">
                            EVS Project Innovation • Zero Waste Campus Mission
                        </div>
                    </div>
                `;
            }

            if (qrDetailsText) {
                qrDetailsText.innerHTML = `<strong>Node:</strong> ${location} <br/> <strong>Stream:</strong> ${stream} <br/><span style="color: #16a34a; font-weight: bold;">🎯 Printable 1-Page Eco-Sticker Card Ready!</span>`;
            }
            
            if (qrPreviewArea) qrPreviewArea.classList.remove("hidden");
            addXp(10);
            showToast("✨ Printable Mission Poster Generated & Synced!");

            if (downloadQrBtn) {
                downloadQrBtn.onclick = () => {
                    const printWindow = window.open('', '_blank');
                    const cardHtml = document.getElementById('printableEcoStickerCard').outerHTML;
                    printWindow.document.write(`
                        <html>
                            <head>
                                <title>EcoScan Mission Card - ${location}</title>
                                <style>
                                    body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #f0fdf4; font-family: sans-serif; }
                                    @media print { body { background: white; } }
                                </style>
                            </head>
                            <body>
                                ${cardHtml}
                                <script>
                                    window.onload = function() { window.print(); window.close(); }
                                </script>
                            </body>
                        </html>
                    `);
                    printWindow.document.close();
                };
            }
        });
    }
});

function renderAdminBinsList() {
    const container = document.getElementById("adminActiveBinsList");
    if (!container) return;
    container.innerHTML = "";

    if (campusBinsRegistry.length === 0) {
        container.innerHTML = `<p style="font-size: 0.88rem; color: #64748b; text-align: center; padding: 12px;">No active campus bins registered yet. Use the Register Bin QR tool to add nodes.</p>`;
        return;
    }

    campusBinsRegistry.forEach((bin, idx) => {
        const row = document.createElement("div");
        row.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0;";
        row.innerHTML = `
            <div>
                <strong style="font-size: 0.9rem; color: #1e293b;">📍 ${bin.location}</strong>
                <div style="font-size: 0.75rem; color: #64748b;">${bin.stream}</div>
            </div>
            <button onclick="deleteCampusBin(${idx})" style="background: #fee2e2; color: #991b1b; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">
                🗑️ Delete
            </button>
        `;
        container.appendChild(row);
    });
}

function deleteCampusBin(index) {
    campusBinsRegistry.splice(index, 1);
    localStorage.setItem("ecoscan_bins", JSON.stringify(campusBinsRegistry));
    renderAdminBinsList();
    showToast("🗑️ Bin Node Deleted");
}

function renderLeaderboard() {
    if (!leaderboardList) return;
    leaderboardList.innerHTML = "";

    streamLeaderboardData.sort((a, b) => b.totalXp - a.totalXp);

    streamLeaderboardData.forEach((item, index) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅";
        const row = document.createElement("div");
        row.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px 16px; border-radius: 10px; border: 1px solid #e2e8f0;";
        
        row.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.2rem;">${medal}</span>
                <div style="text-align: left;">
                    <strong style="color: #1e293b; font-size: 0.95rem;">${item.icon} ${item.name} (${item.stream})</strong>
                    <div style="font-size: 0.78rem; color: #64748b;">${item.activeUsers} Active Sorters • 🔥 Day ${userStreak} Streak</div>
                </div>
            </div>
            <div style="font-weight: 800; color: #2e7d32; font-size: 1.05rem;">
                ${item.totalXp} XP
            </div>
        `;

        leaderboardList.appendChild(row);
    });
}

function checkUrlForScannedNode() {
    const urlParams = new URLSearchParams(window.location.search);
    const scannedNode = urlParams.get("node");
    const scannedStream = urlParams.get("stream");

    if (scannedNode && scannedStream) {
        setTimeout(() => {
            openScannedChallengeModal(scannedNode, scannedStream);
            addXp(30);
            userStreak += 1;
            localStorage.setItem("ecoscan_streak", userStreak);
            if (userStreakCountSpan) userStreakCountSpan.textContent = userStreak;
        }, 600);
    }
}

function openScannedChallengeModal(nodeName, streamType) {
    if (!itemModal || !modalBody) return;

    modalBody.innerHTML = `
        <div style="background: linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%); border-radius: 14px; padding: 28px 20px; text-align: center; color: #ffffff; margin-bottom: 20px; box-shadow: 0 10px 25px rgba(45, 106, 79, 0.3);">
            <h2 style="font-size: 2rem; font-weight: 800; margin-bottom: 6px;">🎯 Campus Eco-Challenge!</h2>
            <p style="font-size: 0.95rem; opacity: 0.95;">You've successfully connected to a smart station node.</p>
        </div>

        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 12px; margin-bottom: 16px; text-align: left;">
            <p style="font-size: 1rem; color: #166534; margin-bottom: 6px;"><strong>📍 Station Location:</strong> ${nodeName}</p>
            <p style="font-size: 1rem; color: #166534; margin-bottom: 6px;"><strong>♻️ Target Waste Stream:</strong> ${streamType}</p>
            <p style="font-size: 0.9rem; color: #15803d; margin-top: 8px;">🔥 <strong>Streak Active:</strong> Day ${userStreak} Clean Streak Maintained for ${userStream} Department!</p>
        </div>

        <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; margin-bottom: 16px;">
            <h3 style="font-size: 1.1rem; color: #1e293b; margin-bottom: 6px;">🏆 Challenge Unlocked!</h3>
            <p style="font-size: 0.9rem; color: #475569; line-height: 1.5;">
                Sort your waste into the correct stream to earn <strong>+30 Bonus XP</strong> and boost the <strong>${userStream}</strong> department leaderboard rank!
            </p>
        </div>

        <button onclick="closeModalWindow()" style="width: 100%; background: #2e7d32; color: white; border: none; padding: 12px; border-radius: 10px; font-weight: bold; font-size: 1rem; cursor: pointer;">
            🚀 Accept Challenge & Start Sorting
        </button>
    `;

    itemModal.classList.remove("hidden");
}

function renderBinScannerNodes() {
    if (!dynamicBinListContainer) return;
    dynamicBinListContainer.innerHTML = "";

    if (campusBinsRegistry.length === 0) {
        dynamicBinListContainer.innerHTML = `<p style="font-size: 0.9rem; color: #64748b; text-align: center; padding: 12px;">No active campus bins registered yet. Register a bin node first.</p>`;
        return;
    }

    campusBinsRegistry.forEach((bin) => {
        const btn = document.createElement("button");
        btn.className = "bin-station-btn";
        btn.innerHTML = `📍 ${bin.location} <span style="font-size: 0.75rem; float: right; opacity: 0.7; color: #16a34a;">(${bin.stream})</span>`;
        
        btn.addEventListener("click", () => {
            if (binStationResult) {
                binStationResult.innerHTML = `
                    <strong style="display: block; font-size: 1rem; margin-bottom: 4px;">✅ Station Verified Successfully!</strong>
                    <p style="font-size: 0.9rem; margin-bottom: 6px;"><strong>Location:</strong> ${bin.location}</p>
                    <p style="font-size: 0.9rem; margin-bottom: 6px;"><strong>Bin Routing:</strong> ${bin.stream}</p>
                    <p style="font-size: 0.9rem; color: #15803d;"><strong>IoT Sensor Status:</strong> ${bin.status}</p>
                    <div style="margin-top: 10px; font-weight: bold; color: #0284c7;">🚀 +25 Enterprise Audit XP & Streak Updated!</div>
                `;
                binStationResult.classList.remove("hidden");
            }
            userStreak += 1;
            localStorage.setItem("ecoscan_streak", userStreak);
            if (userStreakCountSpan) userStreakCountSpan.textContent = userStreak;
            
            addXp(25);
            showToast(`🌟 Bin Verified! Streak: Day ${userStreak} 🔥`);
            renderLeaderboard();
        });

        dynamicBinListContainer.appendChild(btn);
    });
}

function initTicker() {
    if (typeof shockFacts === "undefined" || !factTicker || shockFacts.length === 0) return;
    factTicker.textContent = shockFacts[currentFactIndex];

    setInterval(() => {
        factTicker.classList.add("fade-out");
        setTimeout(() => {
            currentFactIndex = (currentFactIndex + 1) % shockFacts.length;
            factTicker.textContent = shockFacts[currentFactIndex];
            factTicker.classList.remove("fade-out");
            factTicker.classList.add("fade-in");
            setTimeout(() => factTicker.classList.remove("fade-in"), 500);
        }, 500);
    }, 4000);
}

function addXp(amount) {
    userXp += amount;
    localStorage.setItem("ecoscan_xp", userXp);
    if (userXpSpan) userXpSpan.textContent = userXp;

    const targetStream = streamLeaderboardData.find(s => s.stream === userStream);
    if (targetStream) {
        targetStream.totalXp += amount;
        localStorage.setItem("ecoscan_leaderboard", JSON.stringify(streamLeaderboardData));
    }

    if (xpBadge) {
        xpBadge.classList.add("pulse");
        setTimeout(() => xpBadge.classList.remove("pulse"), 400);
    }

    updateRankDisplay();
}

function updateRankDisplay() {
    let newRank = "🌱 Rookie Sorter";
    if (userXp >= 100) newRank = "🌍 Planet Protector";
    else if (userXp >= 40) newRank = "♻️ Eco-Warrior";

    if (newRank !== currentRank) {
        currentRank = newRank;
        if (userRankSpan) userRankSpan.textContent = currentRank;
        showToast(`🎉 Level Up! You're now a ${currentRank}!`);
    }
}

function showToast(message) {
    if (!toastNotification || !toastText) return;
    toastText.textContent = message;
    toastNotification.classList.remove("hidden");
    setTimeout(() => toastNotification.classList.add("hidden"), 3500);
}

function filterAndRender() {
    const dataset = typeof wasteDatabase !== "undefined" ? wasteDatabase : [];
    const filtered = dataset.filter((item) => {
        if (!currentSearchTerm) return currentCategoryFilter === "All" || item.category === currentCategoryFilter;
        const nameMatch = item.name.toLowerCase().includes(currentSearchTerm);
        const categoryMatch = item.category.toLowerCase().includes(currentSearchTerm);
        const binMatch = item.bin.toLowerCase().includes(currentSearchTerm);
        const instructionMatch = item.instruction.toLowerCase().includes(currentSearchTerm);
        const keywordMatch = Array.isArray(item.keywords) && item.keywords.some(kw => kw.toLowerCase().includes(currentSearchTerm));
        return (nameMatch || categoryMatch || binMatch || instructionMatch || keywordMatch) && (currentCategoryFilter === "All" || item.category === currentCategoryFilter);
    });
    renderItems(filtered);
}

function renderItems(items) {
    if (!resultsGrid) return;
    resultsGrid.innerHTML = "";
    if (items.length === 0) {
        if (noResults) noResults.classList.remove("hidden");
        return;
    }
    if (noResults) noResults.classList.add("hidden");

    items.forEach((item) => {
        const card = document.createElement("div");
        card.className = `card ${item.binTheme ? 'bin-' + item.binTheme : 'bin-blue'}`;
        card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${item.imageSrc}" alt="${item.name}" onerror="this.onerror=null; this.src='https://placehold.co/400x200/e2e8f0/475569?text=${encodeURIComponent(item.name)}';" />
            </div>
            <div>
                <div class="card-header">
                    <h3 class="card-title">${item.emoji || '♻️'} ${item.name}</h3>
                    <span class="badge ${item.badgeClass}">${item.category}</span>
                </div>
                <div class="bin-info">🗑️ ${item.bin}</div>
            </div>
            <div class="disposal-steps"><strong>Click to read safe disposal guide &rarr;</strong></div>
        `;
        card.addEventListener("click", () => {
            openItemModal(item);
            addXp(15);
        });
        resultsGrid.appendChild(card);
    });
}

function openItemModal(item) {
    if (!itemModal || !modalBody) return;
    const rawSteps = item.instruction.split('.').filter(step => step.trim().length > 0);
    let stepsHTML = '';
    rawSteps.forEach((stepText, index) => {
        stepsHTML += `<div class="timeline-step"><div class="timeline-number">${index + 1}</div><div class="timeline-text">${stepText.trim()}.</div></div>`;
    });

    modalBody.innerHTML = `
        <div class="modal-animated-banner">
            <h2 class="modal-animated-title">${item.emoji || '♻️'} ${item.name}</h2>
            <p style="font-size: 0.9rem; opacity: 0.9; margin-top: 6px; position: relative; z-index: 2;">Interactive Chronological Disposal Guide (+15 XP Earned)</p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span class="badge ${item.badgeClass}" style="font-size: 0.85rem; padding: 6px 12px;">${item.category}</span>
            <span style="font-weight: 600; font-size: 0.9rem; color: #475569;">Verified EVS Standard</span>
        </div>
        <p style="font-size: 1.1rem; font-weight: 700; color: #2e7d32; margin-bottom: 14px;">Recommended Bin: ${item.bin}</p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 16px;">
            <strong style="color: #1e293b; display: block; margin-bottom: 10px; font-size: 1rem;">🛡️ Step-by-Step Chronological Guide:</strong>
            <div class="timeline-container">${stepsHTML}</div>
        </div>
        <div class="modal-eco-box">
            <strong style="font-size: 0.95rem;">🌍 Why This Matters for a Greener Planet:</strong>
            <p style="margin-top: 6px; font-size: 0.9rem; line-height: 1.5;">By correctly sorting <strong>${item.name}</strong> into the right municipal stream, you actively prevent toxic ground seepage, reduce landfill overflow, and conserve raw materials for future generations.</p>
        </div>
    `;
    itemModal.classList.remove("hidden");
}

function closeModalWindow() {
    if (itemModal) itemModal.classList.add("hidden");
}

function renderAdminWasteList() {
    const container = document.getElementById("adminActiveWasteList");
    if (!container) return;
    container.innerHTML = "";

    const dataset = typeof wasteDatabase !== "undefined" ? wasteDatabase : [];

    if (dataset.length === 0) {
        container.innerHTML = `<p style="font-size: 0.88rem; color: #64748b; text-align: center; padding: 12px;">No waste items found in the active database.</p>`;
        return;
    }

    dataset.forEach((item, idx) => {
        const row = document.createElement("div");
        row.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 10px 14px; border-radius: 8px; border: 1px solid #e2e8f0;";
        row.innerHTML = `
            <div>
                <strong style="font-size: 0.9rem; color: #1e293b;">${item.emoji || '♻️'} ${item.name}</strong>
                <div style="font-size: 0.75rem; color: #64748b;">Category: ${item.category} | Bin: ${item.bin}</div>
            </div>
            <button onclick="deleteWasteItem(${idx})" style="background: #fee2e2; color: #991b1b; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 0.8rem;">
                🗑️ Delete
            </button>
        `;
        container.appendChild(row);
    });
}

function deleteWasteItem(index) {
    if (typeof wasteDatabase !== "undefined") {
        wasteDatabase.splice(index, 1);
        localStorage.setItem("ecoscan_waste_db", JSON.stringify(wasteDatabase));
        renderAdminWasteList();
        filterAndRender();
        showToast("🗑️ Waste Item Deleted Successfully!");
    }
}