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

    // Draw month rows - only horizontal lines and vertical day separators
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
    // Pencil-like textured stroke with grainy appearance
    push();

    // Calculate line angle and length
    let dx = endPos.x - startPos.x;
    let dy = endPos.y - startPos.y;
    let distance = dist(startPos.x, startPos.y, endPos.x, endPos.y);

    // Reduced stroke thickness for pencil feel
    const strokeThickness = 8;
    const grainDensity = distance * 0.5; // Number of grain particles

    // Draw many small dots/points along the line for grainy texture
    for (let i = 0; i < grainDensity; i++) {
        let t = i / grainDensity;

        // Add some randomness to position along the line
        let randomT = t + random(-0.01, 0.01);
        randomT = constrain(randomT, 0, 1);

        let x = lerp(startPos.x, endPos.x, randomT);
        let y = lerp(startPos.y, endPos.y, randomT);

        // Add perpendicular offset for thickness variation
        let perpOffset = random(-strokeThickness / 2, strokeThickness / 2);
        let angle = atan2(dy, dx) + HALF_PI;
        x += cos(angle) * perpOffset;
        y += sin(angle) * perpOffset;

        // Vary opacity and size for texture
        let alpha = random(80, 180);
        let dotSize = random(0.5, 2);

        noStroke();
        fill(color[0], color[1], color[2], alpha);
        circle(x, y, dotSize);
    }

    pop();

    /* Previous implementation:
    push();
    for (let i = 0; i < 15; i++) {
        let offsetX = random(-3, 3);
        let offsetY = random(-2, 2);
        let alpha = map(i, 0, 15, 200, 100);
        stroke(color[0], color[1], color[2], alpha);
        strokeWeight(random(15, 25));
        line(
            startPos.x + offsetX,
            startPos.y + offsetY,
            endPos.x + offsetX,
            endPos.y + offsetY
        );
    }
    pop();
    */
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
