// src/actions.js

// --- NEW: Categorized Actions Structure ---
export const CATEGORIZED_ACTIONS = {
  Preparation: [
    {
      id: "action-chop",
      name: "Chop",
      icon: "🔪",
      description: "Cut ingredients.",
      category: "Preparation",
    },
    {
      id: "action-slice",
      name: "Slice",
      icon: "🥒",
      description: "Cut into thin slices.",
      category: "Preparation",
    },
    {
      id: "action-dice",
      name: "Dice",
      icon: "🥕",
      description: "Cut into small cubes.",
      category: "Preparation",
    },
    {
      id: "action-grate",
      name: "Grate",
      icon: "🧀",
      description: "Shred ingredients.",
      category: "Preparation",
    },
    {
      id: "action-peel",
      name: "Peel",
      icon: "🥔",
      description: "Remove the skin.",
      category: "Preparation",
    },
    {
      id: "action-measure",
      name: "Measure",
      icon: "⚖️",
      description: "Obtain exact quantity.",
      category: "Preparation",
    },
    {
      id: "action-wash",
      name: "Wash",
      icon: "🧼",
      description: "Clean ingredients.",
      category: "Preparation",
    },
    {
      id: "action-mince",
      name: "Mince",
      icon: "🧄",
      description: "Cut very finely.",
      category: "Preparation",
    },
  ],
  Cooking: [
    {
      id: "action-mix",
      name: "Mix",
      icon: "🥣",
      description: "Combine ingredients.",
      category: "Cooking",
    },
    {
      id: "action-stir",
      name: "Stir",
      icon: "🥄",
      description: "Move utensil round.",
      category: "Cooking",
    },
    {
      id: "action-whisk",
      name: "Whisk",
      icon: "🥚",
      description: "Beat or stir quickly.",
      category: "Cooking",
    },
    {
      id: "action-heat",
      name: "Heat",
      icon: "🔥",
      description: "Apply heat.",
      category: "Cooking",
    },
    {
      id: "action-boil",
      name: "Boil",
      icon: "💧",
      description: "Heat liquid to boiling.",
      category: "Cooking",
    },
    {
      id: "action-simmer",
      name: "Simmer",
      icon: "🍲",
      description: "Cook below boiling.",
      category: "Cooking",
    },
    {
      id: "action-fry",
      name: "Fry",
      icon: "🍳",
      description: "Cook in hot fat/oil.",
      category: "Cooking",
    },
    {
      id: "action-saute",
      name: "Sauté",
      icon: "🍄",
      description: "Fry quickly in little fat.",
      category: "Cooking",
    },
    {
      id: "action-steam",
      name: "Steam",
      icon: "💨",
      description: "Cook with steam.",
      category: "Cooking",
    },
  ],
  Baking: [
    {
      id: "action-bake",
      name: "Bake",
      icon: "🍞",
      description: "Cook in oven.",
      category: "Baking",
    },
    {
      id: "action-roast",
      name: "Roast",
      icon: "🍗",
      description: "Cook with dry heat.",
      category: "Baking",
    },
    {
      id: "action-knead",
      name: "Knead",
      icon: "🤏",
      description: "Work dough.",
      category: "Baking",
    },
    {
      id: "action-proof",
      name: "Proof",
      icon: "⏳",
      description: "Allow dough to rise.",
      category: "Baking",
    },
    {
      id: "action-glaze",
      name: "Glaze",
      icon: "✨",
      description: "Apply a glaze.",
      category: "Baking",
    },
    {
      id: "action-grease",
      name: "Grease",
      icon: "🧈",
      description: "Coat with fat/oil.",
      category: "Baking",
    },
  ],
  Seasoning: [
    {
      id: "action-salt",
      name: "Salt",
      icon: "🧂",
      description: "Add salt.",
      category: "Seasoning",
    },
    {
      id: "action-pepper",
      name: "Pepper",
      icon: "🌶️",
      description: "Add pepper.",
      category: "Seasoning",
    },
    {
      id: "action-herb",
      name: "Herbs",
      icon: "🌿",
      description: "Add herbs.",
      category: "Seasoning",
    },
    {
      id: "action-spice",
      name: "Spices",
      icon: "🌶️",
      description: "Add spices.",
      category: "Seasoning",
    }, // Re-using pepper icon, change if needed
    {
      id: "action-sweeten",
      name: "Sweeten",
      icon: "🍯",
      description: "Add sweetener.",
      category: "Seasoning",
    },
    {
      id: "action-sour",
      name: "Sour",
      icon: "🍋",
      description: "Add acidity.",
      category: "Seasoning",
    },
  ],
  Serving: [
    {
      id: "action-serve",
      name: "Serve",
      icon: "🍽️",
      description: "Present the dish.",
      category: "Serving",
    },
    {
      id: "action-plate",
      name: "Plate",
      icon: "ափ",
      description: "Arrange food on plate.",
      category: "Serving",
    }, // Placeholder icon
    {
      id: "action-garnish",
      name: "Garnish",
      icon: "🌱",
      description: "Decorate the dish.",
      category: "Serving",
    },
    {
      id: "action-rest",
      name: "Rest",
      icon: "😴",
      description: "Allow food to sit.",
      category: "Serving",
    },
  ],
  // Add more categories like "Ingredients", "Appliances" etc. if needed
};
// --- END NEW ---

// --- UPDATED: Helper to find action by ID across all categories ---
export const findActionById = (id) => {
  for (const category in CATEGORIZED_ACTIONS) {
    const action = CATEGORIZED_ACTIONS[category].find((act) => act.id === id);
    if (action) {
      return action;
    }
  }
  return null; // Return null if not found
};
// --- END UPDATED ---

// --- REMOVE Old Flat Array ---
// export const AVAILABLE_ACTIONS = [ ... ];
// --- END REMOVE ---
