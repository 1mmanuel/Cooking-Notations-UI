// src/RecipeGrid.js
import React, { forwardRef } from "react"; // Import forwardRef
import GridSquare from "./GridSquare";

// Wrap component definition with forwardRef
const RecipeGrid = forwardRef(
  // Use forwardRef
  (
    { items, onLabelChange, onAddMiniBox, onMiniBoxDelete },
    ref // Receive the ref as the second argument
  ) => {
    return (
      // Attach the ref to the outermost div
      <div className="recipe-grid" ref={ref}>
        {Object.entries(items).map(([id, item]) => (
          <GridSquare
            key={id}
            id={id}
            item={item}
            onLabelChange={onLabelChange}
            onAddMiniBox={onAddMiniBox}
            onMiniBoxDelete={onMiniBoxDelete}
          />
        ))}
      </div>
    );
  }
); // Close forwardRef

export default RecipeGrid;
