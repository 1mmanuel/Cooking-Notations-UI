import React from "react";
import GridSquare from "./GridSquare";

function RecipeGrid({
  items,
  onLabelChange,
  onAddMiniBox,
  onMiniBoxChange,
  onMiniBoxDelete,
}) {
  return (
    <div className="recipe-grid">
      {Object.entries(items).map(([id, item]) => (
        <GridSquare
          key={id}
          id={id}
          item={item}
          onLabelChange={onLabelChange}
          onAddMiniBox={onAddMiniBox}
          onMiniBoxChange={onMiniBoxChange}
          onMiniBoxDelete={onMiniBoxDelete}
        />
      ))}
    </div>
  );
}

export default RecipeGrid;
