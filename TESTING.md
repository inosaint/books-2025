# Local Testing Guide

## Quick Start

Since this project loads data from a CSV file, you'll need to run a local web server.

### Option 1: Python (Recommended)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open: **http://localhost:8000**

### Option 2: Node.js

```bash
npx http-server
```

Then open the URL shown in the terminal (usually http://localhost:8080)

### Option 3: VS Code

1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## What You Should See

- A 2025 calendar grid (12 months × 31 days)
- Colored brush strokes representing books
- Each stroke spans from start date (date_added) to completion date (date_read)

## Troubleshooting

**Nothing loads?**
- Check browser console (F12) for errors
- Make sure you're using a local server (not opening the HTML file directly)

**No books showing?**
- Verify `data/books_2025.csv` exists
- Check that dates are in 2025
- Look for console errors about CSV loading

**Brush strokes look wrong?**
- The p5.brush library may take a moment to initialize
- Try refreshing the page

## Data Format

The visualization reads from `data/books_2025.csv` with these columns:
- `title`: Book title
- `author`: Author name
- `date_added`: When you started reading (start date)
- `date_read`: When you finished (end date)
- `avg_rating`: Average rating
- `rating`: Your rating
- `shelves`: Reading status

Supported date formats:
- "Dec 05 2025" (month day year)
- "Mar 2025" (month year - defaults to 1st)
- "2025-01-15" (YYYY-MM-DD)
- "12/05/2025" (MM/DD/YYYY)
