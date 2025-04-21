// src/App.js
import React, { useState, useCallback, useRef } from "react"; // Import useRef
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
import jsPDF from "jspdf"; // Import jsPDF
import html2canvas from "html2canvas"; // Import html2canvas
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage"; // Firebase imports
import { storage } from "./firebase"; // Import configured storage instance

// ... (other imports remain the same)
import RecipeInfoForm from "./RecipeInfoForm";
import ActionPalette from "./ActionPalette";
import RecipeGrid from "./RecipeGrid";
import SummaryModal from "./SummaryModal";
import ActionItem from "./ActionItem";
import PlacedAction from "./PlacedAction";
import { findActionById } from "./actions";

import "./App.css";

// Define Grid Size
const GRID_SIZE = 5;

// Helper to create the empty state for a square
const createEmptySquare = () => ({ action: null, label: "", miniBoxes: [] }); // miniBoxes is array of {id, action}

// Initialize Grid State with new miniBox structure (KEEP ONLY THIS ONE)
const initialGridItems = {};
for (let r = 0; r < GRID_SIZE; r++) {
  for (let c = 0; c < GRID_SIZE; c++) {
    const id = `square-${r}-${c}`;
    // MiniBoxes now store an action object or null
    initialGridItems[id] = { action: null, label: "", miniBoxes: [] };
  }
}

