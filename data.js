/**
 * EcoScan Static Database
 * Category Options: "Dry Waste", "Wet Waste", "Hazardous", "E-Waste"
 * Bin Themes: "blue", "green", "red", "amber"
 */
const wasteDatabase = [
    {
        id: 1,
        name: "Plastic Water Bottle",
        category: "Dry Waste",
        bin: "Blue Bin (Recyclable Dry Waste)",
        binTheme: "blue",
        badgeClass: "badge-dry",
        emoji: "🍾",
        // IMAGE PLACEHOLDER: Replace URL with local file path, e.g. "images/plastic_bottle.jpg"
        imageSrc: "https://placehold.co/400x200/e0f2fe/0284c7?text=Plastic+Water+Bottle",
        keywords: ["plastic", "pet bottle", "container", "blue bin", "recycle"],
        instruction: "Empty residual liquid, rinse thoroughly with clean water, crush flat to conserve space, and screw the cap back on before binning."
    },
    {
        id: 2,
        name: "Vegetable & Fruit Peels",
        category: "Wet Waste",
        bin: "Green Bin (Organic / Biodegradable)",
        binTheme: "green",
        badgeClass: "badge-wet",
        emoji: "🍌",
        // IMAGE PLACEHOLDER: Replace URL with local file path, e.g. "images/fruit_peels.jpg"
        imageSrc: "https://placehold.co/400x200/dcfce7/16a34a?text=Fruit+%26+Vegetable+Peels",
        keywords: ["organic", "kitchen", "compost", "food", "green bin", "banana"],
        instruction: "Collect without plastic wrapping. Drain liquid contents. Ideal for home composting or municipal organic waste pickup."
    },
    {
        id: 3,
        name: "AA / AAA Household Batteries",
        category: "Hazardous",
        bin: "Red Bin (Domestic Hazardous Waste)",
        binTheme: "red",
        badgeClass: "badge-haz",
        emoji: "🔋",
        // IMAGE PLACEHOLDER: Replace URL with local file path, e.g. "images/batteries.jpg"
        imageSrc: "https://placehold.co/400x200/fee2e2/dc2626?text=AA+AAA+Batteries",
        keywords: ["battery", "chemical", "cell", "alkaline", "toxic", "red bin"],
        instruction: "Contains toxic heavy metals and chemicals. Store in a dry box and hand over to registered hazardous waste collection drives."
    },
    {
        id: 4,
        name: "Cardboard Packaging Box",
        category: "Dry Waste",
        bin: "Blue Bin (Recyclable Dry Waste)",
        binTheme: "blue",
        badgeClass: "badge-dry",
        emoji: "📦",
        // IMAGE PLACEHOLDER: Replace URL with local file path, e.g. "images/cardboard.jpg"
        imageSrc: "https://placehold.co/400x200/e0f2fe/0284c7?text=Cardboard+Box",
        keywords: ["paper", "carton", "amazon box", "packaging", "blue bin"],
        instruction: "Remove plastic packing tapes and shipping labels. Flatten cardboard completely to ensure it stays dry inside the bin."
    },
    {
        id: 5,
        name: "Leftover Cooked Food",
        category: "Wet Waste",
        bin: "Green Bin (Organic / Biodegradable)",
        binTheme: "green",
        badgeClass: "badge-wet",
        emoji: "🍲",
        // IMAGE PLACEHOLDER: Replace URL with local file path, e.g. "images/cooked_food.jpg"
        imageSrc: "https://placehold.co/400x200/dcfce7/16a34a?text=Leftover+Food",
        keywords: ["curry", "rice", "kitchen", "wet waste", "compost", "green bin"],
        instruction: "Strain liquid gravies into drains prior to disposal to prevent foul odor and flies in organic collection bins."
    },
    {
        id: 6,
        name: "Old Smartphone / Tablet",
        category: "E-Waste",
        bin: "Yellow / Amber Bin (Electronic Waste)",
        binTheme: "amber",
        badgeClass: "badge-ewaste",
        emoji: "📱",
        // IMAGE PLACEHOLDER: Replace URL with local file path, e.g. "images/smartphone.jpg"
        imageSrc: "https://placehold.co/400x200/fef3c7/d97706?text=Old+Smartphone",
        keywords: ["mobile", "phone", "gadget", "electronics", "circuit", "e-waste"],
        instruction: "Perform a complete factory reset, remove SIM/SD cards, and drop off at certified electronic recycling bins or centers."
    },
    {
        id: 7,
        name: "Glass Bottle / Container",
        category: "Dry Waste",
        bin: "Blue Bin (Recyclable Dry Waste)",
        binTheme: "blue",
        badgeClass: "badge-dry",
        emoji: "🍾",
        // IMAGE PLACEHOLDER: Replace URL with local file path, e.g. "images/glass_jar.jpg"
        imageSrc: "https://placehold.co/400x200/e0f2fe/0284c7?text=Glass+Bottle",
        keywords: ["glass", "jar", "pickle jar", "blue bin", "recycle"],
        instruction: "Rinse food residues clean. If broken, wrap securely in thick paper before disposal to safeguard municipal waste collectors."
    },
    {
        id: 8,
        name: "Expired Medicines & Pills",
        category: "Hazardous",
        bin: "Red Bin (Domestic Hazardous Waste)",
        binTheme: "red",
        badgeClass: "badge-haz",
        emoji: "💊",
        // IMAGE PLACEHOLDER: Replace URL with local file path, e.g. "images/medicines.jpg"
        imageSrc: "https://placehold.co/400x200/fee2e2/dc2626?text=Expired+Medicines",
        keywords: ["pharma", "tablets", "drugs", "medical", "red bin", "hazardous"],
        instruction: "Never flush medicines down sinks or toilets to protect water tables. Keep in original packaging and bring to medical collection drives."
    },
    {
        id: 9,
        name: "Used Tea Bags & Coffee Grounds",
        category: "Wet Waste",
        bin: "Green Bin (Organic / Biodegradable)",
        binTheme: "green",
        badgeClass: "badge-wet",
        emoji: "☕",
        // IMAGE PLACEHOLDER: Replace URL with local file path, e.g. "images/tea_bags.jpg"
        imageSrc: "https://placehold.co/400x200/dcfce7/16a34a?text=Tea+Bags",
        keywords: ["tea", "coffee", "organic", "green bin", "compost"],
        instruction: "Remove metal staple pins or synthetic tags before throwing tea bags into organic compost bins."
    },
    {
        id: 10,
        name: "Aluminum Beverage Can",
        category: "Dry Waste",
        bin: "Blue Bin (Recyclable Dry Waste)",
        binTheme: "blue",
        badgeClass: "badge-dry",
        emoji: "🥤",
        // IMAGE PLACEHOLDER: Replace URL with local file path, e.g. "images/aluminum_can.jpg"
        imageSrc: "https://placehold.co/400x200/e0f2fe/0284c7?text=Aluminum+Can",
        keywords: ["soda", "coke", "metal", "tin", "aluminum", "blue bin"],
        instruction: "Rinse out sticky sugary liquid, crush the can flat, and place inside the recyclable dry waste bin."
    },
    {
        id: 11,
        name: "Sanitary Diapers / Wipes",
        category: "Hazardous",
        bin: "Red Bin (Biomedical Hazardous)",
        binTheme: "red",
        badgeClass: "badge-haz",
        emoji: "🩹",
        // IMAGE PLACEHOLDER: Replace URL with local file path, e.g. "images/diaper.jpg"
        imageSrc: "https://placehold.co/400x200/fee2e2/dc2626?text=Sanitary+Waste",
        keywords: ["diaper", "wipes", "sanitary", "medical", "red bin", "hazardous"],
        instruction: "Wrap securely in newspaper or trash bags. Mark clearly with a red cross mark for dedicated biomedical incinerator collection."
    },
    {
        id: 12,
        name: "CFL Light Bulb / Tube",
        category: "E-Waste",
        bin: "Yellow / Amber Bin (Hazardous E-Waste)",
        binTheme: "amber",
        badgeClass: "badge-ewaste",
        emoji: "💡",
        // IMAGE PLACEHOLDER: Replace URL with local file path, e.g. "images/cfl_bulb.jpg"
        imageSrc: "https://placehold.co/400x200/fef3c7/d97706?text=CFL+Light+Bulb",
        keywords: ["bulb", "mercury", "light", "tube", "electronics", "e-waste"],
        instruction: "Contains hazardous mercury vapor. Handle with care to prevent breakage. Return to electronic store drop-off boxes."
    }
];