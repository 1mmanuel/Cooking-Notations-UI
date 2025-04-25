// src/LandingPage.js
import React from "react";

function LandingPage({ onStart }) {
  return (
    <div className="landing-page-container">
      {/* Replace the old h1 and p */}
      <div className="landing-title-wrapper">
        <h1 className="landing-title-cooking">COOKING</h1>
        <div className="landing-title-notations-ui">NOTATIONS UI</div>
      </div>
      {/* Keep the button */}
      <button onClick={onStart} className="start-button">
        Start
      </button>
    </div>
  );
}

export default LandingPage;
