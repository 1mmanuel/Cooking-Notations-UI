// src/RecipePdfDocument.js
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Svg,
  Path,
  Font,
  Image,
  Circle,
  Rect,
  Ellipse,
  Line,
  Polygon,
  Polyline,
} from "@react-pdf/renderer";
import iconPdfData from "./iconPdfData";

// --- Font Registration (remains the same) ---
Font.register({
  family: "MyFont",
  fonts: [
    {
      src: "/fonts/fonnts.com-DegularDemo-Black.otf",
      fontWeight: 900,
    },
  ],
});
// --- End Font Registration ---

// --- Styles ---
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#f9db92", // Matches UI grid background (also used for page)
    padding: 25,
    fontFamily: "MyFont",
  },
  // --- MODIFIED: Info Section Styles ---
  infoSection: {
    marginBottom: 10, // Space below the section
    padding: 10, // Match UI padding (15px -> 15pt)
    backgroundColor: "#f9db92", // Match UI background
    borderRadius: 15, // Match UI border-radius
    border: "1pt solid #000000", // Add border to mimic UI visual boundary
    // Box-shadow is not directly supported, border is the closest alternative
  },
  // --- MODIFIED: Details Heading Styles ---
  detailsHeading: {
    fontSize: 14, // Keep size or adjust if needed
    fontWeight: 900, // Keep font weight
    marginBottom: 8, // Space below heading
    color: "#333333", // Match UI h2 color
    fontFamily: "MyFont", // Keep font family
    textAlign: "center", // Keep centered
  },
  // --- MODIFIED: Info Text Styles ---
  infoText: {
    fontSize: 10, // Keep size or adjust
    marginBottom: 5, // Space between lines
    color: "#333333", // Match UI label color
    fontFamily: "MyFont", // Keep font family
  },
  // --- NEW: Outer Container for Title + Grid ---
  outerGridArea: {
    // Add border, radius, and padding to match UI structure
    border: "1pt solid #000000", // Add the border
    borderRadius: 15, // Add the border radius
    padding: 15, // Add padding inside the border
    backgroundColor: "#f68e3e", // Match UI outer container background
    boxSizing: "border-box", // Ensure padding is included correctly
    // marginBottom: 20, // Optional: Add space below this whole section if needed
  },

  // --- MODIFIED: Grid Title Container Styles ---
  gridTitleContainer: {
    position: "relative", // Keep relative positioning
    overflow: "hidden", // Keep overflow hidden for cropping
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    border: "1pt solid #000000",
    borderRadius: 15,
    backgroundColor: "#f68e3e", // Fallback background color
    alignItems: "center",
  },
  // --- MODIFIED: Background Image Style ---
  titleBackgroundImage: {
    position: "absolute",
    // Set BOTH width and height to the same large percentage
    width: "1000%", // e.g., 10x zoom
    height: "9000%", // Match the width percentage
    // Adjust top/left to center the oversized image
    // (1000% - 100%) / 2 = 450% -> shift by -450%
    top: "-450%",
    left: "-450%",
    // This will likely distort the image's overall aspect ratio if it's not square,
    // but it ensures the image is rendered and zoomed.
  },
  // --- Grid Title Text Styles ---
  gridTitleText: {
    fontSize: 22,
    fontWeight: 900,
    color: "#f9db92", // Ensure contrast
    fontFamily: "MyFont",
    textAlign: "center",
  },

  // --- Grid Styles ---
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    padding: 15, // Padding inside the container
    backgroundColor: "#f9db92",
    border: "1pt solid #000000",
    borderRadius: 15,
    boxSizing: "border-box",
    // --- ADD: Helps align items when wrapping occurs ---
    // alignItems: 'flex-start', // Align items to the start of the cross axis
  },
  gridSquare: {
    // --- MODIFIED: Slightly reduce width to prevent wrapping issues ---
    width: "17.8%", // Reduced from 18%
    // Total width per item: 17.8% + 1% (left margin) + 1% (right margin) = 19.8%
    // 5 * 19.8% = 99%, leaving a small buffer.

    margin: "1%", // Keep margin for spacing
    aspectRatio: 1,
    minHeight: 96,
    border: "1pt solid #000000",
    borderRadius: 15,
    backgroundColor: "#f3c35b",
    position: "relative",
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    overflow: "visible",
  },
  emptySquare: {
    backgroundColor: "#f3c35b",
    borderStyle: "dashed",
    borderColor: "#000000",
    borderWidth: "1pt",
  },

  // --- Placed Action Styles (remain the same) ---
  placedActionView: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexDirection: "column",
    padding: 3, // Padding inside the square for the action content
  },
  actionIconView: {
    width: "55%",
    height: "55%",
    marginBottom: 5,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  actionLabel: {
    fontSize: 8.5,
    textAlign: "center",
    color: "#333333", // UI uses #333
    maxWidth: "95%",
    fontFamily: "MyFont", // Apply font
    fontWeight: 900, // Apply available weight
  },

  // --- Mini Box Styles (remain the same for now) ---
  miniBoxBase: {
    position: "absolute",
    width: 26,
    height: 22, // Height is 22pt
    border: "1pt solid #000000", // Match UI border
    backgroundColor: "#f3c35b",
    borderRadius: 3,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    zIndex: 10,
  },

  // --- Positioning Styles based on UI ---

  // Position 1: Center Right (Corresponds to miniBox.position === 'right')
  // --- MODIFIED: Use top: 50% + negative marginTop ---
  miniBoxPosRightCenter: {
    top: "50%", // Position top edge at parent's vertical center
    left: "100%",
    // Apply negative margin equal to half the height (22pt / 2 = 11pt)
    marginTop: -11, // Pull the box UP by half its height
    marginLeft: -10, // Keep horizontal overlap
    // Remove bottom and transform from previous attempts
    // bottom: "50%",
    // transform: "translateY(11pt)",
  },
  // --- End MODIFICATION ---

  // Position 2: Top Right (Corresponds to miniBox.position === 'top')
  miniBoxPosTopRight: {
    bottom: "50%", // Align bottom edge to parent's vertical center
    left: "100%",
    marginLeft: -10,
    // Push UPWARDS from the center line. Value = (approx height/2 + gap)
    // Using PDF height (22pt) and assuming 3pt gap: (22/2) + 3 = 14pt
    marginBottom: 14, // Keep this calculation
  },

  // Position 3: Bottom Right (Corresponds to miniBox.position === 'bottom')
  miniBoxPosBottomRight: {
    top: "50%", // Align top edge to parent's vertical center
    left: "100%",
    marginLeft: -10,
    // Push DOWNWARDS from the center line. Value = (approx height/2 + gap)
    // Using PDF height (22pt) and assuming 3pt gap: (22/2) + 3 = 14pt
    marginTop: 14, // Keep this calculation
  },

  miniBoxIconView: {
    width: "80%",
    height: "80%",
    alignItems: "center",
    justifyContent: "center",
  },
  svgPlaceholder: {
    fontSize: 7,
    color: "#999999",
    textAlign: "center",
    fontFamily: "MyFont",
    fontWeight: 900,
  },

  // --- NEW: Notes Section Styles ---
  notesSection: {
    marginTop: 15, // Add space above the notes section
    marginBottom: 10,
    padding: 10,
    border: "1pt solid #000000",
    borderRadius: 10,
    backgroundColor: "#f9db92", // Match info section background
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: 900,
    marginBottom: 8,
    color: "#333333",
    fontFamily: "MyFont",
    textAlign: "center",
  },
  notesText: {
    fontSize: 10,
    color: "#333333",
    fontFamily: "MyFont",
    // Allow text to wrap naturally
  },
  // --- End Notes Section Styles ---
});
// --- End Styles ---

