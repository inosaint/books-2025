# Mobile Display Options

## Current Implementation
The visualization currently scales down proportionally to fit mobile screens, which may make text and details very small.

## Options for Mobile Experience

### Option 1: Horizontal Scroll (Recommended for your design)
**What it does:** Keep the calendar at a readable size but allow horizontal scrolling on mobile
**Pros:**
- Maintains grid readability
- Preserves the clean design aesthetic
- Users can pan across months naturally
- Text remains legible

**Cons:**
- Requires horizontal scrolling
- Can't see the full year at once on small screens

**Best for:** Preserving the artistic quality and detailed texture of the brush strokes

---

### Option 2: Vertical Stack
**What it does:** Stack months vertically on mobile, each month becomes its own full-width section
**Pros:**
- Native vertical scroll (familiar mobile pattern)
- Each month clearly readable
- No horizontal scrolling

**Cons:**
- Loses the year-at-a-glance overview
- More dramatic design change
- Longer scroll distance

**Best for:** Mobile-first reading experience

---

### Option 3: Adaptive Scale with Tap-to-Zoom
**What it does:** Show scaled-down version by default, tap to zoom into specific months
**Pros:**
- Overview on load
- Detail on demand
- Familiar mobile interaction

**Cons:**
- Requires interaction
- More complex to implement
- Small overview might be hard to read

**Best for:** Exploration and discovery

---

### Option 4: Hide Grid Lines on Mobile
**What it does:** On small screens, remove grid and only show brush strokes with simplified labels
**Pros:**
- Focuses on the art/visualization
- Cleaner on small screens
- Less visual clutter

**Cons:**
- Loses the calendar structure
- Harder to pinpoint exact dates
- Significant design departure

**Best for:** Visual impact over precision

---

### Option 5: Mobile-Specific Simplified View
**What it does:** Show a different, simplified visualization for mobile (e.g., just month bars or timeline)
**Pros:**
- Optimized for each screen size
- Best readability
- Can include different interactions

**Cons:**
- Two separate designs to maintain
- Loses consistency across devices
- More development work

**Best for:** Maximum usability on all devices

---

## My Recommendation

For your clean, artistic design, I'd suggest **Option 1 (Horizontal Scroll)** because:
- It preserves your textured brush strokes at a quality that's visible
- The grid structure stays intact
- It's a simple, elegant solution
- Users can swipe through the year naturally

Alternative: **Option 3 (Tap-to-Zoom)** if you want users to be able to see the overview first, then explore details.

## Current Behavior
Right now, the canvas scales down to fit the viewport, which on a phone would make everything quite small. Want me to implement one of these options?
