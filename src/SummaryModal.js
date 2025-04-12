import React from "react";
// Corrected import: Use named import QRCodeSVG instead of default import QRCode
import { QRCodeSVG } from "qrcode.react";

function SummaryModal({ isOpen, onClose, summary, qrData }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2>Recipe Summary</h2>
        <pre className="summary-text">{summary}</pre>
        {qrData && (
          <div className="qr-code-container">
            <p>Scan QR Code to download recipe data:</p>
            {/* Corrected usage: Use the imported QRCodeSVG component */}
            <QRCodeSVG value={qrData} size={128} />
          </div>
        )}
      </div>
    </div>
  );
}

export default SummaryModal;
