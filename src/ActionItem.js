import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function ActionItem({ action }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: action.id,
      data: { action }, // Pass the action data
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    touchAction: "none", // Recommended for compatibility
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="action-item"
      title={`${action.name}: ${action.description}`} // Tooltip
    >
      <span>{action.icon}</span>
      <p>{action.name}</p>
    </div>
  );
}

export default ActionItem;
