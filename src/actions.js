// src/actions.js
import { ReactComponent as FryIcon } from "./SVG/fry.svg";
import { ReactComponent as SteamIcon } from "./SVG/steam.svg";
import { ReactComponent as BoilIcon } from "./SVG/boil.svg";
import { ReactComponent as GrillIcon } from "./SVG/grill.svg";
import { ReactComponent as BakingIcon } from "./SVG/baking.svg";
import { ReactComponent as SauteIcon } from "./SVG/saute.svg";
import { ReactComponent as TimeIcon } from "./SVG/time.svg";
import { ReactComponent as MonitorIcon } from "./SVG/monitor.svg";
import { ReactComponent as SmellIcon } from "./SVG/smell.svg";
import { ReactComponent as TasteIcon } from "./SVG/taste.svg";
import { ReactComponent as FreezeIcon } from "./SVG/freeze.svg";
import { ReactComponent as MarinationIcon } from "./SVG/marination.svg";
import { ReactComponent as RestingIcon } from "./SVG/resting.svg";
import { ReactComponent as PlateIcon } from "./SVG/plate.svg";
import { ReactComponent as GarnishIcon } from "./SVG/garnish.svg";
import { ReactComponent as ProteinIcon } from "./SVG/protein.svg";
import { ReactComponent as CarbsIcon } from "./SVG/carbs.svg";
import { ReactComponent as FishIcon } from "./SVG/fish.svg";
import { ReactComponent as FruitsIcon } from "./SVG/fruits.svg";
import { ReactComponent as CarrotIcon } from "./SVG/carrot.svg";
import { ReactComponent as OilIcon } from "./SVG/oil.svg";
import { ReactComponent as AnimalFatIcon } from "./SVG/animal-fat.svg";
import { ReactComponent as SpicesIcon } from "./SVG/spices.svg";
import { ReactComponent as SaltIcon } from "./SVG/salt.svg";
import { ReactComponent as PepperIcon } from "./SVG/pepper.svg";
import { ReactComponent as SugarIcon } from "./SVG/sugar.svg";
import { ReactComponent as WashingIcon } from "./SVG/washing.svg";
import { ReactComponent as CuttingIcon } from "./SVG/cutting.svg";
import { ReactComponent as GratingIcon } from "./SVG/grating.svg";
import { ReactComponent as PreheatIcon } from "./SVG/preheat.svg";
import { ReactComponent as KneadingIcon } from "./SVG/kneading.svg";
import { ReactComponent as StirringIcon } from "./SVG/stirring.svg";
import { ReactComponent as BlendingIcon } from "./SVG/blending.svg";
import { ReactComponent as FlippingIcon } from "./SVG/flipping.svg";
import { ReactComponent as LayeringIcon } from "./SVG/layering.svg";
import { ReactComponent as HeatLowIcon } from "./SVG/heat-(low).svg";
import { ReactComponent as HeatMediumIcon } from "./SVG/heat-(medium).svg";
import { ReactComponent as HeatHighIcon } from "./SVG/heat-(high).svg";

// Helper function to create action objects
const createAction = (id, name, IconComponent, category, description = "") => ({
  id: `action-${id}`,
  name,
  icon: IconComponent, // Store the component itself
  category,
  description: description || `Action: ${name}`, // Default description
});