// --- RenderSvgIcon Component (remains the same) ---
const RenderSvgIcon = ({ action, style }) => {
  if (!action || !action.id) {
    // ... (existing null/invalid action handling) ...
    return (
      <View style={style}>
        <Text style={styles.svgPlaceholder}>ICON</Text>
      </View>
    );
  }
  const baseId = action.id.startsWith("action-")
    ? action.id.substring("action-".length)
    : action.id;

  let specificIconData = null;
  try {
    specificIconData = iconPdfData[baseId];
  } catch (e) {
    console.error("Error accessing iconPdfData:", e);
  }

  // --- Check for 'elements' array now ---
  if (
    !specificIconData ||
    !specificIconData.viewBox ||
    !specificIconData.elements ||
    specificIconData.elements.length === 0
  ) {
    // ... (existing placeholder logic) ...
    return (
      <View style={style}>
        <Text style={styles.svgPlaceholder}>
          {action?.name ? action.name.substring(0, 3).toUpperCase() : "ICON"}
        </Text>
      </View>
    );
  }

  return (
    <View style={style}>
      <Svg
        viewBox={specificIconData.viewBox}
        style={{ width: "100%", height: "100%" }}
      >
        {specificIconData.elements.map((elData, index) => {
          // --- Define the key separately ---
          const key = index; // Using index as key is acceptable here if elements don't reorder

          // --- commonProps WITHOUT the key ---
          const commonProps = {
            fill: elData.fill || "#000000",
            stroke: elData.stroke || "none",
            // transform: elData.transform || undefined // Still might not be supported
          };

          // --- Apply the key DIRECTLY to the returned element ---
          switch (elData.type) {
            case "path":
              return <Path key={key} {...commonProps} d={elData.d} />;
            case "circle":
              return (
                <Circle
                  key={key}
                  {...commonProps}
                  cx={elData.cx}
                  cy={elData.cy}
                  r={elData.r}
                />
              );
            case "rect":
              return (
                <Rect
                  key={key}
                  {...commonProps}
                  x={elData.x}
                  y={elData.y}
                  width={elData.width}
                  height={elData.height}
                />
              );
            case "ellipse":
              return (
                <Ellipse
                  key={key}
                  {...commonProps}
                  cx={elData.cx}
                  cy={elData.cy}
                  rx={elData.rx}
                  ry={elData.ry}
                />
              );
            case "line":
              if (commonProps.fill === "none" || !commonProps.fill)
                commonProps.stroke = elData.stroke || "#000000";
              return (
                <Line
                  key={key}
                  {...commonProps}
                  x1={elData.x1}
                  y1={elData.y1}
                  x2={elData.x2}
                  y2={elData.y2}
                />
              );
            case "polygon":
              return (
                <Polygon key={key} {...commonProps} points={elData.points} />
              );
            case "polyline":
              if (commonProps.fill === "none" || !commonProps.fill)
                commonProps.stroke = elData.stroke || "#000000";
              return (
                <Polyline key={key} {...commonProps} points={elData.points} />
              );
            default:
              console.warn(
                `Unsupported element type in PDF renderer: ${elData.type}`
              );
              // Return null with a key for consistency if needed, though React handles null fine.
              return null;
          }
        })}
      </Svg>
    </View>
  );
};
// --- End RenderSvgIcon Component ---

