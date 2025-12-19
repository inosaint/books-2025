// DEBUG: Enable/disable visualizations for easier debugging
const VIZ_CONFIG = {
    watercolor: false,
    ballpen: false,
    brush: true
};

// Calendar configuration
const YEAR = 2025;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// Layout configuration (for one visualization)
let MARGIN_LEFT = 80;
let MARGIN_TOP = 80;
let MARGIN_RIGHT = 40;
let MARGIN_BOTTOM = 40;
let CELL_WIDTH = 30;
let CELL_HEIGHT = 60;
let VIZ_GAP = 100; // Gap between visualizations

// Colors
const BG_COLOR = '#FAFFCE';
const GRID_COLOR = '#000000';
const TEXT_COLOR = '#000000';

// Data
let booksData = [];
let bookPositions = [];
let hoveredBook = null;
let bookImages = {};

function preload() {
    // Image mapping for book covers
    const imageMap = {
        'Elmer': 'images/elmer.jpg',
        'Fantastic Four: Grand Design #1 (of 2)': 'images/FantasticFour.jpg',
        'Abandon the Old in Tokyo': 'images/Abandon_the_Old_in_Tokyo.jpg',
        'Mooncop': 'images/mooncop.jpeg',
        'Sea of Tranquility': 'images/Sea_of_Tranquility.png',
        'Blood of the Virgin': 'images/bloodvirgin.jpg',
        'Kinfolk Islands': 'images/islands.jpg',
        'Notes from an Island': 'images/notesfromisland.jpg',
        'The Strange': 'images/thestrange.jpeg',
        'Zodiac: A Graphic Memoir': 'images/zodiac.jpeg',
        'The Iron Man': 'images/irongiant.jpg',
        'Exit Strategy (The Murderbot Diaries #4)':'images/exitstrategy.jpg',
        'The Wild Girls':'images/wildgirls.jpg',
        'Neptune episode 1':'images/neptune1.jpg',
        'Neptune episode 2':'images/neptune2.jpg',
        'The Loneliness of the Long-Distance Cartoonist':'images/loneliness.jpg'
    };

    // Load book cover images
    for (let [bookTitle, imagePath] of Object.entries(imageMap)) {
        loadImage(imagePath, (img) => {
            bookImages[bookTitle] = img;
            console.log('Loaded image for:', bookTitle);
        }, (err) => {
            console.log('Failed to load image for:', bookTitle, err);
        });
    }

    // Load CSV data
    loadTable('data/books_2025.csv', 'csv', 'header', (table) => {
        console.log('CSV loaded, rows:', table.getRowCount());
        console.log('Columns:', table.columns);

        for (let i = 0; i < table.getRowCount(); i++) {
            let row = table.getRow(i);

            // Safely get values, with fallbacks
            // CSV columns: title, author, avg_rating, rating, date_read, date_added
            let title = row.get('title') || row.getString(0) || '';
            let author = row.get('author') || row.getString(1) || '';
            let avgRating = row.get('avg_rating') || row.getString(2) || '';
            let rating = row.get('rating') || row.getString(3) || '';
            let dateRead = row.get('date_read') || row.getString(4) || '';
            let dateAdded = row.get('date_added') || row.getString(5) || '';

            booksData.push({
                title: title,
                author: author,
                startDate: dateAdded,    // When started reading (date_added)
                endDate: dateRead,       // When finished reading (date_read)
                rating: rating,
                avgRating: avgRating
            });
        }
        console.log('Books data:', booksData);
    });
}

