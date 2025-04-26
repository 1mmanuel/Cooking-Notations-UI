const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

// --- Configuration ---
// Adjust this path if your SVG folder is located elsewhere relative to the project root
// Assuming the script is run from the project root directory
const svgFolderPath = path.join(__dirname, "SVG");
// Define the output file path (within the src directory)
const outputFilePath = path.join(__dirname, "iconPdfData.js");
// --- End Configuration ---

const parser = new xml2js.Parser({ explicitArray: false }); // explicitArray: false simplifies object access

// Helper function to recursively find all paths within SVG elements (like <g>)
function findPathsRecursive(element) {
  let paths = [];
  if (!element || typeof element !== "object") {
    return paths;
  }

  // Check if the current element itself is a path
  if (element.path) {
    const pathElements = Array.isArray(element.path)
      ? element.path
      : [element.path];
    pathElements.forEach((p) => {
      if (p && p.$ && p.$.d) {
        paths.push({
          d: p.$.d,
          fill: p.$.fill, // Include fill if present
          stroke: p.$.stroke, // Include stroke if present
          // Add other attributes like strokeWidth if needed: strokeWidth: p.$['stroke-width']
        });
      }
    });
  }

  // Recursively check children (common elements like <g>)
  for (const key in element) {
    if (key !== "$" && key !== "_" && typeof element[key] === "object") {
      const childElements = Array.isArray(element[key])
        ? element[key]
        : [element[key]];
      childElements.forEach((child) => {
        paths = paths.concat(findPathsRecursive(child));
      });
    }
  }

  // Special check for top-level path elements if the root <svg> tag itself contains paths directly
  if (element.$ && element.$.d && !paths.some((p) => p.d === element.$.d)) {
    paths.push({
      d: element.$.d,
      fill: element.$.fill,
      stroke: element.$.stroke,
    });
  }

  return paths;
}

// Helper function to recursively find all drawable elements within SVG
function findDrawableElementsRecursive(element) {
  let elements = [];
  if (!element || typeof element !== "object") {
    return elements;
  }

  const processElement = (el, type) => {
    if (el && el.$) {
      const attributes = el.$;
      const baseData = {
        type: type,
        fill: attributes.fill,
        stroke: attributes.stroke,
        transform: attributes.transform, // Keep track of transform if present
        // Add other common attributes if needed: strokeWidth: attributes['stroke-width'], opacity: attributes.opacity
      };

      switch (type) {
        case "path":
          if (attributes.d) elements.push({ ...baseData, d: attributes.d });
          break;
        case "circle":
          if (attributes.cx && attributes.cy && attributes.r) {
            elements.push({
              ...baseData,
              cx: attributes.cx,
              cy: attributes.cy,
              r: attributes.r,
            });
          }
          break;
        case "rect":
          if (
            attributes.x &&
            attributes.y &&
            attributes.width &&
            attributes.height
          ) {
            elements.push({
              ...baseData,
              x: attributes.x,
              y: attributes.y,
              width: attributes.width,
              height: attributes.height,
            });
          }
          break;
        case "ellipse":
          if (
            attributes.cx &&
            attributes.cy &&
            attributes.rx &&
            attributes.ry
          ) {
            elements.push({
              ...baseData,
              cx: attributes.cx,
              cy: attributes.cy,
              rx: attributes.rx,
              ry: attributes.ry,
            });
          }
          break;
        case "line":
          if (
            attributes.x1 &&
            attributes.y1 &&
            attributes.x2 &&
            attributes.y2
          ) {
            elements.push({
              ...baseData,
              x1: attributes.x1,
              y1: attributes.y1,
              x2: attributes.x2,
              y2: attributes.y2,
            });
          }
          break;
        case "polygon":
        case "polyline": // Polygons and Polylines use 'points'
          if (attributes.points) {
            elements.push({ ...baseData, points: attributes.points });
          }
          break;
        // Add other types if needed
      }
    }
  };

  // Check for different element types
  const elementTypes = [
    "path",
    "circle",
    "rect",
    "ellipse",
    "line",
    "polygon",
    "polyline",
  ];
  elementTypes.forEach((type) => {
    if (element[type]) {
      const items = Array.isArray(element[type])
        ? element[type]
        : [element[type]];
      items.forEach((item) => processElement(item, type));
    }
  });

  // Recursively check children (common elements like <g>)
  for (const key in element) {
    // Skip attributes ($) and text content (_)
    // Only recurse into objects/arrays that are not known element types already processed
    if (
      key !== "$" &&
      key !== "_" &&
      typeof element[key] === "object" &&
      !elementTypes.includes(key)
    ) {
      const childElements = Array.isArray(element[key])
        ? element[key]
        : [element[key]];
      childElements.forEach((child) => {
        // Basic transform propagation (might need more robust handling)
        const childTransform = child.$?.transform;
        const parentTransform = element.$?.transform;
        let combinedTransform = childTransform || parentTransform;
        if (childTransform && parentTransform) {
          combinedTransform = `${parentTransform} ${childTransform}`; // Simple concatenation
        }

        const childrenFound = findDrawableElementsRecursive(child);
        // Apply parent transform if child doesn't have its own
        childrenFound.forEach((cf) => {
          if (!cf.transform && combinedTransform) {
            cf.transform = combinedTransform;
          }
        });

        elements = elements.concat(childrenFound);
      });
    }
  }

  return elements;
}