// --- MODIFIED: PdfMiniBox Component ---
const PdfMiniBox = ({ miniBox }) => {
  if (!miniBox || !miniBox.position) return null;

  let positionStyle;
  switch (miniBox.position) {
    case "right":
      positionStyle = styles.miniBoxPosRightCenter;
      break;
    case "top":
      positionStyle = styles.miniBoxPosTopRight;
      break;
    case "bottom":
      positionStyle = styles.miniBoxPosBottomRight;
      break;
    default:
      positionStyle = {};
  }

  // Use the base style defined in StyleSheet
  const baseStyle = styles.miniBoxBase;

  return (
    <View style={[baseStyle, positionStyle]}>
      {miniBox.action && (
        <RenderSvgIcon action={miniBox.action} style={styles.miniBoxIconView} />
      )}
    </View>
  );
};
// --- End MODIFIED: PdfMiniBox Component ---

// --- PdfPlacedAction Component (remains the same) ---
const PdfPlacedAction = ({ item }) => {
  // ... (implementation)
  if (!item || !item.action) return null;
  return (
    <View style={styles.placedActionView}>
      <RenderSvgIcon action={item.action} style={styles.actionIconView} />
      {item.label && <Text style={styles.actionLabel}>{item.label}</Text>}
      {item.miniBoxes &&
        item.miniBoxes.map((mb) => <PdfMiniBox key={mb.id} miniBox={mb} />)}
    </View>
  );
};

// --- PdfGridSquare Component (remains the same) ---
const PdfGridSquare = ({ item }) => {
  // ... (implementation)
  const isEmpty = !item || !item.action;
  return (
    <View style={[styles.gridSquare, isEmpty && styles.emptySquare]}>
      {!isEmpty && <PdfPlacedAction item={item} />}
    </View>
  );
};

// --- Main Document Component (remains the same) ---
const RecipePdfDocument = ({ recipeInfo, gridItems, notes }) => {
  // ... (implementation)
  const sortedGridKeys = Object.keys(gridItems).sort((a, b) => {
    const [, rA, cA] = a.split("-");
    const [, rB, cB] = b.split("-");
    if (rA !== rB) return parseInt(rA) - parseInt(rB);
    return parseInt(cA) - parseInt(cB);
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* --- Info Section --- */}
        <View style={styles.infoSection}>
          <Text style={styles.detailsHeading}>DETAILS</Text>
          <Text style={styles.infoText}>
            Recipe Name: {recipeInfo.name || "Untitled Recipe"}
          </Text>
          <Text style={styles.infoText}>
            Author: {recipeInfo.author || "N/A"}
          </Text>
          <Text style={styles.infoText}>
            Total Time: {recipeInfo.cookTime || "N/A"}
          </Text>
          <Text style={styles.infoText}>Date: {recipeInfo.date || "N/A"}</Text>
        </View>

        {/* --- Grid Title Section --- */}
        <View style={styles.outerGridArea}>
          {/* --- Grid Title Section --- */}
          <View style={styles.gridTitleContainer}>
            {/* --- ADDED: Background Image --- */}
            {/* Make sure the path is correct relative to the public folder */}
            {/* <Image
              style={styles.titleBackgroundImage}
              src="/designs/Pattern-MASSIVE.png" // <-- Adjust path if needed
            /> */}
            {/* --- Text remains the same --- */}
            <Text style={styles.gridTitleText}>COOKING NOTATIONS UI</Text>
          </View>

          {/* --- Recipe Grid Section --- */}
          <View style={styles.gridContainer}>
            {sortedGridKeys.map((key) => (
              <PdfGridSquare key={key} item={gridItems[key]} />
            ))}
          </View>
        </View>

        {/* --- NEW: Notes Section --- */}
        {/* Only render if notes exist */}
        {notes && notes.trim() !== "" && (
          <View style={styles.notesSection} wrap={false}>
            {/* wrap={false} tries to keep notes together */}
            <Text style={styles.notesTitle}>NOTES</Text>
            <Text style={styles.notesText}>{notes}</Text>
          </View>
        )}
        {/* --- End Notes Section --- */}
      </Page>
    </Document>
  );
};

export default RecipePdfDocument;