function setup() {
    // Calculate ideal canvas size for ONE visualization
    const vizWidth = MARGIN_LEFT + (31 * CELL_WIDTH) + MARGIN_RIGHT;
    const vizHeight = MARGIN_TOP + (12 * CELL_HEIGHT) + MARGIN_BOTTOM;

    // Count enabled visualizations
    const enabledCount = Object.values(VIZ_CONFIG).filter(v => v).length;
    const gapCount = Math.max(0, enabledCount - 1);

    // Total canvas height based on enabled visualizations
    const totalHeight = vizHeight * enabledCount + VIZ_GAP * gapCount;

    // On desktop: allow scaling down to fit
    // On mobile: maintain readable size, allow scroll
    const isMobile = windowWidth < 768;

    let canvasWidth, canvasHeight, scale;

    if (isMobile) {
        // Mobile: keep minimum readable size, enable scroll
        const maxHeight = windowHeight * 2.5; // Allow for scrolling
        scale = min(maxHeight / totalHeight, 1);
        canvasWidth = vizWidth * scale;
        canvasHeight = totalHeight * scale;
    } else {
        // Desktop: scale to fit viewport height
        const maxWidth = windowWidth - 40;
        const maxHeight = windowHeight - 200;
        scale = min(maxWidth / vizWidth, maxHeight / totalHeight, 1);
        canvasWidth = vizWidth * scale;
        canvasHeight = totalHeight * scale;
    }

    let canvas = createCanvas(canvasWidth, canvasHeight);

    // Attach canvas to main element
    const mainElement = document.querySelector('main');
    if (mainElement) {
        // Remove loading text
        const loading = document.getElementById('loading');
        if (loading) loading.remove();

        canvas.parent(mainElement);
    }

    // Scale dimensions if needed
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

    // Calculate height of one visualization
    const vizHeight = MARGIN_TOP + (12 * CELL_HEIGHT) + MARGIN_BOTTOM;

    // Draw visualizations based on config
    push();

    let currentYOffset = 0;
    let yOffsets = [];

    // 1. Watercolor style
    if (VIZ_CONFIG.watercolor) {
        drawVisualizationSection(currentYOffset, 'Watercolor Style', 'watercolor');
        yOffsets.push(currentYOffset);
        currentYOffset += vizHeight + VIZ_GAP;
        translate(0, vizHeight + VIZ_GAP);
    }

    // 2. Ballpen style
    if (VIZ_CONFIG.ballpen) {
        drawVisualizationSection(currentYOffset, 'Ballpen Style', 'ballpen');
        yOffsets.push(currentYOffset);
        currentYOffset += vizHeight + VIZ_GAP;
        translate(0, vizHeight + VIZ_GAP);
    }

    // 3. P5.Brush style
    if (VIZ_CONFIG.brush) {
        drawVisualizationSection(currentYOffset, 'P5.Brush Style', 'brush');
        yOffsets.push(currentYOffset);
    }

    pop();

    // Store yOffsets globally for hover detection
    window.vizYOffsets = yOffsets;

    // Draw tooltip if hovering over a book
    if (hoveredBook) {
        drawTooltip(hoveredBook);
    }

    noLoop(); // Only draw once, redraw on mouse move
}

function drawVisualizationSection(yOffset, title, style) {
    push();

    // Draw title
    fill(TEXT_COLOR);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);
    text(title, 20, 20);

    // Draw calendar grid
    drawCalendarGrid();

    // Draw books with specified style
    drawBooks(style, yOffset);

    pop();
}

function mouseMoved() {
    checkHover(mouseX, mouseY);
    return false;
}

function touchMoved() {
    checkHover(mouseX, mouseY);
    return false;
}

function checkHover(x, y) {
    let previousHover = hoveredBook;
    hoveredBook = null;

    // Use stored yOffsets from draw()
    let yOffsets = window.vizYOffsets || [];

    for (let yOffset of yOffsets) {
        for (let bookPos of bookPositions) {
            let startPos = getDatePosition(bookPos.start.month, bookPos.start.day);
            let endPos = getDatePosition(bookPos.end.month, bookPos.end.day);

            // Apply vertical offset for book stacking and section offset
            startPos.y += bookPos.offset + yOffset;
            endPos.y += bookPos.offset + yOffset;

            // Check if mouse/touch is near the line
            let tolerance = 20;
            let d = distToSegment(x, y, startPos, endPos);

            if (d < tolerance) {
                hoveredBook = bookPos;
                break;
            }
        }
        if (hoveredBook) break;
    }

    // Only redraw if hover state changed
    if (hoveredBook !== previousHover) {
        redraw();
    }
}

function distToSegment(px, py, v, w) {
    let l2 = dist(v.x, v.y, w.x, w.y) ** 2;
    if (l2 === 0) return dist(px, py, v.x, v.y);

    let t = ((px - v.x) * (w.x - v.x) + (py - v.y) * (w.y - v.y)) / l2;
    t = constrain(t, 0, 1);

    return dist(px, py, v.x + t * (w.x - v.x), v.y + t * (w.y - v.y));
}

