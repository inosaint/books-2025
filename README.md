# Reading Visualization 2025

An artistic visualization of reading behavior throughout 2025, using p5.js to create textured pen strokes representing books read over time.

## Overview

This project displays a calendar grid showing all 365 days of 2025, with each book visualized as a hand-drawn pen stroke spanning from its start date to completion date.

## Features

- **Calendar Grid**: 12 rows (months) × 31 columns (days)
- **Hand-Drawn Strokes**: Organic, textured strokes with pressure simulation and irregularity
- **Interactive Tooltips**: Hover over books to see title, author, and cover image
- **Book Overlap Handling**: Books read simultaneously stack vertically with 5px spacing
- **Multi-Month Books**: Books spanning multiple months split into monthly segments
- **Responsive Design**: Scales for desktop and mobile with touch support
- **Clean Design**: Minimalist aesthetic with Inter font and pale yellow background

## Project Structure

```
/books-2025
├── index.html          # Main HTML page with p5.js setup
├── sketch.js           # p5.js visualization logic
├── data/
│   └── books_2025.csv  # Book reading data from Goodreads
├── images/             # Book cover images
├── assets/             # p5.brush library (currently unused)
└── README.md           # This file
```

## Data Format

The `data/books_2025.csv` file contains Goodreads export data with these columns:

```csv
title,author,avg_rating,rating,date_read,date_added
"Book Title","Author Name",4.2,5,"Dec 15 2025","Jan 01 2025"
```

- **title**: Book title
- **author**: Author name
- **avg_rating**: Average Goodreads rating
- **rating**: Personal rating
- **date_read**: Date finished reading (end date)
- **date_added**: Date started reading (start date)

## Running Locally

Since this project loads data via CSV, you'll need to run a local server:

### Option 1: Python HTTP Server
```bash
python3 -m http.server 8000
```

### Option 2: Node.js http-server
```bash
npx http-server
```

### Option 3: VS Code Live Server
Install the "Live Server" extension and click "Go Live"

Then open `http://localhost:8000` (or appropriate port) in your browser.

## Technologies

- **p5.js** (v1.9.0): Creative coding library
- **Inter Font**: Typography
- **Vanilla JavaScript**: No build tools required

## Drawing Style

The visualization uses custom pen-like strokes with:
- **Pressure Simulation**: Opacity varies along the stroke (bell curve)
- **Irregularity**: Perlin noise adds subtle wobble for hand-drawn feel
- **Texture**: Multiple overlapping layers create depth
- **Consistent Width**: 5.5-7px for pen-like appearance

## Customization

### Colors
Edit the `colors` array in `sketch.js` (line 316):
```javascript
const colors = [
    [255, 100, 100], // Bright pink/red
    [100, 220, 100], // Bright green
    [100, 100, 255], // Bright blue
    // Add more [R, G, B] values
];
```

### Layout
Adjust spacing in `sketch.js`:
```javascript
let CELL_WIDTH = 30;   // Width of each day cell
let CELL_HEIGHT = 60;  // Height of each month row
```

### Stroke Style
Modify stroke properties in `drawBookStroke()` function:
```javascript
const weight = random(5.5, 7);      // Line thickness
const wobbleAmount = 0.8;           // Irregularity amount
const minOpacity = 30;              // Minimum opacity
const maxOpacity = 70;              // Maximum opacity
```

## Features Implemented

- ✅ Hover states showing book details with cover images
- ✅ Touch interactions for mobile devices
- ✅ Responsive design for mobile and desktop
- ✅ Multi-month book handling
- ✅ Book overlap detection and stacking
- ✅ Same-day books rendering (short horizontal lines)

## License

This project is open source and available for personal use.

## Credits

Designed in Figma, data from Goodreads, developed in p5.js with Claude.
