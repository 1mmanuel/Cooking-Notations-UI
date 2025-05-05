// src/SummaryModal.js
import React from "react";
import { QRCodeSVG } from "qrcode.react";

// Add isLoading and error props
function SummaryModal({ isOpen, onClose, qrData, isLoading, error }) {
  if (!isOpen) return null;

  // --- NEW: Internal close handler ---
  // This function checks if loading is in progress before calling the actual onClose prop
  const handleCloseAttempt = () => {
    // Only call the passed onClose function if NOT loading
    if (!isLoading) {
      onClose();
    } else {
      // Optional: Log or provide feedback that closing is disabled during loading
      console.log("Cannot close modal while PDF is generating/uploading.");
      // You could add a brief visual cue or message if desired, but simply
      // preventing the close is the main goal.
    }
  };
  // --- END NEW ---

  return (
    // --- MODIFIED: Use handleCloseAttempt for the overlay click ---
    <div className="modal-overlay" onClick={handleCloseAttempt}>
      {/* Keep stopPropagation on the content itself */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* --- MODIFIED: Use handleCloseAttempt for the close button --- */}
        {/* --- ADDED: disabled attribute based on isLoading --- */}
        <button
          className="modal-close-button"
          onClick={handleCloseAttempt}
          disabled={isLoading} // Visually disable the button while loading
          aria-disabled={isLoading} // Accessibility attribute
          title={isLoading ? "Generating PDF..." : "Close"} // Update tooltip
        >
          &times;
        </button>
        <h2>Recipe PDF Link</h2>

        {/* Loading State */}
        {isLoading && (
          <div className="modal-loading">
            <p>Generating and uploading PDF, please wait...</p>
            {/* Optional: Add a spinner animation here */}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="modal-error">
            <p style={{ color: "red" }}>Error:</p>
            <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>{error}</pre>
          </div>
        )}

        {/* Success State (QR Code) */}
        {qrData && !isLoading && !error && (
          <div className="qr-code-container">
            <p>Scan QR Code to download the recipe PDF:</p>
            <QRCodeSVG value={qrData} size={128} />
            <p style={{ marginTop: "10px", fontSize: "0.8em" }}>
              Or open link:{" "}
              <a href={qrData} target="_blank" rel="noopener noreferrer">
                Download PDF
              </a>
            </p>
          </div>
        )}

        {/* Optional: Message if nothing is ready yet (e.g., initial open) */}
        {!isLoading && !error && !qrData && (
          <p>Click "Generate PDF & QR" to create the recipe document.</p>
        )}
      </div>
    </div>
  );
}

export default SummaryModal;
