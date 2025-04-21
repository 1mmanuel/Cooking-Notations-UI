// src/MiniBox.js
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import ActionItem from "./ActionItem"; // Assuming ActionItem can render just the icon/content

function MiniBox({ id, droppableId, action, onDelete, parentSquareId }) {
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: {
      type: "minibox",
      targetId: id,
      parentSquareId: parentSquareId,
    },
  });

  const hasAction = Boolean(action);

  // --- NEW: Context Menu Handler ---
  const handleContextMenu = (event) => {
    event.preventDefault(); // Prevent the default browser right-click menu
    event.stopPropagation(); // Stop event from bubbling up
    console.log(`Right-clicked MiniBox: ${id}, Parent: ${parentSquareId}`);
    onDelete(parentSquareId, id); // Call the delete function passed from parent
  };
  // --- END NEW ---

  return (
    <div
      ref={setNodeRef}
      className={`mini-box ${isOver ? "over" : ""} ${
        !hasAction ? "empty" : ""
      }`}
      // --- ADD onContextMenu ---
      onContextMenu={handleContextMenu}
      // --- ADD title attribute for user hint ---
      title={
        hasAction
          ? `${action.name} (Right-click to delete)`
          : "Empty Slot (Right-click to delete)"
      }
      // Prevent drag start when interacting with the box itself
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="mini-box-content">
        {hasAction ? (
          // Render the action icon (or minimal representation)
          // Assuming ActionItem can take just an action prop
          // Or just display the icon directly:
          <span className="mini-box-icon">{action.icon}</span>
        ) : (
          // Placeholder for empty state
          <span className="mini-box-placeholder">Slot</span>
        )}
      </div>
      {/* --- REMOVED Delete Button ---
      {hasAction && ( // Only show delete if there's an action? Or always show to delete the slot? Let's assume always for now.
        <button
          className="mini-box-delete-button"
          onClick={(e) => {
            e.stopPropagation(); // Prevent drag/other clicks
            onDelete(parentSquareId, id);
          }}
          title="Delete Mini-Box"
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on button click
        >
          &times;
        </button>
      )}
      --- END REMOVED --- */}
    </div>
  );
}

export default MiniBox;
