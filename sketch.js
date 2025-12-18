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
const BG_COLOR = '#e8dcc4';
const GRID_COLOR = '#000000';
const TEXT_COLOR = '#000000';

// Data
let booksData = [];

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
            let dateRead = row.get('date_read') || row.getString(4) || '';
            let dateAdded = row.get('date_added') || row.getString(5) || '';

            booksData.push({
                title: title,
                author: author,
                startDate: dateAdded,  // When started reading
                endDate: dateRead,     // When finished reading
                rating: rating,
                avgRating: avgRating
            });
        }
        console.log('Books data:', booksData);
    });
}

function setup() {
    // Calculate canvas size
    const canvasWidth = MARGIN_LEFT + (31 * CELL_WIDTH) + MARGIN_RIGHT;
    const canvasHeight = MARGIN_TOP + (12 * CELL_HEIGHT) + MARGIN_BOTTOM;

    createCanvas(canvasWidth, canvasHeight);

    textFont('Inter');

    // Set random seed for consistent texture
    randomSeed(42);

    console.log('Setup complete');
}

function draw() {
    background(BG_COLOR);

    // Draw calendar grid
    drawCalendarGrid();

    // Draw book visualizations
    drawBooks();

    noLoop(); // Only draw once
    console.log('Visualization drawn');
}

function drawCalendarGrid() {
    stroke(GRID_COLOR);
    strokeWeight(1);
    fill(TEXT_COLOR);

    // Draw year label
    textSize(16);
    textAlign(LEFT, TOP);
    text('2025', MARGIN_LEFT - 60, 20);

    // Draw day numbers at the top
    textSize(12);
    textAlign(CENTER, TOP);
    for (let day = 1; day <= 31; day++) {
        let x = MARGIN_LEFT + (day - 1) * CELL_WIDTH + CELL_WIDTH / 2;
        text(day, x, MARGIN_TOP - 30);
    }

    // Draw month rows
    for (let month = 0; month < 12; month++) {
        let y = MARGIN_TOP + month * CELL_HEIGHT;

        // Month label
        textSize(14);
        textAlign(RIGHT, CENTER);
        text(MONTHS[month], MARGIN_LEFT - 15, y + CELL_HEIGHT / 2);

        // Horizontal line (top of month row)
        line(MARGIN_LEFT, y, MARGIN_LEFT + 31 * CELL_WIDTH, y);

        // Vertical lines for days
        for (let day = 0; day <= 31; day++) {
            let x = MARGIN_LEFT + day * CELL_WIDTH;
            line(x, y, x, y + CELL_HEIGHT);
        }
    }

    // Bottom border
    line(MARGIN_LEFT, MARGIN_TOP + 12 * CELL_HEIGHT,
         MARGIN_LEFT + 31 * CELL_WIDTH, MARGIN_TOP + 12 * CELL_HEIGHT);
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

    booksData.forEach((book, index) => {
        if (!book.startDate || !book.endDate) return;

        // Parse dates
        let start = parseDateString(book.startDate);
        let end = parseDateString(book.endDate);

        if (!start || !end) return;

        // Get positions
        let startPos = getDatePosition(start.month, start.day);
        let endPos = getDatePosition(end.month, end.day);

        // Draw brush stroke
        let color = colors[index % colors.length];
        drawBookStroke(startPos, endPos, color);
    });
}

function drawBookStroke(startPos, endPos, color) {
    // Create textured marker-like stroke effect using native p5.js
    push();

    // Draw multiple overlapping lines for texture
    for (let i = 0; i < 15; i++) {
        let offsetX = random(-3, 3);
        let offsetY = random(-2, 2);

        // Vary opacity for textured look
        let alpha = map(i, 0, 15, 200, 100);
        stroke(color[0], color[1], color[2], alpha);
        strokeWeight(random(15, 25));

        // Draw slightly offset line for texture
        line(
            startPos.x + offsetX,
            startPos.y + offsetY,
            endPos.x + offsetX,
            endPos.y + offsetY
        );
    }

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
