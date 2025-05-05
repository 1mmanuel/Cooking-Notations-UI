// src/PdfGenerationHandler.js (New File)
import React, { useEffect } from "react";

function PdfGenerationHandler({
  blob,
  loading,
  error,
  triggerPdfGeneration, // Pass these states down
  pdfGenerated,
  pdfBlob,
  pdfError,
  setPdfBlob, // Pass setter functions down
  setPdfGenerated,
  setPdfError,
  setIsLoadingPdf,
  setTriggerPdfGeneration,
}) {
  // Now useEffect is called at the top level of this function component - which is valid!
  useEffect(() => {
    // Handle generation error first
    if (error) {
      console.error(
        "Error generating PDF blob (inside PdfGenerationHandler):",
        error
      );
      // Check if error state isn't already set and generation was triggered
      if (!pdfError && triggerPdfGeneration) {
        setPdfError(`Failed to generate PDF: ${error.message || error}`);
        setIsLoadingPdf(false); // Stop loading on error
        setTriggerPdfGeneration(false); // Stop trying to generate
      }
      return; // Don't proceed further if there was an error
    }

    // When blob is ready and not already processed
    if (blob && !loading && !pdfGenerated && !pdfBlob && triggerPdfGeneration) {
      setPdfBlob(blob);
      setPdfGenerated(true);
      // The useEffect in App depending on [pdfBlob, pdfGenerated] will trigger the upload
    }

    // Add all props used inside the effect (including setters if ESLint requires)
  }, [
    blob,
    loading,
    error,
    pdfGenerated,
    pdfBlob,
    pdfError,
    triggerPdfGeneration,
    setPdfBlob,
    setPdfGenerated,
    setPdfError,
    setIsLoadingPdf,
    setTriggerPdfGeneration,
  ]);

  // This component is only for side effects, it doesn't render anything visual
  return null;
}

export default PdfGenerationHandler;
