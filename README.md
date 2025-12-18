# Reading Visualization 2025

An artistic visualization of reading behavior throughout 2025, using p5.js and the p5.brush library to create textured brush strokes representing books read over time.

## Overview

This project displays a calendar grid showing all 365 days of 2025, with each book visualized as a textured brush stroke spanning from its start date to completion date.

## Features

- **Calendar Grid**: 12 rows (months) × 31 columns (days)
- **Brush Strokes**: Each book rendered with organic, textured strokes using p5.brush
- **Clean Design**: Minimalist aesthetic with Inter font and beige background
- **Data-Driven**: Reads from CSV file containing book information

## Project Structure

```
/books-2025
├── index.html          # Main HTML page with p5.js setup
├── sketch.js           # p5.js visualization logic
├── data/
│   └── books.csv       # Book reading data
├── assets/             # Design references and images
└── README.md           # This file
```

## Data Format

The `data/books.csv` file should contain the following columns:

```csv
title,author,start_date,end_date,pages
"Book Title","Author Name",2025-01-01,2025-01-15,250
```

- **title**: Book title (string)
- **author**: Author name (string)
- **start_date**: Date started reading (YYYY-MM-DD format)
- **end_date**: Date finished reading (YYYY-MM-DD format)
- **pages**: Number of pages (integer)

## Running Locally

Since this project loads data via CSV, you'll need to run a local server:

### Option 1: Python HTTP Server
```bash
python -m http.server 8000
# or for Python 2
python -m SimpleHTTPServer 8000
```

### Option 2: Node.js http-server
```bash
npx http-server
```

### Option 3: VS Code Live Server
Install the "Live Server" extension and click "Go Live"

Then open `http://localhost:8000` (or appropriate port) in your browser.

## Technologies

- **p5.js** (v1.7.0): Creative coding library
- **p5.brush** (v1.8.3): Brush stroke effects library
- **Inter Font**: Typography
- **Vanilla JavaScript**: No build tools required

## Customization

### Colors
Edit the `colors` array in `sketch.js` to change book colors:
```javascript
const colors = [
    [255, 150, 150], // Pink/coral
    [150, 200, 150], // Green
    // Add more [R, G, B] values
];
```

### Layout
Adjust spacing in `sketch.js`:
```javascript
let CELL_WIDTH = 30;   // Width of each day cell
let CELL_HEIGHT = 60;  // Height of each month row
```

### Brush Style
Modify brush properties in the `drawBookStroke()` function:
```javascript
brush.set('marker', color, 0.8);  // Brush type and opacity
brush.strokeWeight(20);            // Stroke thickness
brush.bleed(0.3);                  // Texture bleeding effect
```

Available brush types: 'marker', 'pen', 'spray', 'watercolor', 'charcoal', and more.

## Future Enhancements

- [ ] Hover states showing book details
- [ ] Click interactions for book information
- [ ] Filter by month or author
- [ ] Export visualization as image
- [ ] Reading statistics and insights
- [ ] Responsive design for mobile devices

## License

This project is open source and available for personal use.
