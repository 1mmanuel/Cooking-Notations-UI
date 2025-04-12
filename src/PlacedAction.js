// src/PlacedAction.js
import React from "react";
import MiniBox from "./MiniBox"; // Will be updated next
import { v4 as uuidv4 } from "uuid";
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

  // ... style definition remains the same ...
  const style = {
    // ... (as before)
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
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
  };

  if (!action) return null;

  const handleAddClick = (e) => {
    e.stopPropagation();
    onAddMiniBox(squareId); // Call with just squareId
  };

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

      {/* Absolutely Positioned Mini-Box Container */}
      {action && (
        <div
          className="mini-boxes-container"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {miniBoxes.map((box) => {
            // Generate the unique ID for the droppable mini-box
            const miniBoxDroppableId = `minibox-${squareId}-${box.id}`;
            return (
              <MiniBox
                key={box.id} // React key is still the UUID
                id={box.id} // Pass the UUID for deletion logic
                droppableId={miniBoxDroppableId} // Pass the full ID for dnd-kit
                action={box.action} // Pass the action object or null
                onDelete={onMiniBoxDelete} // Pass the delete handler
                parentSquareId={squareId} // Pass parent ID for the delete handler
              />
            );
          })}
          {/* Add button */}
          <button
            className="add-mini-box-button"
            onClick={handleAddClick}
            title="Add related action slot"
            disabled={isDragging}
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

export default PlacedAction;
