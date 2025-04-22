// src/GridSquare.js
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import PlacedAction from "./PlacedAction";

function GridSquare({
  id,
  item,
  onLabelChange,
  onAddMiniBox,
  onMiniBoxDelete,
  onDeleteAction, // <-- Accept the new prop
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "grid-square",
      accepts: ["palette-item", "grid-item"], // Can accept from palette or other grid squares
    },
  });

  const hasAction = Boolean(item && item.action);

  return (
    <div
      ref={setNodeRef}
      className={`grid-square ${isOver ? "over" : ""} ${
        !hasAction ? "empty" : ""
      }`}
    >
      {hasAction ? (
        <PlacedAction
          squareId={id}
          action={item.action}
          label={item.label}
          miniBoxes={item.miniBoxes}
          onLabelChange={onLabelChange}
          onAddMiniBox={onAddMiniBox}
          onMiniBoxDelete={onMiniBoxDelete}
          onDeleteAction={onDeleteAction} // <-- Pass it down
        />
      ) : (
        <span className="empty-placeholder"></span> // Placeholder text
      )}
    </div>
  );
}

export default GridSquare;
