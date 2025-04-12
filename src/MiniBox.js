// src/MiniBox.js
import React from "react";
import { useDroppable } from "@dnd-kit/core"; // Import useDroppable

// Receive parentSquareId to correctly call onDelete
function MiniBox({ id, droppableId, action, onDelete, parentSquareId }) {
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId, // Use the unique droppable ID passed from PlacedAction
  });

  const hasAction = action !== null;
  const miniBoxClasses = `mini-box ${isOver ? "over" : ""} ${
    !hasAction ? "empty" : ""
  }`;

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevent potential parent interactions
    onDelete(parentSquareId, id); // Call delete with parent ID and mini-box ID
  };

  return (
    // Apply droppable ref and classes
    <div ref={setNodeRef} className={miniBoxClasses}>
      {/* Content Area */}
      <div className="mini-box-content">
        {hasAction ? (
          <span className="mini-box-icon" title={action.name}>
            {action.icon}
          </span>
        ) : (
          <span className="mini-box-placeholder">Drop Action</span>
        )}
      </div>

      {/* Delete Button - only show if an action is present? Or always? Let's show always for now */}
      <button
        className="mini-box-delete-button"
        onClick={handleDelete}
        title="Remove item / Clear slot"
        // Stop pointer down needed if button is sometimes obscured or complex layout
        onPointerDown={(e) => e.stopPropagation()}
      >
        ×
      </button>
    </div>
  );
}

export default MiniBox;