async function extractSvgData() {
  const allIconData = {};
  console.log(`Reading SVG files from: ${svgFolderPath}\n`);

  try {
    const files = fs.readdirSync(svgFolderPath);
    const svgFiles = files.filter(
      (file) => path.extname(file).toLowerCase() === ".svg"
    );

    if (svgFiles.length === 0) {
      console.log("No SVG files found in the specified directory.");
      return;
    }

    for (const file of svgFiles) {
      const filePath = path.join(svgFolderPath, file);
      // Use filename without extension as ID, convert to camelCase maybe?
      // Or keep as is if your action IDs match the filenames directly.
      const iconId = path.basename(file, ".svg").replace(/[()]/g, ""); // Remove parentheses

      try {
        const svgContent = fs.readFileSync(filePath, "utf-8");
        const parsedResult = await parser.parseStringPromise(svgContent);

        if (!parsedResult || !parsedResult.svg) {
          console.warn(`WARN: Could not parse SVG structure for ${file}`);
          continue;
        }

        const svgElement = parsedResult.svg;
        const viewBox = svgElement.$?.viewBox;

        if (!viewBox) {
          console.warn(`WARN: Missing viewBox attribute in ${file}`);
        }

        // --- Use the new recursive function ---
        const drawableElements = findDrawableElementsRecursive(svgElement);

        if (drawableElements.length === 0) {
          console.warn(
            `WARN: No drawable elements (<path>, <circle>, <rect>, etc.) found in ${file}`
          );
        }

        // Clean up elements data (remove undefined fill/stroke, keep necessary attrs)
        const cleanedElements = drawableElements.map((el) => {
          const cleaned = { type: el.type };
          // Common attributes
          if (el.fill) cleaned.fill = el.fill;
          if (el.stroke) cleaned.stroke = el.stroke;
          if (el.transform) cleaned.transform = el.transform; // Keep transform

          // Type-specific attributes
          switch (el.type) {
            case "path":
              cleaned.d = el.d;
              break;
            case "circle":
              cleaned.cx = el.cx;
              cleaned.cy = el.cy;
              cleaned.r = el.r;
              break;
            case "rect":
              cleaned.x = el.x;
              cleaned.y = el.y;
              cleaned.width = el.width;
              cleaned.height = el.height;
              break;
            case "ellipse":
              cleaned.cx = el.cx;
              cleaned.cy = el.cy;
              cleaned.rx = el.rx;
              cleaned.ry = el.ry;
              break;
            case "line":
              cleaned.x1 = el.x1;
              cleaned.y1 = el.y1;
              cleaned.x2 = el.x2;
              cleaned.y2 = el.y2;
              break;
            case "polygon":
            case "polyline":
              cleaned.points = el.points;
              break;
          }
          return cleaned;
        });

        allIconData[iconId] = {
          viewBox: viewBox || "0 0 24 24", // Provide a default viewBox if missing
          // --- Store all elements, not just paths ---
          elements: cleanedElements,
        };
        console.log(
          ` -> Extracted data for: ${file} (${cleanedElements.length} elements)`
        );
      } catch (parseError) {
        console.error(
          `ERROR: Failed to read or parse ${file}:`,
          parseError.message
        );
      }
    } // End of for loop

    // --- Generate JavaScript file content ---
    // Add a comment indicating it's auto-generated
    const jsFileContent = `// This file is auto-generated by extract-svg-data.js
// Do not edit manually!

export default ${JSON.stringify(allIconData, null, 2)};
`; // Use JSON.stringify for easy object literal creation, then wrap in export default

    // --- Write the content to the output file ---
    try {
      fs.writeFileSync(outputFilePath, jsFileContent, "utf-8");
      console.log(
        `\n--- SVG Data successfully written to: ${outputFilePath} ---`
      );
    } catch (writeError) {
      console.error(
        `\nERROR: Failed to write SVG data to ${outputFilePath}:`,
        writeError.message
      );
    }
  } catch (dirError) {
    console.error(
      `ERROR: Could not read directory ${svgFolderPath}:`,
      dirError.message
    );
    console.error(
      "Please ensure the 'svgFolderPath' variable in the script is correct and the script is run from the project root."
    );
  }
}

extractSvgData();
