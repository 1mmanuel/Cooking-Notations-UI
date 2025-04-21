// src/SummaryModal.js
import React from "react";
import { QRCodeSVG } from "qrcode.react";

// Add isLoading and error props
function SummaryModal({ isOpen, onClose, qrData, isLoading, error }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
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
