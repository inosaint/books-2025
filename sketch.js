// Calendar configuration
const YEAR = 2025;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Layout configuration
let MARGIN_LEFT = 80;
let MARGIN_TOP = 80;
let MARGIN_RIGHT = 40;
let MARGIN_BOTTOM = 40;
let CELL_WIDTH = 30;
let CELL_HEIGHT = 60;

// Colors
const BG_COLOR = '#FAFFCE';
const GRID_COLOR = '#000000';
const TEXT_COLOR = '#000000';

// Data
let booksData = [];
let brushReady = false;

function preload() {
    // Load CSV data
    loadTable('data/books_2025.csv', 'csv', 'header', (table) => {
        console.log('CSV loaded, rows:', table.getRowCount());
        console.log('Columns:', table.columns);

        for (let i = 0; i < table.getRowCount(); i++) {
            let row = table.getRow(i);

            // Safely get values, with fallbacks
            let title = row.get('title') || row.getString(0) || '';
            let author = row.get('author') || row.getString(1) || '';
            let avgRating = row.get('avg_rating') || row.getString(2) || '';
            let rating = row.get('rating') || row.getString(3) || '';
            let dateStarted = row.get('date_started') || row.getString(4) || '';
            let dateRead = row.get('date_read') || row.getString(5) || '';

            booksData.push({
                title: title,
                author: author,
                startDate: dateStarted,  // When started reading
                endDate: dateRead,       // When finished reading
                rating: rating,
                avgRating: avgRating
            });
        }
        console.log('Books data:', booksData);
    });
}

function setup() {
    // Calculate canvas size to fit viewport (leaving room for footer)
    const maxWidth = windowWidth - 40;
    const maxHeight = windowHeight - 140; // Leave room for footer

    // Calculate ideal size based on grid
    const idealWidth = MARGIN_LEFT + (31 * CELL_WIDTH) + MARGIN_RIGHT;
    const idealHeight = MARGIN_TOP + (12 * CELL_HEIGHT) + MARGIN_BOTTOM;

    // Scale to fit if needed
    const scale = min(maxWidth / idealWidth, maxHeight / idealHeight, 1);

    const canvasWidth = idealWidth * scale;
    const canvasHeight = idealHeight * scale;

    let canvas = createCanvas(canvasWidth, canvasHeight);

    // Attach canvas to main element
    const mainElement = document.querySelector('main');
    if (mainElement) {
        canvas.parent(mainElement);
    }

    // Scale everything if needed
    if (scale < 1) {
        scaleCanvas(scale);
    }

    textFont('Inter');

    // Initialize p5.brush library
    // Try loading without instance() call
    brush.load(() => {
        console.log('Brush library loaded');
        brushReady = true;
        redraw();
    });

    console.log('Setup complete');
}

function draw() {
    // Wait for brush library to load
    if (!brushReady) {
        background(BG_COLOR);
        fill(TEXT_COLOR);
        textSize(16);
        textAlign(CENTER, CENTER);
        text('Loading brushes...', width / 2, height / 2);
        return;
    }

    background(BG_COLOR);

    // Draw calendar grid
    drawCalendarGrid();

    // Draw book visualizations
    drawBooks();

    noLoop(); // Only draw once
    console.log('Visualization drawn');
}

function scaleCanvas(s) {
    MARGIN_LEFT *= s;
    MARGIN_TOP *= s;
    MARGIN_RIGHT *= s;
    MARGIN_BOTTOM *= s;
    CELL_WIDTH *= s;
    CELL_HEIGHT *= s;
}

function drawCalendarGrid() {
    stroke(GRID_COLOR);
    strokeWeight(0.5);
    fill(TEXT_COLOR);

    // Draw year label (aligned with months)
    textSize(16);
    textAlign(RIGHT, CENTER);
    text('2025', MARGIN_LEFT - 15, MARGIN_TOP / 2);

    // Draw day numbers at the top
    textSize(12);
    textAlign(CENTER, TOP);
    for (let day = 1; day <= 31; day++) {
        let x = MARGIN_LEFT + (day - 1) * CELL_WIDTH + CELL_WIDTH / 2;
        text(day, x, MARGIN_TOP - 30);
    }

    // Draw month rows - only horizontal lines between months (no top, no outer borders)
    for (let month = 0; month < 12; month++) {
        let y = MARGIN_TOP + month * CELL_HEIGHT;

        // Month label
        textSize(14);
        textAlign(RIGHT, CENTER);
        text(MONTHS[month], MARGIN_LEFT - 15, y + CELL_HEIGHT / 2);

        // Horizontal line (skip the first one to remove top border)
        if (month > 0) {
            line(MARGIN_LEFT, y, MARGIN_LEFT + 31 * CELL_WIDTH, y);
        }

        // Vertical lines for days (skip first and last to keep grid open)
        for (let day = 1; day < 31; day++) {
            let x = MARGIN_LEFT + day * CELL_WIDTH;
            line(x, y, x, y + CELL_HEIGHT);
        }
    }
}

