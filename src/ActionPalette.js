import React from "react";
import ActionItem from "./ActionItem";
import { AVAILABLE_ACTIONS } from "./actions";

function ActionPalette() {
  return (
    <div className="action-palette">
      <h3>Available Actions</h3>
      <div className="action-list">
        {AVAILABLE_ACTIONS.map((action) => (
          <ActionItem key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}

export default ActionPalette;
