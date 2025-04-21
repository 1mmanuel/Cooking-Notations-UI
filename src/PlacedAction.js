// src/PlacedAction.js
import React, { useState } from "react";
import MiniBox from "./MiniBox"; // Will be updated next
// import { v4 as uuidv4 } from "uuid"; // No longer needed here
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function PlacedAction({
  squareId,
  action,
  label,
  miniBoxes,
  onLabelChange,
  onAddMiniBox,
  onMiniBoxDelete,
  onDeleteAction,
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

  // --- REMOVE showMiniBoxes state ---
  // const [showMiniBoxes, setShowMiniBoxes] = useState(miniBoxes.length > 0);
  // --- END REMOVE ---

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    // cursor: "grab", // Let CSS handle cursor now
    touchAction: "none",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px",
    overflow: "visible",
  };

  if (!action) return null;

  // --- SIMPLIFY Handler for the main '+' button ---
  const handleRevealMiniBoxClick = (e) => {
    e.stopPropagation(); // Prevent drag
    // Just call the function to add the data structure in App.js
    onAddMiniBox(squareId);
    // No need to setShowMiniBoxes(true) anymore
  };
  // --- END SIMPLIFY ---

  // --- REMOVED: handleAddClick (was for the old '+' button) ---

  // --- NEW: Context Menu Handler for deleting the main action ---
  const handleContextMenu = (event) => {
    event.preventDefault(); // Prevent browser menu
    event.stopPropagation(); // Stop bubbling
    console.log("Right-clicked PlacedAction:", squareId);
    if (onDeleteAction) {
      onDeleteAction(squareId); // Call the handler passed from App.js
    } else {
      console.warn("onDeleteAction prop not provided to PlacedAction");
    }
  };
  // --- END NEW ---

  // --- DERIVE visibility directly from miniBoxes.length ---
  const shouldShowMiniBoxArea = miniBoxes.length > 0;
  const shouldShowAddButton = miniBoxes.length === 0;
  // --- END DERIVE ---

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`placed-action ${isDragging ? "dragging" : ""}`}
      onContextMenu={handleContextMenu}
      title={`${action.name} (Right-click to delete)`}
    >
      {/* Main content (Icon and Label) */}
      <span className="icon">{action.icon}</span>
      <input
        type="text"
        className="label-input"
        // --- Ensure these props are present ---
        value={label}
        onChange={(e) => onLabelChange(squareId, e.target.value)}
        placeholder="Label this action"
        // --- THIS IS THE IMPORTANT PART ---
        onPointerDown={(e) => {
          console.log("Input PointerDown - Stopping Propagation"); // Optional: for debugging
          e.stopPropagation();
        }}
        // --- Keep other handlers ---
        onClick={(e) => e.stopPropagation()} // Good practice for clicks too
        onTouchStart={(e) => e.stopPropagation()} // For touch devices
        onContextMenu={(e) => e.stopPropagation()} // Prevent right-click delete
        style={{ pointerEvents: isDragging ? "none" : "auto" }}
      />

      {/* Conditional '+' Button */}
      {shouldShowAddButton && !isDragging && (
        <button
          className="reveal-mini-box-button"
          onClick={handleRevealMiniBoxClick}
          title="Add related action slot"
          onPointerDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          +
        </button>
      )}

      {/* Conditional Mini-Box Area */}
      {shouldShowMiniBoxArea && (
        <div
          className="mini-box-area"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {miniBoxes.map((box) => (
            <MiniBox
              key={box.id}
              id={box.id}
              droppableId={`minibox-${squareId}-${box.id}`}
              action={box.action}
              onDelete={onMiniBoxDelete}
              parentSquareId={squareId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default PlacedAction;
