// src/LandingPage.js
import React from "react";
import CookingPNG from "./designs/cooking.png";
import StartPNG from "./designs/start.png"; // Import the new image

function LandingPage({ onStart }) {
  return (
    <div className="landing-page-container">
      {/* Replace the old h1 and p */}
      <div className="landing-title-wrapper">
        <img
          src={CookingPNG} /* Use the URL from the default import */
          alt="" /* Alt text is handled by aria-label on button */
          className="landing-cooking-icon"
        />
      </div>
      {/* Keep the button */}
      <button onClick={onStart} className="start-button">
        <img
          src={StartPNG} /* Use the URL from the default import */
          alt="" /* Alt text is handled by aria-label on button */
          className="start-icon"
        />
      </button>
    </div>
  );
}

export default LandingPage;
