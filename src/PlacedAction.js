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

  const handleRevealMiniBoxClick = (e) => {
    e.stopPropagation();
    onAddMiniBox(squareId); // Call App.js to add next box
  };

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
  const shouldShowAddButton = miniBoxes.length < 3;
  // --- END DERIVE ---

  // --- Filter miniBoxes by position ---
  const miniBoxRight = miniBoxes.find((box) => box.position === "right");
  const miniBoxTop = miniBoxes.find((box) => box.position === "top");
  const miniBoxBottom = miniBoxes.find((box) => box.position === "bottom");
  // --- End Filter ---

  // Helper function to render a MiniBox if it exists
  const renderMiniBox = (boxData) => {
    if (!boxData) return null;
    const miniBoxDroppableId = `minibox-${squareId}-${boxData.id}`;
    return (
      <MiniBox
        key={boxData.id}
        id={boxData.id}
        droppableId={miniBoxDroppableId}
        action={boxData.action}
        onDelete={onMiniBoxDelete}
        parentSquareId={squareId}
      />
    );
  };

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
        value={label}
        onChange={(e) => onLabelChange(squareId, e.target.value)}
        placeholder="Label this action"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.stopPropagation()}
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

      {/* --- RENDER MiniBoxes in Positioned Containers --- */}
      {/* Right Position */}
      {miniBoxRight && (
        <div
          className="mini-box-container-right" // Use specific class
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {renderMiniBox(miniBoxRight)}
        </div>
      )}

      {/* Top Position */}
      {miniBoxTop && (
        <div
          className="mini-box-container-top" // Use specific class
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {renderMiniBox(miniBoxTop)}
        </div>
      )}

      {/* Bottom Position */}
      {miniBoxBottom && (
        <div
          className="mini-box-container-bottom" // Use specific class
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {renderMiniBox(miniBoxBottom)}
        </div>
      )}
      {/* --- END RENDER MiniBoxes --- */}
    </div>
  );
}

export default PlacedAction;