function App() {
  const [recipeInfo, setRecipeInfo] = useState({
    name: "",
    author: "",
    cookTime: "",
    date: "",
  });
  const [gridItems, setGridItems] = useState(initialGridItems);
  const [activeDragData, setActiveDragData] = useState(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  // const [summaryText, setSummaryText] = useState("");
  const [qrData, setQrData] = useState(""); // Will hold the PDF URL
  const [isLoadingPdf, setIsLoadingPdf] = useState(false); // Loading state
  const [pdfError, setPdfError] = useState(null); // Error state

  const gridRef = useRef(null); // Create a ref for the RecipeGrid

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleRecipeInfoChange = (newInfo) => {
    setRecipeInfo(newInfo);
  };

  // --- Grid Item Update Callbacks (no changes needed) ---
  const handleLabelChange = useCallback((squareId, newLabel) => {
    setGridItems((prev) => ({
      ...prev,
      [squareId]: { ...prev[squareId], label: newLabel },
    }));
  }, []);

  const handleAddMiniBox = useCallback((squareId) => {
    // No longer takes newMiniBox object
    setGridItems((prev) => {
      const newMiniBox = { id: uuidv4(), action: null }; // Initialize with null action
      return {
        ...prev,
        [squareId]: {
          ...prev[squareId],
          miniBoxes: [...prev[squareId].miniBoxes, newMiniBox],
        },
      };
    });
  }, []);

  // const handleMiniBoxChange = useCallback((squareId, miniBoxId, newText) => {
  //   setGridItems((prev) => ({
  //     ...prev,
  //     [squareId]: {
  //       ...prev[squareId],
  //       miniBoxes: prev[squareId].miniBoxes.map((box) =>
  //         box.id === miniBoxId ? { ...box, text: newText } : box
  //       ),
  //     },
  //   }));
  // }, []);

  const handleMiniBoxDelete = useCallback((squareId, miniBoxId) => {
    setGridItems((prev) => ({
      ...prev,
      [squareId]: {
        ...prev[squareId],
        miniBoxes: prev[squareId].miniBoxes.filter(
          (box) => box.id !== miniBoxId
        ),
      },
    }));
  }, []);

  // --- Dnd Handlers ---
  const handleDragStart = (event) => {
    const { active } = event;
    // Store the full data associated with the dragged item
    // active.data.current should contain what we passed in useDraggable
    setActiveDragData(active.data.current ?? null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    const activeData = active.data.current;

    setActiveDragData(null);

    if (!over) {
      // No drop target
      return;
    }

    const sourceId = active.id; // ID of the draggable (e.g., 'action-chop', 'square-0-1')
    const targetId = over.id; // ID of the droppable (e.g., 'square-r-c', 'minibox-square-r-c-uuid')

    // Prevent dropping on self (relevant if items could be dragged out of miniboxes later)
    if (active.id === targetId) {
      return;
    }

    // --- Scenario 1: Dropping a NEW action from Palette onto the MAIN Grid ---
    if (
      targetId.startsWith("square-") &&
      sourceId.startsWith("action-") &&
      activeData?.action
    ) {
      const action = activeData.action;
      setGridItems((prev) => ({
        ...prev,
        [targetId]: {
          ...createEmptySquare(),
          action: action,
          // Keep existing miniBoxes if you want, or reset them:
          // miniBoxes: prev[targetId]?.miniBoxes || [] // Keep existing
          miniBoxes: [], // Reset miniBoxes when main action changes
        },
      }));
      return;
    }

    // --- Scenario 2: Moving an EXISTING item WITHIN the MAIN Grid ---
    if (
      targetId.startsWith("square-") &&
      sourceId.startsWith("square-") &&
      activeData?.type === "grid-item" &&
      activeData?.item
    ) {
      const draggedItemData = activeData.item; // { action, label, miniBoxes }
      setGridItems((prev) => {
        const newGrid = { ...prev };
        newGrid[targetId] = {
          // Place dragged item data
          action: draggedItemData.action,
          label: draggedItemData.label,
          miniBoxes: draggedItemData.miniBoxes, // Move miniBoxes along with the main action
        };
        newGrid[sourceId] = createEmptySquare(); // Clear source
        return newGrid;
      });
      return;
    }

    // --- Scenario 3: Dropping an action FROM PALETTE onto a MINI-BOX ---
    if (
      targetId.startsWith("minibox-") && // Target is a mini-box
      sourceId.startsWith("action-") && // Source is an action from the palette
      activeData?.action
    ) {
      const droppedAction = activeData.action;

      // --- CORRECTED ID PARSING ---
      // Format: minibox-${squareId}-${box.id}
      // Example: minibox-square-1-2-a1b2c3d4-e5f6-7890-abcd-ef1234567890

      const prefix = "minibox-";
      const remainingId = targetId.substring(prefix.length); // e.g., square-1-2-a1b2c3d4-...

      // Find the last hyphen that separates squareId from uuid
      // Square ID is always square-r-c (3 parts)
      const squareIdParts = remainingId.split("-").slice(0, 3); // ['square', 'r', 'c']
      const parentSquareId = squareIdParts.join("-"); // 'square-r-c'

      // The UUID is everything after the squareId and the hyphen following it
      const uuidStartIndex = squareIdParts.join("-").length + 1; // +1 for the hyphen
      const miniBoxUuid = remainingId.substring(uuidStartIndex);

      // --- Add console logs for debugging ---
      console.log("Target ID:", targetId);
      console.log("Source ID:", sourceId);
      console.log("Dropped Action:", droppedAction);
      console.log("Extracted Parent Square ID:", parentSquareId);
      console.log("Extracted MiniBox UUID:", miniBoxUuid);
      // --- End Debug Logs ---

      setGridItems((prev) => {
        // Ensure the parent square exists
        if (!prev[parentSquareId]) {
          console.error("Parent square not found:", parentSquareId);
          return prev; // Return previous state if parent not found
        }

        // Find the target mini-box and update its action
        let foundMiniBox = false; // Flag to check if update happened
        const updatedMiniBoxes = prev[parentSquareId].miniBoxes.map((mb) => {
          if (mb.id === miniBoxUuid) {
            console.log(
              `Updating MiniBox ${mb.id} in square ${parentSquareId}`
            );
            foundMiniBox = true;
            return { ...mb, action: droppedAction }; // Update the action
          }
          return mb;
        });

        // If the target mini-box wasn't found (e.g., parsing error), return prev state
        if (!foundMiniBox) {
          console.error(
            "Target MiniBox UUID not found in parent square:",
            miniBoxUuid,
            parentSquareId
          );
          return prev;
        }

        // Return the updated state
        return {
          ...prev,
          [parentSquareId]: {
            ...prev[parentSquareId],
            miniBoxes: updatedMiniBoxes,
          },
        };
      });
      return; // Handled
    }

    // --- Optional: Handle dragging from Grid back to Palette (Remove item) ---
    // ...

    // --- Optional: Handle dragging from MiniBox (e.g., to clear it or move it) ---
    // This would require making MiniBox draggable and adding more logic here.
  };

  const handleDragCancel = () => {
    setActiveDragData(null); // Clear active item on cancel
  };

  // --- Updated Serve Function ---
  const handleServe = async () => {
    if (!gridRef.current) {
      console.error("Grid reference is not available.");
      setPdfError("Could not find the grid element to generate PDF.");
      setIsSummaryModalOpen(true); // Open modal to show error
      return;
    }

    setIsLoadingPdf(true);
    setPdfError(null); // Clear previous errors
    setQrData(""); // Clear previous QR data
    setIsSummaryModalOpen(true); // Open modal to show loading state

    try {
      // 1. Capture Grid as Canvas using html2canvas
      // Adjust scale for better resolution if needed
      const canvas = await html2canvas(gridRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.9);

      // 2. Create PDF using jsPDF
      // Calculate dimensions to fit A4 page (210 x 297 mm) with margins
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // 10mm margin
      const imgProps = pdf.getImageProperties(imgData); // jsPDF usually detects JPEG automatically
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      let positionY = margin;

      // Add Title/Info (Optional but recommended)
      pdf.setFontSize(16);
      pdf.text(recipeInfo.name || "Untitled Recipe", margin, positionY);
      positionY += 8;
      pdf.setFontSize(10);
      pdf.text(`Author: ${recipeInfo.author || "N/A"}`, margin, positionY);
      positionY += 5;
      pdf.text(`Cook Time: ${recipeInfo.cookTime || "N/A"}`, margin, positionY);
      positionY += 5;
      pdf.text(`Date: ${recipeInfo.date || "N/A"}`, margin, positionY);
      positionY += 10; // Add space before grid image

      // Check if image fits on the current page
      if (positionY + imgHeight > pdfHeight - margin) {
        pdf.addPage(); // Add new page if it doesn't fit
        positionY = margin; // Reset Y position for new page
      }

      pdf.addImage(imgData, "JPEG", margin, positionY, imgWidth, imgHeight);

      // 3. Get PDF as Blob
      const pdfBlob = pdf.output("blob");

      // 4. Upload Blob to Firebase Storage
      const pdfFileName = `recipe-${uuidv4()}.pdf`;
      const fileRef = storageRef(storage, `recipes/${pdfFileName}`); // Path in storage

      console.log(`Uploading ${pdfFileName} to Firebase Storage...`);
      const uploadResult = await uploadBytes(fileRef, pdfBlob);
      console.log("Upload successful:", uploadResult);

      // 5. Get Download URL
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log("Download URL:", downloadURL);

      // 6. Update State
      setQrData(downloadURL); // Set QR data to the PDF URL
      // Keep modal open, loading state will be turned off below
    } catch (error) {
      console.error("Error generating or uploading PDF:", error);
      setPdfError(`Failed to generate/upload PDF: ${error.message}`);
      // Keep modal open to show error
    } finally {
      setIsLoadingPdf(false); // Turn off loading state regardless of success/failure
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // --- Render Drag Overlay Content ---
  const renderDragOverlay = () => {
    if (!activeDragData) return null;

    // If dragging from the palette
    if (activeDragData.action && activeDragData.type !== "grid-item") {
      return (
        <div className="action-item drag-overlay">
          <span>{activeDragData.action.icon}</span>
          <p>{activeDragData.action.name}</p>
        </div>
      );
    }

    // If dragging from the grid
    if (activeDragData.type === "grid-item" && activeDragData.item?.action) {
      // Render a simplified version or a full PlacedAction lookalike
      // For simplicity, let's render something similar to ActionItem
      const { action } = activeDragData.item;
      return (
        <div
          className="placed-action drag-overlay"
          style={{
            backgroundColor: "#fff",
            padding: "10px",
            borderRadius: "4px",
          }}
        >
          <span className="icon">{action.icon}</span>
          {/* Optionally show label */}
          {/* <p style={{fontSize: '0.8em', margin: '2px 0 0', color: '#555'}}>{activeDragData.item.label || action.name}</p> */}
          <p style={{ fontSize: "0.8em", margin: "2px 0 0", color: "#555" }}>
            {action.name}
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="app-container">
        <div className="left-panel">
          <RecipeInfoForm info={recipeInfo} onChange={handleRecipeInfoChange} />
          <ActionPalette />
        </div>

        <div className="right-panel">
          <h2>Cooking Instructions Grid</h2>
          {/* Pass the ref to RecipeGrid */}
          <RecipeGrid
            ref={gridRef}
            items={gridItems}
            onLabelChange={handleLabelChange}
            onAddMiniBox={handleAddMiniBox}
            onMiniBoxDelete={handleMiniBoxDelete}
          />
          <div className="action-buttons">
            {/* Disable button while loading */}
            <button
              className="serve-button"
              onClick={handleServe}
              disabled={isLoadingPdf}
            >
              {isLoadingPdf ? "Generating PDF..." : "Generate PDF & QR"}
            </button>
            <button className="print-button" onClick={handlePrint}>
              Print Grid
            </button>
          </div>
        </div>
      </div>

      <DragOverlay>{renderDragOverlay()}</DragOverlay>

      {/* Update SummaryModal props */}
      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => setIsSummaryModalOpen(false)}
        // summary={summaryText} // Remove or keep if you want text summary too
        qrData={qrData} // Pass the PDF URL (or empty string)
        isLoading={isLoadingPdf} // Pass loading state
        error={pdfError} // Pass error state
      />
    </DndContext>
  );
}

export default App;
