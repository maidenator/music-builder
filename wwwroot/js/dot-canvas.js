// Infinite polka dot canvas: pans the SVG <pattern> while dragging.
// The pattern already repeats forever, so panning only needs to move it
// by one tile (modulo) to look like an endless surface.

export function initPan(svg) {
    const pattern = svg.querySelector("pattern");
    if (!pattern) {
        return { destroy() { } };
    }

    const tile = parseFloat(pattern.getAttribute("width")) || 24;

    // Offset inside a single tile, so the numbers never grow unbounded.
    let offsetX = 0;
    let offsetY = 0;

    let dragging = false;
    let pointerId = null;
    let lastX = 0;
    let lastY = 0;

    const wrap = (value) => ((value % tile) + tile) % tile;

    function render() {
        offsetX = wrap(offsetX);
        offsetY = wrap(offsetY);
        pattern.setAttribute("patternTransform", `translate(${offsetX} ${offsetY})`);
    }

    function onPointerDown(event) {
        // Only pan with the primary mouse button (or any touch/pen contact).
        if (event.pointerType === "mouse" && event.button !== 0) {
            return;
        }

        dragging = true;
        pointerId = event.pointerId;
        lastX = event.clientX;
        lastY = event.clientY;

        svg.setPointerCapture(pointerId);
        svg.classList.add("is-dragging");
        event.preventDefault();
    }

    function onPointerMove(event) {
        if (!dragging || event.pointerId !== pointerId) {
            return;
        }

        offsetX += event.clientX - lastX;
        offsetY += event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        render();
    }

    function onPointerUp(event) {
        if (!dragging || event.pointerId !== pointerId) {
            return;
        }

        dragging = false;
        if (svg.hasPointerCapture(event.pointerId)) {
            svg.releasePointerCapture(event.pointerId);
        }
        pointerId = null;
        svg.classList.remove("is-dragging");
    }

    // Stop the browser's native image drag / text selection on the canvas.
    function onDragStart(event) {
        event.preventDefault();
    }

    svg.addEventListener("pointerdown", onPointerDown);
    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerup", onPointerUp);
    svg.addEventListener("pointercancel", onPointerUp);
    svg.addEventListener("dragstart", onDragStart);

    render();

    return {
        destroy() {
            svg.removeEventListener("pointerdown", onPointerDown);
            svg.removeEventListener("pointermove", onPointerMove);
            svg.removeEventListener("pointerup", onPointerUp);
            svg.removeEventListener("pointercancel", onPointerUp);
            svg.removeEventListener("dragstart", onDragStart);
            svg.classList.remove("is-dragging");
        }
    };
}
