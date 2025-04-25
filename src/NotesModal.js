// src/NotesModal.js
import React from "react";

function NotesModal({ isOpen, onClose, notes, onNotesChange }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content notes-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Recipe Notes</h2>
        <textarea
          className="notes-textarea"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add your notes, tips, or variations here..."
          rows={10} // Adjust rows as needed
        />
        {/* Optional: Add a Save button if you prefer explicit saving */}
        {/* <button onClick={onClose}>Done</button> */}
      </div>
    </div>
  );
}

export default NotesModal;
