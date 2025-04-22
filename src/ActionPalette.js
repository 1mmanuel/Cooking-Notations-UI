// src/ActionPalette.js
import React, { useState } from "react";
import ActionItem from "./ActionItem";
import { CATEGORIZED_ACTIONS } from "./actions"; // Import the new structure

function ActionPalette() {
  const categoryNames = Object.keys(CATEGORIZED_ACTIONS);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  const handleNextCategory = () => {
    setCurrentCategoryIndex(
      (prevIndex) => (prevIndex + 1) % categoryNames.length
    );
  };

  const handlePrevCategory = () => {
    setCurrentCategoryIndex((prevIndex) =>
      prevIndex === 0 ? categoryNames.length - 1 : prevIndex - 1
    );
  };

  const currentCategoryName = categoryNames[currentCategoryIndex];
  const currentActions = CATEGORIZED_ACTIONS[currentCategoryName] || []; // Get actions for current category

  return (
    <div className="action-palette">
      {/* Category Navigation */}
      <div className="category-navigation">
        <button
          onClick={handlePrevCategory}
          disabled={categoryNames.length <= 1}
          className="category-arrow"
          title="Previous Category"
        >
          &lt; {/* Left Arrow */}
        </button>
        <h3 className="category-title">{currentCategoryName}</h3>
        <button
          onClick={handleNextCategory}
          disabled={categoryNames.length <= 1}
          className="category-arrow"
          title="Next Category"
        >
          &gt; {/* Right Arrow */}
        </button>
      </div>

      {/* Action List for the Current Category */}
      <div className="action-list">
        {currentActions.length > 0 ? (
          currentActions.map((action) => (
            <ActionItem key={action.id} action={action} />
          ))
        ) : (
          <p className="no-actions-message">No actions in this category.</p>
        )}
      </div>
    </div>
  );
}

export default ActionPalette;
