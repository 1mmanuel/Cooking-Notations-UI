// src/ActionItem.js
import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function ActionItem({ action }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: action.id,
      data: { type: "palette-item", action }, // Ensure type is set for clarity
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none", // Recommended for compatibility
  };

  // Get the SVG component from the action object
  const IconComponent = action.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="action-item"
      title={`${action.name}: ${action.description}`} // Tooltip
    >
      {/* Render the SVG component if it exists */}
      {IconComponent && (
        <span className="icon-wrapper">
          <IconComponent className="svg-icon action-palette-icon" />
        </span>
      )}
      <p>{action.name}</p>
    </div>
  );
}

export default ActionItem;
