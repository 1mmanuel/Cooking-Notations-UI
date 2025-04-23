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
  Font, // Import Font
} from "@react-pdf/renderer";
import iconPdfData from "./iconPdfData";

// --- Font Registration (Example - uncomment and adjust if you use custom fonts) ---
/*
// Make sure you have the font files (e.g., .ttf) in your public folder or accessible path
Font.register({
  family: 'YourWebFontName', // e.g., 'Roboto' or 'Inter'
  fonts: [
    { src: '/fonts/YourWebFont-Regular.ttf' }, // Path relative to public folder
    { src: '/fonts/YourWebFont-Bold.ttf', fontWeight: 'bold' },
    // Add other weights/styles if needed (italic, etc.)
  ]
});
*/
// --- End Font Registration ---

// --- Styles ---
// Adjusted to more closely match typical web UI styles and proportions
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    // Match the background from html2canvas attempt or use white
    backgroundColor: "#f9db92", // Or '#FFFFFF' for white
    padding: 20, // Approx 20mm margin
    // fontFamily: 'YourWebFontName', // Use registered custom font name here if applicable
    fontFamily: "Helvetica", // Default fallback
  },
  section: {
    marginBottom: 15, // Increased spacing
  },
  title: {
    fontSize: 20, // Larger title
    marginBottom: 8,
    // fontFamily: 'YourWebFontName', // Use custom font if registered
    fontWeight: "bold",
    color: "#333333", // Darker color
    textAlign: "center", // Center title maybe?
  },
  infoText: {
    fontSize: 10,
    marginBottom: 4,
    color: "#555555", // Slightly lighter text
    // fontFamily: 'YourWebFontName', // Use custom font if registered
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    // Use a subtle border or none for the container?
    // border: '1pt solid #e0e0e0',
    marginTop: 15,
  },
  gridSquare: {
    width: "20%", // 5 columns
    // Make it square based on calculated width (A4: ~170mm usable / 5 = 34mm)
    // Convert mm to pt (1mm ~ 2.83pt) -> 34 * 2.83 = ~96pt
    height: 96, // Use points for height to match width percentage effect
    aspectRatio: 1, // Try to enforce squareness
    border: "0.75pt solid #cccccc", // Approx 1px border
    backgroundColor: "#f0f0f0", // Light grey for filled squares (adjust)
    position: "relative",
    padding: 5, // Internal padding
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  },
  emptySquare: {
    backgroundColor: "#fafafa", // Slightly different background for empty (adjust)
    // border: '0.75pt dashed #dddddd', // Optional: Dashed border for empty
  },
  placedActionView: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    // justifyContent: 'space-between', // Maybe space icon and text? Or keep center?
    justifyContent: "center", // Center might look cleaner
    position: "relative",
    flexDirection: "column",
    padding: 3, // Inner padding for icon/text
  },
  actionIconView: {
    // Adjust size relative to square (96pt height)
    width: "60%", // Percentage of the square width
    height: "60%", // Percentage of the square height
    // marginBottom: 4, // Space between icon and label
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0, // Prevent icon from shrinking too much
  },
  actionLabel: {
    fontSize: 8, // Slightly larger label text
    textAlign: "center",
    color: "#333333",
    marginTop: 4, // Space above label
    maxWidth: "95%", // Allow wrapping
    // fontFamily: 'YourWebFontName', // Use custom font if registered
  },
  miniBoxBase: {
    position: "absolute",
    // Estimate size relative to square (96pt) - maybe ~1/4 size? ~24pt?
    // Or use mm: ~10mm * 2.83 = ~28pt
    width: 28,
    height: 24,
    border: "0.5pt solid #b0b0b0", // Slightly darker border for mini-box
    backgroundColor: "#ffffff", // White background
    borderRadius: 2, // Slight rounding
    padding: 2, // Small internal padding
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  // Recalculate positioning based on miniBox size (W:28, H:24) and square size (96)
  miniBoxRight: {
    right: -14, // Halfway out the right edge (28 / 2)
    top: "50%",
    transform: "translateY(-12pt)", // Center vertically (24 / 2)
  },
  miniBoxTop: {
    top: -12, // Halfway out the top edge (24 / 2)
    left: "50%",
    transform: "translateX(-14pt)", // Center horizontally (28 / 2)
  },
  miniBoxBottom: {
    bottom: -12, // Halfway out the bottom edge (24 / 2)
    left: "50%",
    transform: "translateX(-14pt)", // Center horizontally (28 / 2)
  },
  miniBoxIconView: {
    width: "85%", // Icon size within mini-box
    height: "85%",
    alignItems: "center",
    justifyContent: "center",
  },
  svgPlaceholder: {
    fontSize: 6, // Slightly larger placeholder
    color: "#888888",
    textAlign: "center",
  },
});
// --- End Styles ---

