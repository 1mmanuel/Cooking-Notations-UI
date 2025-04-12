// src/App.js
import React, { useState, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { v4 as uuidv4 } from "uuid";

import RecipeInfoForm from "./RecipeInfoForm";
import ActionPalette from "./ActionPalette";
import RecipeGrid from "./RecipeGrid";
import SummaryModal from "./SummaryModal";
import ActionItem from "./ActionItem"; // For DragOverlay (Palette)
import PlacedAction from "./PlacedAction"; // Import for DragOverlay (Grid Item)
import { findActionById } from "./actions";

import "./App.css";

// Define Grid Size
const GRID_SIZE = 5;

// Helper to create the empty state for a square
const createEmptySquare = () => ({ action: null, label: "", miniBoxes: [] }); // miniBoxes is array of {id, action}

// Initialize Grid State with new miniBox structure (KEEP ONLY THIS ONE)
const initialGridItems = {};
for (let r = 0; r < GRID_SIZE; r++) {
  for (let c = 0; c < GRID_SIZE; c++) {
    const id = `square-${r}-${c}`;
    // MiniBoxes now store an action object or null
    initialGridItems[id] = { action: null, label: "", miniBoxes: [] };
  }
}

function App() {
  const [recipeInfo, setRecipeInfo] = useState({
    name: "",
    author: "",
    cookTime: "",
    date: "",
  });
  const [gridItems, setGridItems] = useState(initialGridItems);
  // Store the full active item data for the overlay and logic
  const [activeDragData, setActiveDragData] = useState(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [qrData, setQrData] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleRecipeInfoChange = (newInfo) => {
    setRecipeInfo(newInfo);
  };

  // --- Grid Item Update Callbacks (no changes needed) ---
  const handleLabelChange = useCallback((squareId, newLabel) => {
    setGridItems((prev) => ({
      ...prev,
      [squareId]: { ...prev[squareId], label: newLabel },
    }));
  }, []);

  const handleAddMiniBox = useCallback((squareId) => {
    // No longer takes newMiniBox object
    setGridItems((prev) => {
      const newMiniBox = { id: uuidv4(), action: null }; // Initialize with null action
      return {
        ...prev,
        [squareId]: {
          ...prev[squareId],
          miniBoxes: [...prev[squareId].miniBoxes, newMiniBox],
        },
      };
    });
  }, []);

  // const handleMiniBoxChange = useCallback((squareId, miniBoxId, newText) => {
  //   setGridItems((prev) => ({
  //     ...prev,
  //     [squareId]: {
  //       ...prev[squareId],
  //       miniBoxes: prev[squareId].miniBoxes.map((box) =>
  //         box.id === miniBoxId ? { ...box, text: newText } : box
  //       ),
  //     },
  //   }));
  // }, []);

  const handleMiniBoxDelete = useCallback((squareId, miniBoxId) => {
    setGridItems((prev) => ({
      ...prev,
      [squareId]: {
        ...prev[squareId],
        miniBoxes: prev[squareId].miniBoxes.filter(
          (box) => box.id !== miniBoxId
        ),
      },
    }));
  }, []);

  // --- Dnd Handlers ---
  const handleDragStart = (event) => {
    const { active } = event;
    // Store the full data associated with the dragged item
    // active.data.current should contain what we passed in useDraggable
    setActiveDragData(active.data.current ?? null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    const activeData = active.data.current;

    setActiveDragData(null);

    if (!over) {
      // No drop target
      return;
    }

    const sourceId = active.id; // ID of the draggable (e.g., 'action-chop', 'square-0-1')
    const targetId = over.id; // ID of the droppable (e.g., 'square-r-c', 'minibox-square-r-c-uuid')

    // Prevent dropping on self (relevant if items could be dragged out of miniboxes later)
    if (active.id === targetId) {
      return;
    }

    // --- Scenario 1: Dropping a NEW action from Palette onto the MAIN Grid ---
    if (
      targetId.startsWith("square-") &&
      sourceId.startsWith("action-") &&
      activeData?.action
    ) {
      const action = activeData.action;
      setGridItems((prev) => ({
        ...prev,
        [targetId]: {
          ...createEmptySquare(),
          action: action,
          // Keep existing miniBoxes if you want, or reset them:
          // miniBoxes: prev[targetId]?.miniBoxes || [] // Keep existing
          miniBoxes: [], // Reset miniBoxes when main action changes
        },
      }));
      return;
    }

    // --- Scenario 2: Moving an EXISTING item WITHIN the MAIN Grid ---
    if (
      targetId.startsWith("square-") &&
      sourceId.startsWith("square-") &&
      activeData?.type === "grid-item" &&
      activeData?.item
    ) {
      const draggedItemData = activeData.item; // { action, label, miniBoxes }
      setGridItems((prev) => {
        const newGrid = { ...prev };
        newGrid[targetId] = {
          // Place dragged item data
          action: draggedItemData.action,
          label: draggedItemData.label,
          miniBoxes: draggedItemData.miniBoxes, // Move miniBoxes along with the main action
        };
        newGrid[sourceId] = createEmptySquare(); // Clear source
        return newGrid;
      });
      return;
    }

    // --- Scenario 3: Dropping an action FROM PALETTE onto a MINI-BOX ---
    if (
      targetId.startsWith("minibox-") && // Target is a mini-box
      sourceId.startsWith("action-") && // Source is an action from the palette
      activeData?.action
    ) {
      const droppedAction = activeData.action;

      // --- CORRECTED ID PARSING ---
      // Format: minibox-${squareId}-${box.id}
      // Example: minibox-square-1-2-a1b2c3d4-e5f6-7890-abcd-ef1234567890

      const prefix = "minibox-";
      const remainingId = targetId.substring(prefix.length); // e.g., square-1-2-a1b2c3d4-...

      // Find the last hyphen that separates squareId from uuid
      // Square ID is always square-r-c (3 parts)
      const squareIdParts = remainingId.split("-").slice(0, 3); // ['square', 'r', 'c']
      const parentSquareId = squareIdParts.join("-"); // 'square-r-c'

      // The UUID is everything after the squareId and the hyphen following it
      const uuidStartIndex = squareIdParts.join("-").length + 1; // +1 for the hyphen
      const miniBoxUuid = remainingId.substring(uuidStartIndex);

      // --- Add console logs for debugging ---
      console.log("Target ID:", targetId);
      console.log("Source ID:", sourceId);
      console.log("Dropped Action:", droppedAction);
      console.log("Extracted Parent Square ID:", parentSquareId);
      console.log("Extracted MiniBox UUID:", miniBoxUuid);
      // --- End Debug Logs ---

      setGridItems((prev) => {
        // Ensure the parent square exists
        if (!prev[parentSquareId]) {
          console.error("Parent square not found:", parentSquareId);
          return prev; // Return previous state if parent not found
        }

        // Find the target mini-box and update its action
        let foundMiniBox = false; // Flag to check if update happened
        const updatedMiniBoxes = prev[parentSquareId].miniBoxes.map((mb) => {
          if (mb.id === miniBoxUuid) {
            console.log(
              `Updating MiniBox ${mb.id} in square ${parentSquareId}`
            );
            foundMiniBox = true;
            return { ...mb, action: droppedAction }; // Update the action
          }
          return mb;
        });

        // If the target mini-box wasn't found (e.g., parsing error), return prev state
        if (!foundMiniBox) {
          console.error(
            "Target MiniBox UUID not found in parent square:",
            miniBoxUuid,
            parentSquareId
          );
          return prev;
        }

        // Return the updated state
        return {
          ...prev,
          [parentSquareId]: {
            ...prev[parentSquareId],
            miniBoxes: updatedMiniBoxes,
          },
        };
      });
      return; // Handled
    }

    // --- Optional: Handle dragging from Grid back to Palette (Remove item) ---
    // ...

    // --- Optional: Handle dragging from MiniBox (e.g., to clear it or move it) ---
    // This would require making MiniBox draggable and adding more logic here.
  };

  const handleDragCancel = () => {
    setActiveDragData(null); // Clear active item on cancel
  };

  // --- Action Buttons (no changes needed) ---
  const handleServe = () => {
    let summary = `Recipe: ${recipeInfo.name || "Untitled Recipe"}\n`;
    summary += `Author: ${recipeInfo.author || "Unknown"}\n`;
    summary += `Cook Time: ${recipeInfo.cookTime || "N/A"}\n`;
    summary += `Date: ${recipeInfo.date || "N/A"}\n\n`;
    summary += "Instructions:\n";
    summary += "====================\n";

    let stepNumber = 1;
    const sortedKeys = Object.keys(gridItems).sort((a, b) => {
      const [, rA, cA] = a.split("-");
      const [, rB, cB] = b.split("-");
      if (rA !== rB) return parseInt(rA) - parseInt(rB);
      return parseInt(cA) - parseInt(cB);
    });

    sortedKeys.forEach((key) => {
      const item = gridItems[key];
      if (item.action) {
        summary += `Step ${stepNumber}: [${item.action.name}] ${
          item.label || ""
        }\n`;
        // Add related actions from mini-boxes
        const relatedActions = item.miniBoxes
          .map((mb) => mb.action?.name) // Get the name if action exists
          .filter(Boolean) // Filter out null/undefined actions
          .join(", "); // Join names with comma

        if (relatedActions) {
          summary += `  Related Actions: ${relatedActions}\n`;
        }
        summary += "\n";
        stepNumber++;
      }
    });

    if (stepNumber === 1) {
      summary += "(No instructions added)\n";
    }
    setSummaryText(summary);
    const dataToEncode = JSON.stringify({
      info: recipeInfo,
      grid: gridItems, // Grid state now includes actions in miniBoxes
    });
    setQrData(dataToEncode);
    setIsSummaryModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Render Drag Overlay Content ---
  const renderDragOverlay = () => {
    if (!activeDragData) return null;

    // If dragging from the palette
    if (activeDragData.action && activeDragData.type !== "grid-item") {
      return (
        <div className="action-item drag-overlay">
          <span>{activeDragData.action.icon}</span>
          <p>{activeDragData.action.name}</p>
        </div>
      );
    }

    // If dragging from the grid
    if (activeDragData.type === "grid-item" && activeDragData.item?.action) {
      // Render a simplified version or a full PlacedAction lookalike
      // For simplicity, let's render something similar to ActionItem
      const { action } = activeDragData.item;
      return (
        <div
          className="placed-action drag-overlay"
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          <span className="icon">{action.icon}</span>
          {/* Optionally show label */}
          {/* <p style={{fontSize: '0.8em', margin: '2px 0 0', color: '#555'}}>{activeDragData.item.label || action.name}</p> */}
          <p style={{ fontSize: "0.8em", margin: "2px 0 0", color: "#555" }}>
            {action.name}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="app-container">
        <div className="left-panel">
          <RecipeInfoForm info={recipeInfo} onChange={handleRecipeInfoChange} />
          <ActionPalette />
        </div>

        <div className="right-panel">
          <h2>Cooking Instructions Grid</h2>
          <RecipeGrid
            items={gridItems}
            onLabelChange={handleLabelChange}
            onAddMiniBox={handleAddMiniBox} // Pass the updated one
            // onMiniBoxChange is removed
            onMiniBoxDelete={handleMiniBoxDelete}
          />
          <div className="action-buttons">
            <button className="serve-button" onClick={handleServe}>
              Serve (Summary & QR)
            </button>
            <button className="print-button" onClick={handlePrint}>
              Print Grid
            </button>
          </div>
        </div>
      </div>

      {/* Drag Overlay uses the new render function */}
      <DragOverlay>{renderDragOverlay()}</DragOverlay>

      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        summary={summaryText}
        qrData={qrData}
      />
    </DndContext>
  );
}

export default App;
