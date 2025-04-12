import React from "react";
import { useDroppable } from "@dnd-kit/core";
import PlacedAction from "./PlacedAction";

function GridSquare({
  id,
  item,
  onLabelChange,
  onAddMiniBox,
  // onMiniBoxChange, // REMOVE THIS LINE
  onMiniBoxDelete,
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  const squareClasses = `grid-square ${isOver ? "over" : ""} ${
    !item.action ? "empty" : ""
  }`;

  return (
    <div ref={setNodeRef} className={squareClasses}>
      {item.action ? (
        <PlacedAction
          squareId={id}
          action={item.action}
          label={item.label}
          miniBoxes={item.miniBoxes}
          onLabelChange={onLabelChange}
          onAddMiniBox={onAddMiniBox}
          // onMiniBoxChange={onMiniBoxChange} // REMOVE THIS LINE
          onMiniBoxDelete={onMiniBoxDelete}
        />
      ) : (
        <span style={{ color: "#ccc", fontSize: "0.8em" }}>Drop here</span>
      )}
    </div>
  );
}

export default GridSquare;
