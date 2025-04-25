// src/App.js
import React, { useState, useCallback, useRef, useEffect } from "react"; // Added useEffect
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { v4 as uuidv4 } from "uuid";
// REMOVE jsPDF and html2canvas imports
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "./firebase";

// --- Import @react-pdf/renderer ---
import { BlobProvider } from "@react-pdf/renderer";
import RecipePdfDocument from "./RecipePdfDocument"; // Import the new PDF component

// ... (other imports remain the same)
import RecipeInfoForm from "./RecipeInfoForm";
import ActionPalette from "./ActionPalette";
import RecipeGrid from "./RecipeGrid";
import SummaryModal from "./SummaryModal";
import ActionItem from "./ActionItem";
// PlacedAction is still needed for the web UI grid
// import PlacedAction from "./PlacedAction";
import { findActionById } from "./actions";
import LandingPage from "./LandingPage";

import "./App.css";

// Define Grid Size
const GRID_SIZE = 5;

// Helper to create the empty state for a square
const createEmptySquare = () => ({ action: null, label: "", miniBoxes: [] });

// Initialize Grid State
const initialGridItems = {};
for (let r = 0; r < GRID_SIZE; r++) {
  for (let c = 0; c < GRID_SIZE; c++) {
    const id = `square-${r}-${c}`;
    initialGridItems[id] = createEmptySquare();
  }
}

