document.addEventListener("DOMContentLoaded", () => {
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

  // Realistic weights and reward rates per unit
  const itemCatalog = {
    LAYS_5: {
      name: "Lay's / Kurkure Packet",
      plastic: "MLP",
      ratePerUnit: 0.50,
      weightGrams: 4 // ~4g per small snack wrapper
    },
    THUMSUP_200: {
      name: "200ml Cold Drink Bottle",
      plastic: "PET",
      ratePerUnit: 1.00,
      weightGrams: 14 // ~14g per 200ml PET bottle
    },
    WATER_1L: {
      name: "1L Water Bottle",
      plastic: "PET",
      ratePerUnit: 2.00,
      weightGrams: 25 // ~25g per 1L PET bottle
    },
    MILK_POUCH: {
      name: "500ml Milk Pouch",
      plastic: "LDPE",
      ratePerUnit: 1.00,
      weightGrams: 6 // ~6g per pouch
    },
    SHAMPOO_BOTTLE: {
      name: "Shampoo / Detergent Bottle",
      plastic: "HDPE",
      ratePerUnit: 3.00,
      weightGrams: 45 // ~45g per rigid HDPE bottle
    }
  };

  // State: current deposit bag & lifetime recycled counter
  let depositBag = {};
  let lifetimeCount = parseInt(localStorage.getItem("eco_lifetime_items") || "0", 10);
  updateLifetimeBadge();

  function updateLifetimeBadge() {
    lifetimeBadge.innerText = `Lifetime: ${lifetimeCount} items`;
  }

  // Add item to the deposit bag
  addBtn.addEventListener("click", () => {
    const key = itemSelect.value;
    const qty = parseInt(quantityInput.value, 10);

    if (!qty || qty < 1) {
      alert("Please enter at least 1 item.");
      return;
    }

    // Merge if item already exists in bag
    if (depositBag[key]) {
      depositBag[key] += qty;
    } else {
      depositBag[key] = qty;
    }

    quantityInput.value = 1; // Reset input back to 1
    couponResult.classList.add("hidden");
    renderBag();
  });

  // Render bag UI and calculate totals
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
      li.innerHTML = `
        <div class="bag-item-info">
          <strong>${qty}x ${item.name}</strong>
          <small>${item.plastic} • ${weight}g • ₹${subtotal.toFixed(2)}</small>
        </div>
        <button type="button" class="remove-btn" data-key="${key}">Remove</button>
      `;
      bagList.appendChild(li);
    });

    // ~2.5g CO2 saved per 1g of recycled plastic
    const co2Saved = Math.round(totalWeight * 2.5);

    document.getElementById("total-items").innerText = totalItems;
    document.getElementById("total-reward").innerText = `₹${totalRupees.toFixed(2)}`;
    document.getElementById("plastic-saved").innerText = `${totalWeight}g`;
    document.getElementById("co2-saved").innerText = `${co2Saved}g`;

    // Attach remove handlers
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const removeKey = e.target.getAttribute("data-key");
        delete depositBag[removeKey];
        renderBag();
      });
    });
  }

  // Generate combined coupon
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

    // Update lifetime counter in localStorage
    lifetimeCount += totalItems;
    localStorage.setItem("eco_lifetime_items", lifetimeCount.toString());
    updateLifetimeBadge();

    // Display final coupon
    document.getElementById("discount-text").innerText = `₹${totalRupees.toFixed(2)} Off (${totalItems} items)`;
    document.getElementById("final-eco-text").innerText = `Impact: ${totalWeight}g plastic & ${co2Saved}g CO₂ saved`;
    document.getElementById("coupon-code").innerText = couponCode;

    bagContainer.classList.add("hidden");
    couponResult.classList.remove("hidden");
    copyBtn.innerText = "Copy Code";
  });

  // Copy coupon to clipboard
  copyBtn.addEventListener("click", () => {
    const codeText = document.getElementById("coupon-code").innerText;
    navigator.clipboard.writeText(codeText).then(() => {
      copyBtn.innerText = "Copied!";
      setTimeout(() => {
        copyBtn.innerText = "Copy Code";
      }, 2000);
    }).catch(() => {
      alert("Copy failed. Please copy manually: " + codeText);
    });
  });

  // Start a new deposit bag
  resetBtn.addEventListener("click", () => {
    depositBag = {};
    couponResult.classList.add("hidden");
    renderBag();
  });
});
