// src/GridSquare.js
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import PlacedAction from "./PlacedAction";

function GridSquare({
  id, // This is the squareId ('square-r-c')
  item, // This is the object { action, originalLabel, currentLabel, miniBoxes } or empty state
  onLabelChange,
  onAddMiniBox,
  onMiniBoxDelete,
  onDeleteAction,
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: id, // Droppable ID is the squareId
    data: {
      type: "grid-square",
      accepts: ["palette-item", "grid-item"],
    },
  });

  // Check if item exists and has an action property
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
          squareId={id} // Pass the squareId
          item={item} // Pass the full item object down
          // Remove individual props that are now inside 'item'
          // action={item.action}
          // label={item.label} // Old label prop removed
          // miniBoxes={item.miniBoxes}
          onLabelChange={onLabelChange}
          onAddMiniBox={onAddMiniBox}
          onMiniBoxDelete={onMiniBoxDelete}
          onDeleteAction={onDeleteAction}
        />
      ) : (
        <span className="empty-placeholder"></span> // Placeholder for empty square
      )}
    </div>
  );
}

export default GridSquare;