function App() {
  // --- State for Landing Page ---
  const [showApp, setShowApp] = useState(false); // <-- Start showing landing page

  const [recipeInfo, setRecipeInfo] = useState({
    name: "",
    author: "",
    cookTime: "",
    date: "",
  });
  const [gridItems, setGridItems] = useState(initialGridItems);
  const [activeDragData, setActiveDragData] = useState(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [qrData, setQrData] = useState("");
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState(null);

  // --- NEW State: PDF Blob ---
  // Store the generated blob temporarily before upload trigger
  const [pdfBlob, setPdfBlob] = useState(null);
  // Flag to indicate if PDF generation is complete (needed by BlobProvider)
  const [pdfGenerated, setPdfGenerated] = useState(false);
  // Flag to trigger PDF generation
  const [triggerPdfGeneration, setTriggerPdfGeneration] = useState(false);

  // Ref for the VISIBLE grid (still needed for print maybe, or just structure)
  const gridRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  // --- Handler to switch from Landing Page to App ---
  const handleStart = () => {
    setShowApp(true); // <-- Set state to show the main app
  };

  // --- Callbacks (handleRecipeInfoChange, handleLabelChange, handleDeleteAction, handleAddMiniBox, handleMiniBoxDelete) remain the same ---
  const handleRecipeInfoChange = (newInfo) => {
    setRecipeInfo(newInfo);
  };

  const handleLabelChange = useCallback((squareId, newLabel) => {
    setGridItems((prev) => ({
      ...prev,
      [squareId]: { ...prev[squareId], label: newLabel },
    }));
  }, []);

  const handleDeleteAction = useCallback((squareIdToDelete) => {
    console.log("Deleting action from square:", squareIdToDelete);
    setGridItems((currentGridItems) => {
      if (!currentGridItems[squareIdToDelete]) {
        console.warn(`Square ${squareIdToDelete} not found for deletion.`);
        return currentGridItems;
      }
      return {
        ...currentGridItems,
        [squareIdToDelete]: createEmptySquare(),
      };
    });
  }, []);

  const handleAddMiniBox = useCallback((squareId) => {
    setGridItems((prev) => {
      const currentSquare = prev[squareId];
      if (!currentSquare || currentSquare.miniBoxes.length >= 3) return prev;

      const positions = ["right", "top", "bottom"];
      const existingPositions = currentSquare.miniBoxes.map(
        (box) => box.position
      );
      let nextPosition = positions.find(
        (pos) => !existingPositions.includes(pos)
      );

      if (!nextPosition) return prev;

      const newMiniBox = { id: uuidv4(), action: null, position: nextPosition };
      console.log(`Adding mini-box at position ${nextPosition} to ${squareId}`);

      return {
        ...prev,
        [squareId]: {
          ...currentSquare,
          miniBoxes: [...currentSquare.miniBoxes, newMiniBox],
        },
      };
    });
  }, []);

  const handleMiniBoxDelete = useCallback((squareId, miniBoxId) => {
    setGridItems((prev) => {
      const currentSquare = prev[squareId];
      if (!currentSquare) return prev;
      return {
        ...prev,
        [squareId]: {
          ...currentSquare,
          miniBoxes: currentSquare.miniBoxes.filter(
            (box) => box.id !== miniBoxId
          ),
        },
      };
    });
  }, []);

  // --- Dnd Handlers (handleDragStart, handleDragEnd, handleDragCancel) remain the same ---
  const handleDragStart = (event) => {
    setActiveDragData(event.active.data.current ?? null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragData(null);
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    const sourceId = active.id;
    const targetId = over.id;

    // Palette -> Grid Square
    if (
      targetId.startsWith("square-") &&
      sourceId.startsWith("action-") &&
      activeData?.action
    ) {
      const action = activeData.action;
      setGridItems((prev) => ({
        ...prev,
        [targetId]: { action: action, label: action.name || "", miniBoxes: [] },
      }));
      return;
    }

    // Grid Square -> Grid Square
    if (
      targetId.startsWith("square-") &&
      sourceId.startsWith("square-") &&
      activeData?.type === "grid-item" &&
      activeData?.item
    ) {
      const draggedItemData = activeData.item;
      setGridItems((prev) => {
        const newGrid = { ...prev };
        newGrid[targetId] = { ...draggedItemData };
        newGrid[sourceId] = createEmptySquare();
        return newGrid;
      });
      return;
    }

    // Palette -> MiniBox
    if (
      targetId.startsWith("minibox-") &&
      sourceId.startsWith("action-") &&
      activeData?.action
    ) {
      const droppedAction = activeData.action;
      const prefix = "minibox-";
      const remainingId = targetId.substring(prefix.length);
      const squareIdParts = remainingId.split("-").slice(0, 3);
      const parentSquareId = squareIdParts.join("-");
      const uuidStartIndex = parentSquareId.length + 1;
      const miniBoxUuid = remainingId.substring(uuidStartIndex);

      console.log("Drop on MiniBox:", {
        targetId,
        sourceId,
        parentSquareId,
        miniBoxUuid,
      });

      setGridItems((prev) => {
        if (!prev[parentSquareId]) {
          console.error("Parent square not found:", parentSquareId);
          return prev;
        }
        let foundMiniBox = false;
        const updatedMiniBoxes = prev[parentSquareId].miniBoxes.map((mb) => {
          if (mb.id === miniBoxUuid) {
            console.log(
              `Updating MiniBox ${mb.id} in square ${parentSquareId}`
            );
            foundMiniBox = true;
            return { ...mb, action: droppedAction };
          }
          return mb;
        });

        if (!foundMiniBox) {
          console.error(
            "Target MiniBox UUID not found:",
            miniBoxUuid,
            parentSquareId
          );
          return prev;
        }
        return {
          ...prev,
          [parentSquareId]: {
            ...prev[parentSquareId],
            miniBoxes: updatedMiniBoxes,
          },
        };
      });
      return;
    }
  };

  const handleDragCancel = () => {
    setActiveDragData(null);
  };

  // --- PDF Generation and Upload Logic ---

  // Function to trigger PDF generation via BlobProvider
  const handleGeneratePdf = () => {
    console.log("Triggering PDF generation...");
    setIsLoadingPdf(true); // Show loading state early
    setPdfError(null);
    setQrData("");
    setPdfBlob(null); // Clear previous blob
    setPdfGenerated(false); // Reset generated flag
    setIsSummaryModalOpen(true); // Open modal
    setTriggerPdfGeneration(true); // Signal BlobProvider to render
  };

  // Function to upload the generated blob
  const uploadPdfBlob = async (blobToUpload) => {
    if (!blobToUpload) {
      console.error("Upload attempt with no blob.");
      setPdfError("PDF Blob was not generated correctly.");
      setIsLoadingPdf(false);
      return;
    }
    console.log("Starting PDF upload...");
    // Keep isLoadingPdf true during upload

    try {
      const pdfFileName = `recipe-${uuidv4()}.pdf`;
      const fileRef = storageRef(storage, `recipes/${pdfFileName}`);
      console.log(`Uploading ${pdfFileName} to Firebase Storage...`);

      const uploadResult = await uploadBytes(fileRef, blobToUpload);
      console.log("Upload successful:", uploadResult);

      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log("Download URL:", downloadURL);

      setQrData(downloadURL); // Set QR data for the modal
      setPdfError(null); // Clear any previous error
    } catch (error) {
      console.error("Error uploading PDF:", error);
      setPdfError(`Failed to upload PDF: ${error.message || error}`);
      setQrData(""); // Clear QR data on error
    } finally {
      setIsLoadingPdf(false); // Turn off loading state
      setTriggerPdfGeneration(false); // Generation/upload cycle complete
      setPdfBlob(null); // Clear the blob from state
      setPdfGenerated(false); // Reset generated flag
    }
  };

  // Effect to upload the blob once it's generated and stored in state
  useEffect(() => {
    if (pdfBlob && pdfGenerated) {
      console.log("Blob detected in state, initiating upload...");
      uploadPdfBlob(pdfBlob);
    }
  }, [pdfBlob, pdfGenerated]); // Depend on blob and the generated flag

  // --- End PDF Logic ---

  // Print function remains the same
  const handlePrint = () => {
    window.print();
  };

  // Drag Overlay rendering remains the same
  const renderDragOverlay = () => {
    if (!activeDragData) return null;
    const action = activeDragData.action || activeDragData.item?.action;
    if (action) {
      return <ActionItem action={action} />; // Use ActionItem for consistent look
    }
    return null;
  };

  // --- Conditional Rendering ---
  if (!showApp) {
    // If showApp is false, render the Landing Page
    return <LandingPage onStart={handleStart} />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="app-container">
        {/* Left and Right Panels remain structurally the same */}
        <div className="left-panel">
          <RecipeInfoForm info={recipeInfo} onChange={handleRecipeInfoChange} />
          <ActionPalette />
        </div>

        <div className="right-panel">
          <div className="recipe-grid-outer-container">
            <div className="recipe-grid-title">
              <h2 className="cooking">COOKING</h2>
              <h2 className="notations">NOTATIONS UI</h2>
            </div>
            {/* RecipeGrid component itself doesn't need changes for PDF generation */}
            <RecipeGrid
              ref={gridRef} // Keep ref if needed for other purposes (like print styling target)
              items={gridItems}
              onLabelChange={handleLabelChange}
              onAddMiniBox={handleAddMiniBox}
              onMiniBoxDelete={handleMiniBoxDelete}
              onDeleteAction={handleDeleteAction}
            />
          </div>
          <div className="action-buttons">
            {/* --- UPDATED SERVE BUTTON --- */}
            <button
              className="serve-button"
              onClick={handleGeneratePdf} // Trigger generation first
              disabled={isLoadingPdf} // Disable while generating/uploading
            >
              {isLoadingPdf ? "Processing PDF..." : "SERVE"}
            </button>
            <button className="print-button" onClick={handlePrint}>
              Print Grid
            </button>
          </div>
        </div>
      </div>

      {/* DragOverlay rendering remains the same */}
      <DragOverlay className="drag-overlay">{renderDragOverlay()}</DragOverlay>

      {/* --- BlobProvider for PDF Generation --- */}
      {/* Render BlobProvider only when triggered */}
      {triggerPdfGeneration && (
        <BlobProvider
          document={
            <RecipePdfDocument recipeInfo={recipeInfo} gridItems={gridItems} />
          }
        >
          {({ blob, url, loading, error }) => {
            // This function runs when the blob status changes

            // Handle loading state (optional, as we use isLoadingPdf)
            // if (loading && !isLoadingPdf) setIsLoadingPdf(true);

            // Handle generation error
            if (error) {
              console.error("Error generating PDF blob:", error);
              // Check if error state isn't already set to avoid loops
              if (!pdfError) {
                setPdfError(
                  `Failed to generate PDF: ${error.message || error}`
                );
                setIsLoadingPdf(false); // Stop loading on error
                setTriggerPdfGeneration(false); // Stop trying to generate
              }
              return null; // Don't proceed further
            }

            // When blob is ready and not already processed
            if (blob && !loading && !pdfGenerated && !pdfBlob) {
              console.log("PDF Blob generated successfully.");
              setPdfBlob(blob); // Store the blob in state
              setPdfGenerated(true); // Mark as generated
              // The useEffect hook will now trigger the upload
            }

            // Render nothing visually here, it works in the background
            return null;
          }}
        </BlobProvider>
      )}

      {/* Summary Modal remains the same, props are updated by the new flow */}
      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => {
          setIsSummaryModalOpen(false);
          // Optionally reset states if modal is closed prematurely
          // setIsLoadingPdf(false);
          // setPdfError(null);
          // setTriggerPdfGeneration(false);
        }}
        qrData={qrData}
        isLoading={isLoadingPdf}
        error={pdfError}
      />
    </DndContext>
  );
}

export default App;