function drawBooks() {
    if (booksData.length === 0) return;

    // Define color palette for books
    const colors = [
        [255, 150, 150], // Pink/coral
        [150, 200, 150], // Green
        [150, 150, 220], // Purple/blue
        [100, 150, 180], // Teal
        [180, 120, 180], // Purple
        [200, 180, 100], // Yellow
        [220, 140, 120], // Orange
    ];

    // Parse all books and detect overlaps
    let bookPositions = [];

    booksData.forEach((book, index) => {
        if (!book.startDate || !book.endDate) return;

        // Parse dates
        let start = parseDateString(book.startDate);
        let end = parseDateString(book.endDate);

        if (!end) return;

        // If start date is before 2025 or missing, use Jan 1, 2025
        if (!start || start.year < YEAR) {
            start = { year: YEAR, month: 0, day: 1 };
        }

        bookPositions.push({
            book,
            start,
            end,
            color: colors[index % colors.length],
            index
        });
    });

    // Sort by start date
    bookPositions.sort((a, b) => {
        if (a.start.month !== b.start.month) return a.start.month - b.start.month;
        return a.start.day - b.start.day;
    });

    // Assign vertical offsets to avoid overlaps
    bookPositions.forEach((bookPos, i) => {
        let offset = 0;

        // Check for overlaps with previous books
        for (let j = 0; j < i; j++) {
            let other = bookPositions[j];

            // Check if books overlap in time
            if (datesOverlap(bookPos.start, bookPos.end, other.start, other.end)) {
                // Stack this book below the other
                offset = Math.max(offset, (other.offset || 0) + 6);
            }
        }

        bookPos.offset = offset;
    });

    // Draw all books with their offsets
    bookPositions.forEach(bookPos => {
        let startPos = getDatePosition(bookPos.start.month, bookPos.start.day);
        let endPos = getDatePosition(bookPos.end.month, bookPos.end.day);

        // Apply vertical offset
        startPos.y += bookPos.offset;
        endPos.y += bookPos.offset;

        drawBookStroke(startPos, endPos, bookPos.color);
    });
}

// Check if two date ranges overlap
function datesOverlap(start1, end1, start2, end2) {
    let date1Start = start1.month * 31 + start1.day;
    let date1End = end1.month * 31 + end1.day;
    let date2Start = start2.month * 31 + start2.day;
    let date2End = end2.month * 31 + end2.day;

    return date1Start <= date2End && date2Start <= date1End;
}

function drawBookStroke(startPos, endPos, color) {
    // Use p5.brush library for authentic textured strokes
    push();

    // Set brush to marker type with dense grain
    brush.pick('marker');

    // Configure brush properties for thick, grainy texture
    brush.set('color', color, 200);
    brush.set('weight', 20);
    brush.set('bleed', 0.3);
    brush.set('field', 'seabed');  // Adds organic variation

    // Draw the stroke
    brush.line(startPos.x, startPos.y, endPos.x, endPos.y);

    pop();
}

function getDatePosition(month, day) {
    // Calculate center position of a date cell
    let x = MARGIN_LEFT + (day - 1) * CELL_WIDTH + CELL_WIDTH / 2;
    let y = MARGIN_TOP + month * CELL_HEIGHT + CELL_HEIGHT / 2;

    return { x, y };
}

function parseDateString(dateStr) {
    // Expected formats: "Dec 05 2025", "Mar 2025", "YYYY-MM-DD", or "MM/DD/YYYY"
    if (!dateStr) return null;

    let year, month, day;

    // Handle "Dec 05 2025" or "Mar 2025" format
    if (dateStr.match(/[A-Za-z]/)) {
        const parts = dateStr.trim().split(/\s+/);
        const monthStr = parts[0];

        // Parse month
        const monthIndex = MONTHS.findIndex(m => m === monthStr);
        if (monthIndex === -1) return null;
        month = monthIndex;

        // Parse day (if provided, otherwise use 1st of month)
        if (parts.length === 3) {
            day = parseInt(parts[1]);
            year = parseInt(parts[2]);
        } else if (parts.length === 2) {
            day = 1; // Default to 1st of the month
            year = parseInt(parts[1]);
        } else {
            return null;
        }
    }
    // Handle YYYY-MM-DD format
    else if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1; // 0-indexed
        day = parseInt(parts[2]);
    }
    // Handle MM/DD/YYYY format
    else if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        month = parseInt(parts[0]) - 1; // 0-indexed
        day = parseInt(parts[1]);
        year = parseInt(parts[2]);
    } else {
        return null;
    }

    if (year !== YEAR) return null;

    return { year, month, day };
}
