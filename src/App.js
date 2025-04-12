import React, { useState, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter, // Or closestCorners
} from "@dnd-kit/core";
import { v4 as uuidv4 } from "uuid"; // Re-import for mini-box IDs if needed elsewhere

import RecipeInfoForm from "./RecipeInfoForm";
import ActionPalette from "./ActionPalette";
import RecipeGrid from "./RecipeGrid";
import SummaryModal from "./SummaryModal";
import ActionItem from "./ActionItem"; // For DragOverlay
import { findActionById, AVAILABLE_ACTIONS } from "./actions"; // Import helper

import "./App.css";

// Initialize Grid State
const GRID_SIZE = 5;
const initialGridItems = {};
for (let r = 0; r < GRID_SIZE; r++) {
  for (let c = 0; c < GRID_SIZE; c++) {
    const id = `square-${r}-${c}`;
    initialGridItems[id] = { action: null, label: "", miniBoxes: [] }; // miniBoxes is array of {id, text}
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
  const [activeAction, setActiveAction] = useState(null); // For DragOverlay
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

  // --- Grid Item Update Callbacks ---
  const handleLabelChange = useCallback((squareId, newLabel) => {
    setGridItems((prev) => ({
      ...prev,
      [squareId]: { ...prev[squareId], label: newLabel },
    }));
  }, []);

  const handleAddMiniBox = useCallback((squareId, newMiniBox) => {
    setGridItems((prev) => ({
      ...prev,
      [squareId]: {
        ...prev[squareId],
        miniBoxes: [...prev[squareId].miniBoxes, newMiniBox],
      },
    }));
  }, []);

  const handleMiniBoxChange = useCallback((squareId, miniBoxId, newText) => {
    setGridItems((prev) => ({
      ...prev,
      [squareId]: {
        ...prev[squareId],
        miniBoxes: prev[squareId].miniBoxes.map((box) =>
          box.id === miniBoxId ? { ...box, text: newText } : box
        ),
      },
    }));
  }, []);

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
    // Check if dragging from palette
    if (active.id.startsWith("action-")) {
      const action = findActionById(active.id);
      setActiveAction(action);
    } else {
      setActiveAction(null); // Or handle dragging from grid if needed later
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveAction(null); // Clear overlay action

    // Check if dropped over a droppable area (a grid square)
    if (
      over &&
      over.id.startsWith("square-") &&
      active.id.startsWith("action-")
    ) {
      const squareId = over.id;
      const actionId = active.id;
      const action = findActionById(actionId); // Get the full action object

      if (action) {
        setGridItems((prev) => ({
          ...prev,
          [squareId]: {
            ...prev[squareId], // Keep existing miniBoxes/label if needed, or reset:
            action: action,
            label: "", // Reset label on new drop
            miniBoxes: [], // Reset mini-boxes on new drop
          },
        }));
      }
    }
    // Handle other cases if needed (e.g., moving items within the grid)
  };

  const handleDragCancel = () => {
    setActiveAction(null);
  };

  // --- Action Buttons ---
  const handleServe = () => {
    let summary = `Recipe: ${recipeInfo.name || "Untitled Recipe"}\n`;
    summary += `Author: ${recipeInfo.author || "Unknown"}\n`;
    summary += `Cook Time: ${recipeInfo.cookTime || "N/A"}\n`;
    summary += `Date: ${recipeInfo.date || "N/A"}\n\n`;
    summary += "Instructions:\n";
    summary += "====================\n";

    let stepNumber = 1;
    // Iterate in grid order (assuming keys are somewhat ordered, or sort them)
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
        if (item.miniBoxes.length > 0) {
          summary += `  Related: ${item.miniBoxes
            .map((mb) => mb.text)
            .filter(Boolean)
            .join(", ")}\n`;
        }
        summary += "\n";
        stepNumber++;
      }
    });

    if (stepNumber === 1) {
      summary += "(No instructions added)\n";
    }

    setSummaryText(summary);

    // Prepare data for QR code (serialize relevant state)
    const dataToEncode = JSON.stringify({
      info: recipeInfo,
      grid: gridItems, // Include the grid state
    });
    setQrData(dataToEncode);

    setIsSummaryModalOpen(true);
  };

  const handlePrint = () => {
    window.print(); // Trigger browser's print dialog
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter} // Strategy for determining drop target
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
            onAddMiniBox={handleAddMiniBox}
            onMiniBoxChange={handleMiniBoxChange}
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

      {/* Drag Overlay for better visual feedback */}
      <DragOverlay>
        {activeAction ? (
          // Render a temporary ActionItem for the overlay
          <div className="action-item drag-overlay">
            <span>{activeAction.icon}</span>
            <p>{activeAction.name}</p>
          </div>
        ) : null}
      </DragOverlay>

      {/* Summary Modal */}
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
