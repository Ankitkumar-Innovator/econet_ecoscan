/**
 * EcoScan Integrated Plastic Deposit & Coupon Engine (`plastic-coupon.js`)
 */

document.addEventListener("DOMContentLoaded", () => {
    const openPlasticCouponBtn = document.getElementById("openPlasticCouponBtn");
    const wasteHomeView = document.getElementById("wasteHomeView");
    const recycleSection = document.getElementById("recycleSection");
    const plasticCouponSection = document.getElementById("plasticCouponSection");

    // View Switching Logic to match your app structure
    if (openPlasticCouponBtn) {
        openPlasticCouponBtn.addEventListener("click", () => {
            const isHidden = plasticCouponSection.classList.contains("hidden");
            // Hide all views first
            wasteHomeView.classList.add("hidden");
            if (recycleSection) recycleSection.classList.add("hidden");
            plasticCouponSection.classList.add("hidden");

            if (isHidden) {
                plasticCouponSection.classList.remove("hidden");
                openPlasticCouponBtn.style.background = "rgba(255, 255, 255, 0.3)";
            } else {
                wasteHomeView.classList.remove("hidden");
                openPlasticCouponBtn.style.background = "";
            }
        });
    }

    // Hook into existing recycle button to toggle views properly if needed
    const openRecycleBtn = document.getElementById("openRecycleBtn");
    if (openRecycleBtn) {
        openRecycleBtn.addEventListener("click", () => {
            plasticCouponSection.classList.add("hidden");
            if (openPlasticCouponBtn) openPlasticCouponBtn.style.background = "";
        });
    }

    const itemSelect = document.getElementById("item-type");
    const quantityInput = document.getElementById("quantity");
    const addBtn = document.getElementById("add-btn");
    const generateBtn = document.getElementById("generate-btn");
    const copyBtn = document.getElementById("copy-btn");
    const resetBtn = document.getElementById("reset-btn");

    const bagContainer = document.getElementById("bag-container");
    const bagList = document.getElementById("bag-list");
    const couponResult = document.getElementById("coupon-result");
    const lifetimeBadge = document.getElementById("lifetime-badge");

    if (!itemSelect || !addBtn) return; // Exit if elements aren't loaded

    const itemCatalog = {
        LAYS_5: { name: "Lay's / Kurkure Packet", plastic: "MLP", ratePerUnit: 0.50, weightGrams: 4 },
        THUMSUP_200: { name: "200ml Cold Drink Bottle", plastic: "PET", ratePerUnit: 1.00, weightGrams: 14 },
        WATER_1L: { name: "1L Water Bottle", plastic: "PET", ratePerUnit: 2.00, weightGrams: 25 },
        MILK_POUCH: { name: "500ml Milk Pouch", plastic: "LDPE", ratePerUnit: 1.00, weightGrams: 6 },
        SHAMPOO_BOTTLE: { name: "Shampoo / Detergent Bottle", plastic: "HDPE", ratePerUnit: 3.00, weightGrams: 45 }
    };

    let depositBag = {};
    let lifetimeCount = parseInt(localStorage.getItem("eco_lifetime_items") || "0", 10);
    updateLifetimeBadge();

    function updateLifetimeBadge() {
        if (lifetimeBadge) lifetimeBadge.innerText = `Lifetime: ${lifetimeCount} items`;
    }

    addBtn.addEventListener("click", () => {
        const key = itemSelect.value;
        const qty = parseInt(quantityInput.value, 10);

        if (!qty || qty < 1) {
            alert("Please enter at least 1 item.");
            return;
        }

        if (depositBag[key]) {
            depositBag[key] += qty;
        } else {
            depositBag[key] = qty;
        }

        quantityInput.value = 1;
        couponResult.classList.add("hidden");
        renderBag();
    });

    function renderBag() {
        bagList.innerHTML = "";
        const keys = Object.keys(depositBag);

        if (keys.length === 0) {
            bagContainer.classList.add("hidden");
            return;
        }

        bagContainer.classList.remove("hidden");

        let totalItems = 0;
        let totalRupees = 0;
        let totalWeight = 0;

        keys.forEach((key) => {
            const qty = depositBag[key];
            const item = itemCatalog[key];
            const subtotal = qty * item.ratePerUnit;
            const weight = qty * item.weightGrams;

            totalItems += qty;
            totalRupees += subtotal;
            totalWeight += weight;

            const li = document.createElement("li");
            li.className = "bag-item";
            li.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #fafafa; border: 1px solid #e0e0e0; padding: 8px 12px; border-radius: 6px; margin-bottom: 8px; font-size: 0.9rem;";
            li.innerHTML = `
                <div class="bag-item-info">
                    <strong>${qty}x ${item.name}</strong>
                    <small style="display:block; color:#666;">${item.plastic} | ${weight}g • ₹${subtotal.toFixed(2)}</small>
                </div>
                <button type="button" class="remove-btn" data-key="${key}" style="background: #ffebee; color: #c62828; border:none; padding:4px 8px; border-radius:4px; cursor:pointer;">Remove</button>
            `;
            bagList.appendChild(li);
        });

        const co2Saved = Math.round(totalWeight * 2.5);

        document.getElementById("total-items").innerText = totalItems;
        document.getElementById("total-reward").innerText = `₹${totalRupees.toFixed(2)}`;
        document.getElementById("plastic-saved").innerText = `${totalWeight}g`;
        document.getElementById("co2-saved").innerText = `${co2Saved}g`;

        document.querySelectorAll(".remove-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const removeKey = e.target.getAttribute("data-key");
                delete depositBag[removeKey];
                renderBag();
            });
        });
    }

    generateBtn.addEventListener("click", () => {
        const keys = Object.keys(depositBag);
        if (keys.length === 0) return;

        let totalItems = 0;
        let totalRupees = 0;
        let totalWeight = 0;

        keys.forEach((key) => {
            const qty = depositBag[key];
            const item = itemCatalog[key];
            totalItems += qty;
            totalRupees += qty * item.ratePerUnit;
            totalWeight += qty * item.weightGrams;
        });

        const co2Saved = Math.round(totalWeight * 2.5);
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        const couponCode = `ECOBAG-${totalItems}PC-₹${Math.round(totalRupees)}-${randomSuffix}`;

        lifetimeCount += totalItems;
        localStorage.setItem("eco_lifetime_items", lifetimeCount.toString());
        updateLifetimeBadge();

        document.getElementById("discount-text").innerText = `₹${totalRupees.toFixed(2)} Off (${totalItems} items)`;
        document.getElementById("final-eco-text").innerText = `Impact: ${totalWeight}g plastic & ${co2Saved}g CO₂ saved`;
        document.getElementById("coupon-code").innerText = couponCode;

        bagContainer.classList.add("hidden");
        couponResult.classList.remove("hidden");
        copyBtn.innerText = "Copy Code";

        // Integrate with your main app.js XP & Toast system!
        if (typeof addXp === "function") {
            addXp(20);
        }
        if (typeof showToast === "function") {
            showToast("🎟️ Combined Coupon Generated! +20 XP Earned!");
        }
    });

    copyBtn.addEventListener("click", () => {
        const codeText = document.getElementById("coupon-code").innerText;
        navigator.clipboard.writeText(codeText).then(() => {
            copyBtn.innerText = "Copied!";
            setTimeout(() => { copyBtn.innerText = "Copy Code"; }, 2000);
        }).catch(() => {
            alert("Copy failed: " + codeText);
        });
    });

    resetBtn.addEventListener("click", () => {
        depositBag = {};
        couponResult.classList.add("hidden");
        renderBag();
    });
});