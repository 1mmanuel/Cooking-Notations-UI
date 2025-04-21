// src/PlacedAction.js
import React, { useState } from "react";
import MiniBox from "./MiniBox"; // Will be updated next
// import { v4 as uuidv4 } from "uuid"; // No longer needed here
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function PlacedAction({
  squareId, // ID of the main square this action is in
  action,
  label,
  miniBoxes, // Now array of { id: uuid, action: actionObject | null }
  onLabelChange,
  onAddMiniBox,
  // onMiniBoxChange, // Removed
  onMiniBoxDelete,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: squareId,
      data: {
        type: "grid-item",
        item: { action, label, miniBoxes },
        sourceId: squareId,
      },
    });

  // --- NEW: State to control mini-box area visibility ---
  const [showMiniBoxes, setShowMiniBoxes] = useState(miniBoxes.length > 0);
  // Initialize to true if miniboxes already exist (e.g., loading state)

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    touchAction: "none",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    position: "relative", // Keep relative for positioning children
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center", // Adjust if needed for '+' button layout
    padding: "5px",
    overflow: "visible", // Ensure absolutely positioned children aren't clipped
  };

  // --- NEW: Handler for the main '+' button ---
  const handleRevealMiniBoxClick = (e) => {
    e.stopPropagation(); // Prevent drag
    setShowMiniBoxes(true);
    // Call App.js to add the *first* mini-box data structure if none exist
    if (miniBoxes.length === 0) {
      onAddMiniBox(squareId);
    }
    // If you want clicking '+' *again* to add *more* boxes, call onAddMiniBox unconditionally:
    // onAddMiniBox(squareId);
  };
  // --- END NEW ---

  // --- REMOVED: handleAddClick (was for the old '+' button) ---

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`placed-action ${isDragging ? "dragging" : ""}`}
      title={`${action.name}: ${action.description}`}
    >
      {/* Main content (Icon and Label) */}
      <span className="icon">{action.icon}</span>
      <input
        type="text"
        className="label-input"
        value={label}
        onChange={(e) => onLabelChange(squareId, e.target.value)}
        placeholder="Label this action"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{ pointerEvents: isDragging ? "none" : "auto", marginBottom: 0 }}
      />

      {/* --- NEW: Conditional '+' Button on Main Square --- */}
      {!showMiniBoxes && !isDragging && (
        <button
          className="reveal-mini-box-button"
          onClick={handleRevealMiniBoxClick}
          title="Add related action slot"
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on button click
        >
          +
        </button>
      )}
      {/* --- END NEW --- */}

      {/* --- UPDATED: Conditionally render the new mini-box area --- */}
      {/* Render only if showMiniBoxes is true AND there are miniBoxes in the data */}
      {showMiniBoxes && miniBoxes.length > 0 && (
        <div
          className="mini-box-area" // New container class
          onPointerDown={(e) => e.stopPropagation()} // Stop propagation on the area
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {miniBoxes.map((box) => {
            const miniBoxDroppableId = `minibox-${squareId}-${box.id}`;
            return (
              <MiniBox
                key={box.id}
                id={box.id}
                droppableId={miniBoxDroppableId}
                action={box.action}
                onDelete={onMiniBoxDelete}
                parentSquareId={squareId}
              />
            );
          })}
          {/* --- REMOVED: Old '+' button that was inside the container --- */}
        </div>
      )}
      {/* --- END UPDATED --- */}

      {/* --- REMOVED: Old .mini-boxes-container div --- */}
    </div>
  );
}

export default PlacedAction;