// --- CORRECTED RenderSvgIcon (No changes needed from previous version) ---
const RenderSvgIcon = ({ action, style }) => {
  // 1. Check if action and action.id exist
  if (!action || !action.id) {
    console.warn("RenderSvgIcon: Received null or invalid action object.");
    return (
      <View style={style}>
        <Text style={styles.svgPlaceholder}>ICON</Text>
      </View>
    );
  }

  // 2. Extract the base ID (remove "action-")
  const baseId = action.id.startsWith("action-")
    ? action.id.substring("action-".length)
    : action.id;

  // 3. Look up using the base ID in the imported iconPdfData
  let specificIconData = null;
  try {
    specificIconData = iconPdfData[baseId];
  } catch (e) {
    console.error("Error accessing iconPdfData:", e);
    specificIconData = null;
  }

  // 4. Check if data was found and is valid
  if (
    !specificIconData ||
    !specificIconData.viewBox ||
    !specificIconData.paths
  ) {
    console.warn(
      `RenderSvgIcon: Missing or invalid PDF icon data for action ID: ${action.id} (Lookup key: ${baseId})`
    );
    return (
      <View style={style}>
        <Text style={styles.svgPlaceholder}>
          {action?.name ? action.name.substring(0, 3).toUpperCase() : "ICON"}
        </Text>
      </View>
    );
  }

  // 5. Render the SVG using the found data
  return (
    <View style={style}>
      <Svg
        viewBox={specificIconData.viewBox}
        style={{ width: "100%", height: "100%" }}
      >
        {specificIconData.paths.length > 0 &&
          specificIconData.paths.map((pathData, index) => (
            <Path
              key={index}
              d={pathData.d}
              fill={pathData.fill || "#000000"} // Default fill
              stroke={pathData.stroke || "none"} // Default stroke
            />
          ))}
      </Svg>
    </View>
  );
};
// --- End CORRECTED RenderSvgIcon ---

// --- PDF Component Structure (No changes needed below this line) ---

const PdfMiniBox = ({ miniBox }) => {
  if (!miniBox || !miniBox.position) return null;

  let positionStyle;
  switch (miniBox.position) {
    case "right":
      positionStyle = styles.miniBoxRight;
      break;
    case "top":
      positionStyle = styles.miniBoxTop;
      break;
    case "bottom":
      positionStyle = styles.miniBoxBottom;
      break;
    default:
      positionStyle = {};
  }

  return (
    <View style={[styles.miniBoxBase, positionStyle]}>
      {miniBox.action && (
        <RenderSvgIcon action={miniBox.action} style={styles.miniBoxIconView} />
      )}
    </View>
  );
};

const PdfPlacedAction = ({ item }) => {
  if (!item || !item.action) return null;

  return (
    <View style={styles.placedActionView}>
      {/* Main Action Icon */}
      <RenderSvgIcon action={item.action} style={styles.actionIconView} />

      {/* Label */}
      {item.label && <Text style={styles.actionLabel}>{item.label}</Text>}

      {/* Mini Boxes */}
      {item.miniBoxes &&
        item.miniBoxes.map((mb) => <PdfMiniBox key={mb.id} miniBox={mb} />)}
    </View>
  );
};

const PdfGridSquare = ({ item }) => {
  const isEmpty = !item || !item.action;
  return (
    <View style={[styles.gridSquare, isEmpty && styles.emptySquare]}>
      {!isEmpty && <PdfPlacedAction item={item} />}
    </View>
  );
};

// --- Main Document Component ---
const RecipePdfDocument = ({ recipeInfo, gridItems }) => {
  // Convert gridItems object to an array for predictable order in PDF
  const sortedGridKeys = Object.keys(gridItems).sort((a, b) => {
    const [, rA, cA] = a.split("-");
    const [, rB, cB] = b.split("-");
    if (rA !== rB) return parseInt(rA) - parseInt(rB);
    return parseInt(cA) - parseInt(cB);
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Recipe Info Section */}
        <View style={styles.section}>
          <Text style={styles.title}>
            {recipeInfo.name || "Untitled Recipe"}
          </Text>
          <Text style={styles.infoText}>
            Author: {recipeInfo.author || "N/A"}
          </Text>
          <Text style={styles.infoText}>
            Cook Time: {recipeInfo.cookTime || "N/A"}
          </Text>
          <Text style={styles.infoText}>Date: {recipeInfo.date || "N/A"}</Text>
        </View>

        {/* Recipe Grid Section */}
        <View style={styles.gridContainer}>
          {sortedGridKeys.map((key) => (
            <PdfGridSquare key={key} item={gridItems[key]} />
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default RecipePdfDocument;