function drawTooltip(bookPos) {
    push();

    // Tooltip styling
    const padding = 12;
    const imageSize = 60;
    const maxTextWidth = 180;

    textFont('Inter');
    textSize(12);

    let titleText = bookPos.book.title;
    let authorText = bookPos.book.author;
    let bookImage = bookImages[titleText];

    // Calculate dimensions
    let hasImage = bookImage !== undefined;
    let textAreaWidth = maxTextWidth;
    let tooltipWidth = hasImage ? imageSize + textAreaWidth + padding * 3 : textAreaWidth + padding * 2;
    let tooltipHeight = hasImage ? max(imageSize + padding * 2, 80) : 60;

    // Position tooltip near mouse
    let tooltipX = mouseX + 15;
    let tooltipY = mouseY - 30;

    // Keep tooltip within canvas bounds
    if (tooltipX + tooltipWidth > width) tooltipX = mouseX - tooltipWidth - 15;
    if (tooltipY < 0) tooltipY = mouseY + 15;
    if (tooltipY + tooltipHeight > height) tooltipY = height - tooltipHeight - 10;

    // Draw tooltip background
    fill(255, 255, 255, 240);
    stroke(100);
    strokeWeight(1);
    rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);

    // Draw book cover if available
    if (hasImage) {
        let imgAspect = bookImage.width / bookImage.height;
        let imgWidth = imageSize;
        let imgHeight = imageSize;

        // Maintain aspect ratio
        if (imgAspect > 1) {
            imgHeight = imageSize / imgAspect;
        } else {
            imgWidth = imageSize * imgAspect;
        }

        image(bookImage, tooltipX + padding, tooltipY + padding, imgWidth, imgHeight);
    }

    // Draw text with proper spacing
    let textX = hasImage ? tooltipX + imageSize + padding * 2 : tooltipX + padding;
    let textY = tooltipY + padding;

    noStroke();
    fill(0);
    textAlign(LEFT, TOP);
    textSize(12);
    textLeading(14);
    text(titleText, textX, textY, textAreaWidth);

    textSize(10);
    textLeading(12);
    fill(100);
    text(authorText, textX, textY + 30, textAreaWidth);

    pop();
}

function scaleCanvas(s) {
    MARGIN_LEFT *= s;
    MARGIN_TOP *= s;
    MARGIN_RIGHT *= s;
    MARGIN_BOTTOM *= s;
    CELL_WIDTH *= s;
    CELL_HEIGHT *= s;
    VIZ_GAP *= s;
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

    // Draw month rows
    for (let month = 0; month < 12; month++) {
        let y = MARGIN_TOP + month * CELL_HEIGHT;

        // Month label
        textSize(14);
        textAlign(RIGHT, CENTER);
        text(MONTHS[month], MARGIN_LEFT - 15, y + CELL_HEIGHT / 2);

        // Horizontal line (skip the first one)
        if (month > 0) {
            line(MARGIN_LEFT, y, MARGIN_LEFT + 31 * CELL_WIDTH, y);
        }

        // Vertical lines for days
        for (let day = 1; day < 31; day++) {
            let x = MARGIN_LEFT + day * CELL_WIDTH;
            line(x, y, x, y + CELL_HEIGHT);
        }
    }
}

