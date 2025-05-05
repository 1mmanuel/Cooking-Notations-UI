// src/ActionPalette.js
import React, { useState, useEffect } from "react";
import ActionItem from "./ActionItem";
import { CATEGORIZED_ACTIONS } from "./actions";
import IconsPNG from "./designs/icons.png"; // Import the new image

const ITEMS_PER_PAGE = 6; // 2x2 grid

function ActionPalette() {
  const categoryNames = Object.keys(CATEGORIZED_ACTIONS);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0); // State for pagination

  const currentCategoryName = categoryNames[currentCategoryIndex];
  const currentActions = CATEGORIZED_ACTIONS[currentCategoryName] || [];

  // --- Pagination Calculations ---
  const totalItems = currentActions.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const actionsToDisplay = currentActions.slice(startIndex, endIndex);
  // --- End Pagination Calculations ---

  // --- Effect to reset page when category changes ---
  useEffect(() => {
    setCurrentPage(0); // Reset to first page when category changes
  }, [currentCategoryIndex]);
  // --- End Effect ---

  // --- Category Navigation Handlers (no change) ---
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
  // --- End Category Navigation Handlers ---

  // --- Pagination Handlers ---
  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages - 1));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
  };
  // --- End Pagination Handlers ---

  return (
    // --- NEW: Outer Container ---
    <div className="action-palette-outer-container">
      {/* --- NEW: Centered Title --- */}
      <img
        src={IconsPNG} /* Use the URL from the default import */
        alt="" /* Alt text is handled by aria-label on button */
        className="icons-title"
      />

      {/* --- Original Action Palette content now acts as the inner container --- */}
      {/* --- Note: The className "action-palette" is kept on this inner div --- */}
      <div className="action-palette">
        {/* Category Navigation (remains the same) */}
        <div className="category-navigation">
          <button
            onClick={handlePrevCategory}
            disabled={categoryNames.length <= 1}
            className="category-arrow"
            title="Previous Category"
          >
            &lt;
          </button>
          <h3 className="category-title">{currentCategoryName}</h3>
          <button
            onClick={handleNextCategory}
            disabled={categoryNames.length <= 1}
            className="category-arrow category-arrow-next"
            title="Next Category"
          >
            &gt;
          </button>
        </div>

        {/* Action List - Now a fixed 2x2 Grid */}
        <div className="action-list fixed-grid">
          {actionsToDisplay.length > 0 ? (
            actionsToDisplay.map((action) => (
              <ActionItem key={action.id} action={action} />
            ))
          ) : (
            <p className="no-actions-message">No actions in this category.</p>
          )}
          {/* Fill empty slots if needed for consistent grid structure */}
          {actionsToDisplay.length > 0 &&
            actionsToDisplay.length < ITEMS_PER_PAGE &&
            Array.from({
              length: ITEMS_PER_PAGE - actionsToDisplay.length,
            }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="action-item-placeholder"
              ></div>
            ))}
        </div>

        {/* Pagination Controls */}
        <div className="pagination-controls">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0 || totalPages === 0}
            className="pagination-arrow"
            title="Previous Page"
          >
            &lt; {/* Left Arrow */}
          </button>

          <button
            onClick={handleNextPage}
            disabled={currentPage >= totalPages - 1 || totalPages === 0}
            className="pagination-arrow pagination-arrow-next"
            title="Next Page"
          >
            &gt; {/* Right Arrow */}
          </button>
        </div>
      </div>
      {/* --- End Original Action Palette content --- */}
    </div>
    // --- End NEW Outer Container ---
  );
}

export default ActionPalette;
