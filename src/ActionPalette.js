// src/ActionPalette.js
import React, { useState, useEffect } from "react"; // Import useEffect
import ActionItem from "./ActionItem";
import { CATEGORIZED_ACTIONS } from "./actions";

const ITEMS_PER_PAGE = 4; // 2x2 grid

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
    // Page reset is handled by the useEffect hook
  };

  const handlePrevCategory = () => {
    setCurrentCategoryIndex((prevIndex) =>
      prevIndex === 0 ? categoryNames.length - 1 : prevIndex - 1
    );
    // Page reset is handled by the useEffect hook
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
          className="category-arrow"
          title="Next Category"
        >
          &gt;
        </button>
      </div>

      {/* Action List - Now a fixed 2x2 Grid */}
      <div className="action-list fixed-grid">
        {" "}
        {/* Add 'fixed-grid' class */}
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
          Array.from({ length: ITEMS_PER_PAGE - actionsToDisplay.length }).map(
            (_, index) => (
              <div
                key={`placeholder-${index}`}
                className="action-item-placeholder"
              ></div>
            )
          )}
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
        <span className="page-indicator">
          {/* Show page number only if there are items */}
          {totalPages > 0 ? `Page ${currentPage + 1} of ${totalPages}` : ""}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
          className="pagination-arrow"
          title="Next Page"
        >
          &gt; {/* Right Arrow */}
        </button>
      </div>
    </div>
  );
}

export default ActionPalette;
