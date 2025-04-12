import React from "react";
import MiniBox from "./MiniBox";
import { v4 as uuidv4 } from "uuid"; // For unique mini-box IDs

function PlacedAction({
  squareId,
  action,
  label,
  miniBoxes,
  onLabelChange,
  onAddMiniBox,
  onMiniBoxChange,
  onMiniBoxDelete,
}) {
  if (!action) return null; // Should not happen if rendered correctly, but safe guard

  const handleAddClick = () => {
    onAddMiniBox(squareId, { id: uuidv4(), text: "" }); // Add new mini-box with unique ID
  };

  return (
    <div
      className="placed-action"
      title={`${action.name}: ${action.description}`}
    >
      <span className="icon">{action.icon}</span>
      <input
        type="text"
        className="label-input"
        value={label}
        onChange={(e) => onLabelChange(squareId, e.target.value)}
        placeholder="Label this action"
        onClick={(e) => e.stopPropagation()} // Prevent drag start on input click
        onTouchStart={(e) => e.stopPropagation()} // Prevent drag on touch devices
      />
      <div className="mini-boxes-container">
        {miniBoxes.map((box) => (
          <MiniBox
            key={box.id}
            id={box.id}
            value={box.text}
            onChange={(miniBoxId, newText) =>
              onMiniBoxChange(squareId, miniBoxId, newText)
            }
            onDelete={(miniBoxId) => onMiniBoxDelete(squareId, miniBoxId)}
          />
        ))}
      </div>
      {/* Add button appears only when an action is placed */}
      <button
        className="add-mini-box-button"
        onClick={handleAddClick}
        title="Add related step/ingredient"
      >
        +
      </button>
    </div>
  );
}

export default PlacedAction;
