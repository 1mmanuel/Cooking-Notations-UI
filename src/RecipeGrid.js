// src/RecipeGrid.js
import React, { forwardRef } from "react";
import GridSquare from "./GridSquare";

const RecipeGrid = forwardRef(
  (
    {
      items,
      onLabelChange,
      onAddMiniBox,
      onMiniBoxDelete,
      onDeleteAction, // <-- Accept the new prop
    },
    ref
  ) => {
    return (
      <div className="recipe-grid" ref={ref}>
        {Object.entries(items).map(([id, item]) => (
          <GridSquare
            key={id}
            id={id}
            item={item}
            onLabelChange={onLabelChange}
            onAddMiniBox={onAddMiniBox}
            onMiniBoxDelete={onMiniBoxDelete}
            onDeleteAction={onDeleteAction} // <-- Pass it down
          />
        ))}
      </div>
    );
  }
);

export default RecipeGrid;