function drawBooks(style, yOffset) {
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

    // Parse all books and detect overlaps (only do this once)
    if (bookPositions.length === 0) {
        booksData.forEach((book, index) => {
            if (!book.startDate || !book.endDate) return;

            // Parse dates (allow end date in Dec 2024)
            let start = parseDateString(book.startDate);
            let end = parseDateString(book.endDate, true);

            if (!end) return;

            // If end date is in Dec 2024, treat it as Dec 2025 for visualization
            if (end.year === YEAR - 1) {
                end.year = YEAR;
            }

            // If start date is before 2025 or missing, use Jan 1, 2025
            if (!start || start.year < YEAR) {
                start = { year: YEAR, month: 0, day: 1 };
            }

            // Check if book spans multiple months
            if (start.month !== end.month) {
                // Create segments for each month
                let currentMonth = start.month;
                let segmentStart = start;

                while (currentMonth <= end.month) {
                    let segmentEnd;

                    if (currentMonth === end.month) {
                        // Last segment - use actual end date
                        segmentEnd = end;
                    } else {
                        // Use last day of current month
                        segmentEnd = {
                            year: YEAR,
                            month: currentMonth,
                            day: DAYS_IN_MONTH[currentMonth]
                        };
                    }

                    bookPositions.push({
                        book,
                        start: segmentStart,
                        end: segmentEnd,
                        color: colors[index % colors.length],
                        index,
                        isSegment: true,
                        segmentMonth: currentMonth
                    });

                    // Next segment starts on first day of next month
                    currentMonth++;
                    if (currentMonth <= end.month) {
                        segmentStart = { year: YEAR, month: currentMonth, day: 1 };
                    }
                }
            } else {
                // Single month book
                bookPositions.push({
                    book,
                    start,
                    end,
                    color: colors[index % colors.length],
                    index,
                    isSegment: false
                });
            }
        });

        // Calculate duration for each book
        bookPositions.forEach(bookPos => {
            let startDay = bookPos.start.month * 31 + bookPos.start.day;
            let endDay = bookPos.end.month * 31 + bookPos.end.day;
            bookPos.duration = endDay - startDay;
        });

        // Sort by duration (larger first) so smaller books are drawn on top
        bookPositions.sort((a, b) => {
            return b.duration - a.duration;
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
    }

    // Draw all books with their offsets using specified style
    bookPositions.forEach(bookPos => {
        let startPos = getDatePosition(bookPos.start.month, bookPos.start.day);
        let endPos = getDatePosition(bookPos.end.month, bookPos.end.day);

        // Apply vertical offset
        startPos.y += bookPos.offset;
        endPos.y += bookPos.offset;

        // Choose drawing style
        if (style === 'watercolor') {
            drawBookStrokeWatercolor(startPos, endPos, bookPos.color);
        } else if (style === 'ballpen') {
            drawBookStrokeBallpen(startPos, endPos, bookPos.color);
        } else if (style === 'brush') {
            drawBookStrokeBrush(startPos, endPos, bookPos.color);
        }
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

function drawBookStrokeWatercolor(startPos, endPos, color) {
    // Clean watercolor stroke (current style)
    push();

    let dx = endPos.x - startPos.x;
    let dy = endPos.y - startPos.y;

    // Multiple overlapping strokes for watercolor effect
    for (let layer = 0; layer < 12; layer++) {
        stroke(color[0], color[1], color[2], random(15, 30));
        strokeWeight(random(14, 22));

        let offsetX = random(-1.5, 1.5);
        let offsetY = random(-1.5, 1.5);

        line(
            startPos.x + offsetX,
            startPos.y + offsetY,
            endPos.x + offsetX,
            endPos.y + offsetY
        );
    }

    pop();
}

function drawBookStrokeBallpen(startPos, endPos, color) {
    // Ballpen style: more consistent, darker, slightly textured
    push();

    // Main stroke - darker and more opaque
    stroke(color[0] * 0.7, color[1] * 0.7, color[2] * 0.7, 120);
    strokeWeight(18);
    line(startPos.x, startPos.y, endPos.x, endPos.y);

    // Add subtle texture with thinner overlays
    for (let i = 0; i < 3; i++) {
        stroke(color[0] * 0.6, color[1] * 0.6, color[2] * 0.6, random(40, 60));
        strokeWeight(random(16, 20));

        let offsetX = random(-0.5, 0.5);
        let offsetY = random(-0.5, 0.5);

        line(
            startPos.x + offsetX,
            startPos.y + offsetY,
            endPos.x + offsetX,
            endPos.y + offsetY
        );
    }

    pop();
}

function drawBookStrokeBrush(startPos, endPos, color) {
    // Pencil-style brush - continuous line with texture
    push();

    const brushWeight = 18; // Base stroke weight
    const numLayers = 8; // Number of overlapping strokes for texture

    // Draw multiple slightly offset strokes for pencil texture
    for (let layer = 0; layer < numLayers; layer++) {
        // Vary opacity and weight for each layer
        let layerOpacity = random(40, 80);
        let layerWeight = brushWeight + random(-2, 2);

        // Small random offset for texture (much smaller than watercolor)
        let offsetX = random(-0.8, 0.8);
        let offsetY = random(-0.8, 0.8);

        stroke(color[0], color[1], color[2], layerOpacity);
        strokeWeight(layerWeight);

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

function parseDateString(dateStr, allowPreviousYear = false) {
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

    // Allow dates from Dec 2024 if allowPreviousYear is true
    if (allowPreviousYear && year === YEAR - 1 && month === 11) {
        return { year, month, day };
    }

    if (year !== YEAR) return null;

    return { year, month, day };
}
