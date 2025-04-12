// src/actions.js
export const AVAILABLE_ACTIONS = [
  {
    id: "action-chop",
    name: "Chop",
    icon: "🔪",
    description: "Cut ingredients into smaller pieces.",
  },
  {
    id: "action-mix",
    name: "Mix",
    icon: "🥣",
    description: "Combine ingredients together.",
  },
  {
    id: "action-heat",
    name: "Heat",
    icon: "🔥",
    description: "Apply heat using a stove, oven, etc.",
  },
  {
    id: "action-bake",
    name: "Bake",
    icon: "🍞",
    description: "Cook using dry heat, typically in an oven.",
  },
  {
    id: "action-fry",
    name: "Fry",
    icon: "🍳",
    description: "Cook food in hot fat or oil.",
  },
  {
    id: "action-boil",
    name: "Boil",
    icon: "💧",
    description: "Heat liquid until it bubbles vigorously.",
  },
  {
    id: "action-stir",
    name: "Stir",
    icon: "🥄",
    description: "Move a spoon or utensil round and round.",
  },
  {
    id: "action-measure",
    name: "Measure",
    icon: "⚖️",
    description: "Obtain an exact quantity.",
  },
  {
    id: "action-serve",
    name: "Serve",
    icon: "🍽️",
    description: "Present the finished dish.",
  },
  // Add more actions as needed
];

// Helper to find action by ID
export const findActionById = (id) =>
  AVAILABLE_ACTIONS.find((action) => action.id === id);
