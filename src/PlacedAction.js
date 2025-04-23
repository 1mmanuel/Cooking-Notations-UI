// src/PlacedAction.js
import React from "react";
import MiniBox from "./MiniBox";
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

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
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
    overflow: "visible", // Keep visible for mini-boxes
  };

  if (!action) return null;

  // Get the SVG component for the main action
  const MainIconComponent = action.icon;

  const handleRevealMiniBoxClick = (e) => {
    e.stopPropagation();
    onAddMiniBox(squareId);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (onDeleteAction) {
      onDeleteAction(squareId);
    }
  };

  const shouldShowAddButton = miniBoxes.length < 3;

  const miniBoxRight = miniBoxes.find((box) => box.position === "right");
  const miniBoxTop = miniBoxes.find((box) => box.position === "top");
  const miniBoxBottom = miniBoxes.find((box) => box.position === "bottom");

  const renderMiniBox = (boxData) => {
    if (!boxData) return null;
    const miniBoxDroppableId = `minibox-${squareId}-${boxData.id}`;
    return (
      <MiniBox
        key={boxData.id}
        id={boxData.id}
        droppableId={miniBoxDroppableId}
        action={boxData.action} // Pass the full action object or null
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
      {/* Render the SVG component */}
      {MainIconComponent && (
        <span className="icon-wrapper">
          <MainIconComponent className="svg-icon placed-action-icon" />
        </span>
      )}
      <input
        type="text"
        className="label-input"
        value={label}
        onChange={(e) => onLabelChange(squareId, e.target.value)} // Handles typing
        placeholder="Label this action"
        onPointerDown={(e) => e.stopPropagation()} // Prevents drag start on input
        // --- MODIFICATION HERE ---
        onClick={(e) => {
          e.stopPropagation(); // Keep stopping propagation
          // Call onLabelChange with an empty string to clear the input
          onLabelChange(squareId, "");
        }}
        // --- END MODIFICATION ---
        onTouchStart={(e) => e.stopPropagation()} // Prevents drag on touch
        onContextMenu={(e) => e.stopPropagation()} // Prevents context menu interference
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

      {/* Render MiniBoxes in Positioned Containers */}
      {miniBoxRight && (
        <div
          className="mini-box-container-right"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {renderMiniBox(miniBoxRight)}
        </div>
      )}
      {miniBoxTop && (
        <div
          className="mini-box-container-top"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {renderMiniBox(miniBoxTop)}
        </div>
      )}
      {miniBoxBottom && (
        <div
          className="mini-box-container-bottom"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {renderMiniBox(miniBoxBottom)}
        </div>
      )}
    </div>
  );
}

export default PlacedAction;
