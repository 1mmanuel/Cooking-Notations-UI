// src/PlacedAction.js
import React, { useState, useEffect } from "react"; // Need state & effect
import MiniBox from "./MiniBox";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function PlacedAction({
  squareId,
  // action, // <-- REMOVE this prop
  // label, // <-- REMOVE this prop
  // miniBoxes, // <-- REMOVE this prop
  item, // <-- ADD item prop containing { action, originalLabel, currentLabel, miniBoxes }
  onLabelChange,
  onAddMiniBox,
  onMiniBoxDelete,
  onDeleteAction,
}) {
  // --- State for controlled input ---
  // Initialize with currentLabel, fall back to old label or action name if needed
  const initialLabel =
    item?.currentLabel !== undefined
      ? item.currentLabel
      : item?.label || item?.action?.name || "";
  const [inputValue, setInputValue] = useState(initialLabel);

  // --- Effect to update input value if item.currentLabel changes externally ---
  useEffect(() => {
    const updatedLabel =
      item?.currentLabel !== undefined
        ? item.currentLabel
        : item?.label || item?.action?.name || "";
    setInputValue(updatedLabel);
  }, [item?.currentLabel, item?.label, item?.action?.name]); // Depend on potential label sources
  // --- End Effect ---

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: squareId, // Use squareId as the draggable ID for grid items
      data: {
        type: "grid-item",
        // Pass the *current* item state, including potentially updated labels
        item: { ...item, currentLabel: inputValue }, // Include local input value for drag data if needed
        sourceId: squareId,
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
    touchAction: "none",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "5px",
    overflow: "visible",
  };

  // Use item.action now
  if (!item || !item.action) return null;

  // Get the SVG component for the main action
  const MainIconComponent = item.action.icon;

  const handleRevealMiniBoxClick = (e) => {
    e.stopPropagation();
    onAddMiniBox(squareId);
  };

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (onDeleteAction) {
      onDeleteAction(squareId);
    }
  };

  // Use item.miniBoxes now
  const currentMiniBoxes = item.miniBoxes || []; // Ensure miniBoxes is an array
  const shouldShowAddButton = currentMiniBoxes.length < 3;
  const miniBoxRight = currentMiniBoxes.find((box) => box.position === "right");
  const miniBoxTop = currentMiniBoxes.find((box) => box.position === "top");
  const miniBoxBottom = currentMiniBoxes.find(
    (box) => box.position === "bottom"
  );

  const renderMiniBox = (boxData) => {
    if (!boxData) return null;
    const miniBoxDroppableId = `minibox-${squareId}-${boxData.id}`;
    return (
      <MiniBox
        key={boxData.id}
        id={boxData.id}
        droppableId={miniBoxDroppableId}
        action={boxData.action}
        onDelete={onMiniBoxDelete}
        parentSquareId={squareId}
      />
    );
  };

  // --- Handlers for Input ---
  const handleInputChange = (e) => {
    setInputValue(e.target.value); // Update local state while typing
  };

  const handleInputBlur = () => {
    // Determine the label that was originally passed in (currentLabel or fallback)
    const originalCurrentLabel =
      item?.currentLabel !== undefined
        ? item.currentLabel
        : item?.label || item?.action?.name || "";
    // Call onLabelChange only if the input value has actually changed
    if (inputValue !== originalCurrentLabel) {
      onLabelChange(squareId, inputValue);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter") {
      handleInputBlur(); // Treat Enter the same as blur
      e.target.blur(); // Optionally remove focus
    }
  };
  // --- End Input Handlers ---

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`placed-action ${isDragging ? "dragging" : ""}`}
      onContextMenu={handleContextMenu}
      // Use item.action.name for the base tooltip
      title={`${item.action.name} (Right-click to delete)`}
    >
      {/* Main content (Icon and Label) */}
      {MainIconComponent && (
        <span className="icon-wrapper">
          <MainIconComponent className="svg-icon placed-action-icon" />
        </span>
      )}
      <input
        type="text"
        className="label-input"
        value={inputValue} // Use local state for value
        onChange={handleInputChange} // Update local state on change
        onBlur={handleInputBlur} // Call parent handler on blur
        onKeyDown={handleInputKeyDown} // Call parent handler on Enter
        placeholder="Label this action"
        onPointerDown={(e) => e.stopPropagation()} // Prevent drag start on input
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling, DO NOT CLEAR INPUT HERE
        onTouchStart={(e) => e.stopPropagation()} // Prevent drag on touch
        onContextMenu={(e) => e.stopPropagation()} // Prevent context menu interference
        style={{ pointerEvents: isDragging ? "none" : "auto" }}
        // Use item.originalLabel for accessibility if available
        aria-label={`Label for ${item.originalLabel || item.action.name}`}
      />

      {/* Conditional '+' Button */}
      {shouldShowAddButton && !isDragging && (
        <button
          className="reveal-mini-box-button"
          onClick={handleRevealMiniBoxClick}
          title="Add related action slot"
          onPointerDown={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          +
        </button>
      )}

      {/* Render MiniBoxes */}
      {miniBoxRight && (
        <div
          className="mini-box-container-right"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {renderMiniBox(miniBoxRight)}
        </div>
      )}
      {miniBoxTop && (
        <div
          className="mini-box-container-top"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {renderMiniBox(miniBoxTop)}
        </div>
      )}
      {miniBoxBottom && (
        <div
          className="mini-box-container-bottom"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onContextMenu={(e) => e.stopPropagation()}
        >
          {renderMiniBox(miniBoxBottom)}
        </div>
      )}
    </div>
  );
}

export default PlacedAction;