// --- UPDATED Categorized Actions Structure ---
export const CATEGORIZED_ACTIONS = {
  "Sub-Icons": [
    createAction("fry", "Fry", FryIcon, "Sub-Icons", "Cook in hot fat or oil."),
    createAction("steam", "Steam", SteamIcon, "Sub-Icons", "Cook with steam."),
    createAction(
      "boil",
      "Boil",
      BoilIcon,
      "Sub-Icons",
      "Heat liquid until bubbling."
    ),
    createAction(
      "grill",
      "Grill",
      GrillIcon,
      "Sub-Icons",
      "Cook over direct heat."
    ),
    createAction(
      "baking",
      "Bake",
      BakingIcon,
      "Sub-Icons",
      "Cook with dry heat in an oven."
    ),
    createAction(
      "saute",
      "Sauté",
      SauteIcon,
      "Sub-Icons",
      "Fry quickly in a little hot fat."
    ),
  ],
  // --- RENAMED CATEGORY KEY ---
  Time: [
    // --- UPDATED CATEGORY PROPERTY in each action ---
    createAction(
      "monitor",
      "Monitor",
      MonitorIcon,
      "Time", // <-- Updated
      "Observe the cooking process."
    ),
    createAction(
      "smell",
      "Smell",
      SmellIcon,
      "Time", // <-- Updated
      "Check aroma during cooking."
    ),
    createAction(
      "taste",
      "Taste",
      TasteIcon,
      "Time", // <-- Updated
      "Taste for seasoning or doneness."
    ),
    createAction(
      "freeze",
      "Freeze",
      FreezeIcon,
      "Time", // <-- Updated
      "Chill rapidly or store below freezing."
    ),
    createAction(
      "marination",
      "Marinate",
      MarinationIcon,
      "Time", // <-- Updated
      "Soak in seasoning before cooking."
    ),
    createAction(
      "resting",
      "Rest",
      RestingIcon,
      "Time", // <-- Updated
      "Allow food to sit after cooking."
    ),
    createAction(
      "time",
      "Time",
      TimeIcon,
      "Time", // <-- Updated
      "Set or check cooking time."
    ),
  ],
  Finishing: [
    createAction(
      "plate",
      "Plate",
      PlateIcon,
      "Finishing",
      "Arrange food on a plate for serving."
    ),
    createAction(
      "garnish",
      "Garnish",
      GarnishIcon,
      "Finishing",
      "Decorate the dish before serving."
    ),
  ],
  Ingredients: [
    createAction(
      "protein",
      "Protein",
      ProteinIcon,
      "Ingredients",
      "Add or prepare protein (meat, poultry, tofu)."
    ),
    createAction(
      "carbs",
      "Carbs",
      CarbsIcon,
      "Ingredients",
      "Add or prepare carbohydrates (pasta, rice, potato)."
    ),
    createAction(
      "fish",
      "Fish",
      FishIcon,
      "Ingredients",
      "Add or prepare fish/seafood."
    ),
    createAction(
      "fruits",
      "Fruits",
      FruitsIcon,
      "Ingredients",
      "Add or prepare fruits."
    ),
    createAction(
      "carrot", // <-- Change ID part to match the SVG filename base
      "Vegetables", // Keep the display name
      CarrotIcon,
      "Ingredients",
      "Add or prepare vegetables."
    ),
    createAction("oil", "Oil", OilIcon, "Ingredients", "Add cooking oil."),
    createAction(
      "animal-fat",
      "Animal Fat",
      AnimalFatIcon,
      "Ingredients",
      "Add animal fat (butter, lard)."
    ),
    createAction("spices", "Spices", SpicesIcon, "Ingredients", "Add spices."),
    createAction("salt", "Salt", SaltIcon, "Ingredients", "Add salt."),
    createAction("pepper", "Pepper", PepperIcon, "Ingredients", "Add pepper."),
    createAction(
      "sugar",
      "Sugar",
      SugarIcon,
      "Ingredients",
      "Add sugar or sweetener."
    ),
  ],
  Preparation: [
    createAction(
      "washing",
      "Wash",
      WashingIcon,
      "Preparation",
      "Clean ingredients under water."
    ),
    createAction(
      "cutting",
      "Cut",
      CuttingIcon,
      "Preparation",
      "Cut ingredients (chop, slice, dice)."
    ),
    createAction(
      "grating",
      "Grate",
      GratingIcon,
      "Preparation",
      "Shred ingredients using a grater."
    ),
  ],
  "Pre-Cooking": [
    createAction(
      "preheat",
      "Preheat",
      PreheatIcon,
      "Pre-Cooking",
      "Heat oven or pan before cooking."
    ),
    createAction(
      "kneading",
      "Knead",
      KneadingIcon,
      "Pre-Cooking",
      "Work dough with hands."
    ),
  ],
  Mixing: [
    createAction(
      "stirring",
      "Stir",
      StirringIcon,
      "Mixing",
      "Mix ingredients with a circular motion."
    ),
    createAction(
      "blending",
      "Blend",
      BlendingIcon,
      "Mixing",
      "Mix ingredients using a blender."
    ),
    createAction(
      "flipping",
      "Flip",
      FlippingIcon,
      "Mixing",
      "Turn food over (e.g., pancakes, patties)."
    ),
    createAction(
      "layering",
      "Layer",
      LayeringIcon,
      "Mixing",
      "Arrange ingredients in layers."
    ),
  ],
  Execution: [
    createAction(
      "heat-low",
      "Heat (Low)",
      HeatLowIcon,
      "Execution",
      "Apply low heat."
    ),
    createAction(
      "heat-medium",
      "Heat (Medium)",
      HeatMediumIcon,
      "Execution",
      "Apply medium heat."
    ),
    createAction(
      "heat-high",
      "Heat (High)",
      HeatHighIcon,
      "Execution",
      "Apply high heat."
    ),
  ],
};

// --- Helper to find action by ID (remains unchanged, still works) ---
export const findActionById = (id) => {
  for (const category in CATEGORIZED_ACTIONS) {
    const action = CATEGORIZED_ACTIONS[category].find((act) => act.id === id);
    if (action) {
      return action;
    }
  }
  console.warn(`Action with ID "${id}" not found.`);
  return null;
};

// --- Ensure SVG folder exists ---
// Make sure you have a folder named 'SVG' inside your 'src' folder,
// and all the .svg files listed above are present in it.
