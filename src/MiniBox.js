import React from "react";

function MiniBox({ id, value, onChange, onDelete }) {
  return (
    <div className="mini-box">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        placeholder="Related step/ingredient"
      />
      <button onClick={() => onDelete(id)} title="Remove item">
        ×
      </button>
    </div>
  );
}

export default MiniBox;
