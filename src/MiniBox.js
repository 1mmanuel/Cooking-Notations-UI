// src/MiniBox.js
import React from "react";
import { useDroppable } from "@dnd-kit/core";
// No need to import ActionItem anymore if just rendering the icon

function MiniBox({ id, droppableId, action, onDelete, parentSquareId }) {
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: {
      type: "minibox",
      targetId: id, // The mini-box's own unique ID
      parentSquareId: parentSquareId,
    },
  });

  const hasAction = Boolean(action);
  // Get the SVG component if an action exists
  const MiniIconComponent = hasAction ? action.icon : null;

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onDelete(parentSquareId, id);
  };

  return (
    <div
      ref={setNodeRef}
      className={`mini-box ${isOver ? "over" : ""} ${
        !hasAction ? "empty" : ""
      }`}
      onContextMenu={handleContextMenu}
      title={
        hasAction
          ? `${action.name} (Right-click to delete)`
          : "Empty Slot (Right-click to delete)"
      }
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="mini-box-content">
        {hasAction && MiniIconComponent ? (
          // Render the SVG component for the mini action
          <span className="mini-box-icon-wrapper">
            <MiniIconComponent className="svg-icon mini-box-icon" />
          </span>
        ) : (
          // Placeholder for empty state
          <span className="mini-box-placeholder">Slot</span>
        )}
      </div>
    </div>
  );
}

export default MiniBox;
