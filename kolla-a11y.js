// == Kolla A11y - Accessibility Checker Tool ==
// Version: (Add a version number, e.g., 0.2)
// Author: (Your Name/Handle)
// Repository: (Link to your GitHub repo)
// License: (Specify a license, e.g., MIT)
//
// This script creates an accessibility checking toolbar on the current page.
// To use as a bookmarklet, this entire file needs to be minified and
// wrapped in `javascript:(()=>{ /* minified code */ })();`
// --------------------------------------------------

(function() {
    // --- Configuration & IDs ---
    const KOLLA_A11Y_PREFIX = 'kolla-a11y';
    const KOLLA_A11Y_TOOLBAR_ID = `${KOLLA_A11Y_PREFIX}-toolbar`;
    const KOLLA_A11Y_STYLE_ID = `${KOLLA_A11Y_PREFIX}-styles`;
    const KOLLA_A11Y_OUTPUT_ID = `${KOLLA_A11Y_PREFIX}-output`;
    const KOLLA_A11Y_HEADING_LIST_TITLE_ID = `${KOLLA_A11Y_PREFIX}-headings-list-title`;
    const KOLLA_A11Y_HEADING_LIST_CONTAINER_ID = `${KOLLA_A11Y_PREFIX}-headings-list-container`;
    const KOLLA_A11Y_IMAGE_LIST_CONTAINER_ID = `${KOLLA_A11Y_PREFIX}-image-list-container`;
    const KOLLA_A11Y_PANEL_CLOSE_BTN_ID = `${KOLLA_A11Y_OUTPUT_ID}-close-btn`;
    const KOLLA_A11Y_PANEL_TITLE_ID = `${KOLLA_A11Y_PREFIX}-panel-title`;

    // --- State Variables ---
    let currentActiveTool = null; // Tracks the visually active tool (headings, images, etc.)
    let isCssToggledOff = false; // Tracks the state of the CSS toggle specifically
    let headingCheckData = []; // Holds data gathered by heading check
    let headingCheckFilter = 'all'; // Current filter for heading list

    // Highlight class lists (for easy cleanup)
    const IMAGE_HIGHLIGHT_CLASSES = [
        `${KOLLA_A11Y_PREFIX}-highlight-image-alt-present`,
        `${KOLLA_A11Y_PREFIX}-highlight-image-alt-empty`,
        `${KOLLA_A11Y_PREFIX}-highlight-image-alt-missing`,
        `${KOLLA_A11Y_PREFIX}-highlight-svg-named`,
        `${KOLLA_A11Y_PREFIX}-highlight-svg-decorative`,
        `${KOLLA_A11Y_PREFIX}-highlight-svg-missing`,
        `${KOLLA_A11Y_PREFIX}-highlight-svg-unclear`,
        `${KOLLA_A11Y_PREFIX}-highlight-svg-hidden`
    ];

    // --- Placeholder Functions (for tools not yet implemented) ---
    const cleanupLandmarks = () => console.log("Cleanup: Landmarks");
    const cleanupLinks = () => console.log("Cleanup: Links");
    const cleanupFocusable = () => console.log("Cleanup: Focusable");
    const runLandmarksCheck = () => console.log("Run Landmarks Check...");
    const runLinksCheck = () => console.log("Run Links Check...");
    const runFocusableCheck = () => console.log("Run Focusable Check...");


    // --- Core Cleanup Function ---
    function cleanupAll() {
        console.log("Kolla A11y: Cleaning up all elements...");
        const toolbar = document.getElementById(KOLLA_A11Y_TOOLBAR_ID);
        const styles = document.getElementById(KOLLA_A11Y_STYLE_ID);
        const outputPanel = document.getElementById(KOLLA_A11Y_OUTPUT_ID);

        if (toolbar) toolbar.remove();
        if (styles) styles.remove();
        if (outputPanel) outputPanel.remove(); // Remove any leftover panel

        // Ensure CSS is re-enabled if it was toggled off
        if (isCssToggledOff) {
            console.log("Kolla A11y: Cleanup ensuring CSS is ON");
            toggleAllStylesheets(true); // true = enable
            isCssToggledOff = false;
        }

        // Run cleanup for any potentially active tool visuals (just in case)
        deactivateTool(null, true); // Force cleanup

        // Reset state
        currentActiveTool = null;
        headingCheckData = []; // Clear stored data
    }

    // --- Tool-Specific Cleanup Functions ---

    function cleanupHeadings() {
        console.log("Kolla A11y: Removing Heading Highlights & Panel");
        document.querySelectorAll(`.${KOLLA_A11Y_PREFIX}-highlight-heading`).forEach(el => {
            el.classList.remove(`${KOLLA_A11Y_PREFIX}-highlight-heading`);
            el.style.removeProperty(`--${KOLLA_A11Y_PREFIX}-heading-level`);
            // Remove general highlight class only if no other specific highlight remains
            if (!el.classList.contains(`${KOLLA_A11Y_PREFIX}-highlight-image`) && !el.classList.contains(`${KOLLA_A11Y_PREFIX}-highlight-svg`)) {
                 el.classList.remove(`${KOLLA_A11Y_PREFIX}-highlight`);
            }
        });
        const outputPanel = document.getElementById(KOLLA_A11Y_OUTPUT_ID);
        if (outputPanel) {
            outputPanel.remove();
        }
        // Clear stored data when cleaning up specifically
        headingCheckData = [];
    }

    function cleanupImages() {
        console.log("Kolla A11y: Removing Image Info & Highlights");
        document.querySelectorAll(`.${KOLLA_A11Y_PREFIX}-highlight-image, .${KOLLA_A11Y_PREFIX}-highlight-svg`).forEach(el => {
            el.classList.remove(`${KOLLA_A11Y_PREFIX}-highlight-image`);
            el.classList.remove(`${KOLLA_A11Y_PREFIX}-highlight-svg`);
            el.style.removeProperty(`--${KOLLA_A11Y_PREFIX}-img-status`);
            // Remove all possible status classes
            IMAGE_HIGHLIGHT_CLASSES.forEach(cls => el.classList.remove(cls));
             // Remove general highlight class only if no other specific highlight remains
            if (!el.classList.contains(`${KOLLA_A11Y_PREFIX}-highlight-heading`)) {
                 el.classList.remove(`${KOLLA_A11Y_PREFIX}-highlight`);
            }
        });
        const outputPanel = document.getElementById(KOLLA_A11Y_OUTPUT_ID);
        if (outputPanel) {
            outputPanel.remove();
        }
    }


    // --- Tool Activation / Deactivation Logic ---
    function deactivateTool(toolToPreserve = null, forceCleanup = false) {
        const previouslyActiveTool = currentActiveTool;

        // Skip if no tool was active and not forcing cleanup
        if (!previouslyActiveTool && !forceCleanup) {
            return;
        }

        console.log(`Kolla A11y: Deactivating visual tool: ${previouslyActiveTool}, Preserving: ${toolToPreserve}, Force: ${forceCleanup}`);

        // Run cleanup for the previously active tool if it's different from the new one or if forcing
        if (previouslyActiveTool && (forceCleanup || previouslyActiveTool !== toolToPreserve)) {
            console.log(`Kolla A11y: Running cleanup actions for ${previouslyActiveTool}`);
            switch (previouslyActiveTool) {
                case "headings":    cleanupHeadings(); break;
                case "images":      cleanupImages(); break;
                case "landmarks":   cleanupLandmarks(); break;
                case "links":       cleanupLinks(); break;
                case "focusable":   cleanupFocusable(); break;
                // Note: togglecss state is handled separately
            }
            // Reset button state for the deactivated tool
            if (previouslyActiveTool !== "togglecss") { // Toggle CSS button state managed elsewhere
                const previousButton = document.querySelector(`#${KOLLA_A11Y_TOOLBAR_ID} button[data-tool="${previouslyActiveTool}"]`);
                if (previousButton) {
                    previousButton.setAttribute("aria-pressed", "false");
                }
            }
        }

        // Handle state reset during forced cleanup
        if (forceCleanup) {
            console.log("Kolla A11y: Force cleanup invoked.");
            // Ensure CSS is enabled during full cleanup
            if (isCssToggledOff) {
                console.log("Kolla A11y: Force cleanup re-enabling CSS.");
                toggleAllStylesheets(true);
                isCssToggledOff = false;
                // Also reset the toggle CSS button visually
                const toggleCssButton = document.querySelector(`#${KOLLA_A11Y_TOOLBAR_ID} button[data-tool="togglecss"]`);
                 if (toggleCssButton) {
                     toggleCssButton.setAttribute("aria-pressed", "false");
                 }
            }
            currentActiveTool = null; // Reset active tool state fully
        } else {
            // Set the new active tool state (null if preserving togglecss)
            currentActiveTool = (toolToPreserve !== "togglecss") ? toolToPreserve : null;
        }
        console.log(`Kolla A11y: Deactivation finished. Current active tool state: ${currentActiveTool}`);
    }

    function activateTool(toolName, buttonElement) {
        console.log(`Kolla A11y: Received activation request for: ${toolName}`);
        const isCurrentlyPressed = buttonElement.getAttribute("aria-pressed") === "true";

        // --- Handle Toggle CSS Separately ---
        if (toolName === "togglecss") {
            let turnStylesOff = !isCurrentlyPressed; // If not pressed, we want to turn styles OFF
            console.log(`Kolla A11y: Toggling CSS. New state OFF = ${turnStylesOff}`);
            toggleAllStylesheets(!turnStylesOff); // Pass 'true' to *enable*, 'false' to *disable*
            isCssToggledOff = turnStylesOff; // Update state variable
            buttonElement.setAttribute("aria-pressed", String(turnStylesOff));

            // If turning CSS OFF, deactivate any other active visual tool
            if (turnStylesOff && currentActiveTool) {
                console.log(`Kolla A11y: CSS turned OFF. Deactivating current visual tool: ${currentActiveTool}`);
                deactivateTool(null); // Deactivate visuals, keep toggle pressed
            }
            return; // Handled toggle CSS
        }

        // --- Handle Other Visual Tools ---

        // If clicking the *same* button that's already active, deactivate it
        if (isCurrentlyPressed && toolName === currentActiveTool) {
            console.log(`Kolla A11y: Deactivating ${toolName} by clicking again.`);
            deactivateTool(null); // Deactivate everything visually
            return;
        }

        // If switching tools, deactivate the previous one first
        console.log(`Kolla A11y: Activating new tool ${toolName}. Current active: ${currentActiveTool}`);
        if (currentActiveTool && currentActiveTool !== toolName) {
             console.log(`Kolla A11y: Deactivating previous tool ${currentActiveTool} before activating ${toolName}.`);
            deactivateTool(toolName); // Deactivate old, preserve new tool name for state update
        }

        // Activate the new tool
        console.log(`Kolla A11y: Setting ${toolName} button to pressed and running its function.`);
        buttonElement.setAttribute("aria-pressed", "true");
        currentActiveTool = toolName; // Update state *after* deactivation logic

        // Run the corresponding function
        switch (toolName) {
            case "headings":    runHeadingsCheck(); break;
            case "images":      runImagesCheck(); break;
            case "landmarks":   runLandmarksCheck(); break;
            case "links":       runLinksCheck(); break;
            case "focusable":   runFocusableCheck(); break;
        }
        console.log(`Kolla A11y: Activation finished for ${toolName}.`);
    }

    // --- Utility Functions ---

    function toggleAllStylesheets(enable) {
        console.log(`Kolla A11y: Toggling stylesheets ${enable ? "ON" : "OFF"}`);
        document.querySelectorAll('link[rel="stylesheet"], style').forEach(sheet => {
            // Don't disable our own styles!
            if (sheet.id === KOLLA_A11Y_STYLE_ID) return;

            if (enable) {
                // Re-enable: Check if it had a media attribute we need to restore
                const originalMedia = sheet.getAttribute('data-original-media');
                if (originalMedia !== null) {
                    sheet.media = originalMedia;
                    sheet.removeAttribute('data-original-media');
                }
                // Ensure 'disabled' property/attribute is false/removed
                sheet.disabled = false;
                if (sheet.media === 'none') sheet.media = 'all'; // Handle cases where media was set to 'none'
                sheet.removeAttribute('disabled'); // Ensure disabled attribute is removed
            } else {
                // Disable: Store original media type if present, then disable
                 const currentMedia = sheet.getAttribute('media');
                 // Avoid storing 'print' or 'none' as original, store 'all' if none exists
                 if (currentMedia && currentMedia.toLowerCase() !== 'print' && currentMedia !== 'none') {
                    sheet.setAttribute('data-original-media', currentMedia);
                 } else if (!currentMedia && !sheet.hasAttribute('data-original-media')) {
                    sheet.setAttribute('data-original-media', 'all');
                 }
                 // Using the disabled property is generally preferred
                 sheet.disabled = true;
            }
        });
        // Note: isCssToggledOff state is managed within activateTool/cleanupAll
    }

    function getElementVisibility(element) {
        // Basic checks first (fastest)
        try {
            const styles = window.getComputedStyle(element);
            if (styles.display === 'none' || styles.visibility === 'hidden' || element.closest('[aria-hidden="true"]') || element.hidden) {
                return 'hidden';
            }

            // Check bounding box for zero dimensions (common visually hidden technique)
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
                // Additional checks for common sr-only techniques
                if (styles.overflow !== 'hidden' && styles.position === 'absolute') return 'visually-hidden'; // Off-screen position
                if (styles.clip === 'rect(0px, 0px, 0px, 0px)' || styles.clip === 'rect(1px, 1px, 1px, 1px)') return 'visually-hidden'; // Clipping
                // Generic zero-size catch-all
                return 'visually-hidden';
            }
        } catch (e) {
            // Likely error if element is not in the DOM or similar edge cases
            console.warn("Kolla A11y: Error checking visibility", element, e);
            return 'hidden'; // Assume hidden if we can't check
        }
        return 'visible';
    }

     // --- Headings Tool Functions ---

    function renderHeadingsList(headingsData, filter) {
        let listHtml = `<ul aria-labelledby="${KOLLA_A11Y_HEADING_LIST_TITLE_ID}">`;
        let visibleCount = 0;
        let h1Count = 0;

        headingsData.forEach(heading => {
            const visibility = heading.visibility;
            let shouldDisplay = false;

            // Determine if heading matches the current filter
            switch (filter) {
                case 'visible': shouldDisplay = (visibility === 'visible'); break;
                case 'hidden':  shouldDisplay = (visibility === 'hidden' || visibility === 'visually-hidden'); break;
                default:        shouldDisplay = true; // 'all'
            }

            if (shouldDisplay) {
                const errorClass = heading.issues.length > 0 ? ` ${KOLLA_A11Y_PREFIX}-heading-error` : '';
                let listItem = `<li style="--level: ${heading.level};" class="${errorClass.trim()}">`;
                listItem += `<span class="kolla-a11y-heading-level">H${heading.level}:</span> `;
                listItem += `<a href="#" class="kolla-a11y-heading-text" data-target-id="${heading.targetId}">${heading.text || "[Empty]"}</a>`;
                if (heading.issues.length > 0) {
                    listItem += ` <span class="kolla-a11y-issue">(${heading.issues.join(", ")})</span>`;
                }
                // Add visibility status if not 'visible'
                if (visibility === 'visually-hidden' || visibility === 'hidden') {
                    listItem += ` <span class="kolla-a11y-hidden-info">[${visibility.replace('-', ' ')}]</span>`;
                }
                listItem += `</li>`;
                listHtml += listItem;
                visibleCount++;
            }
            // Count H1s regardless of filter for the overall warning
            if (heading.level === 1) {
                 h1Count++;
            }
        });

        listHtml += `</ul>`;

        // Add messages based on filtering
        if (visibleCount === 0 && filter !== 'all') {
            listHtml += `<p>No headings match the filter: "${filter}".</p>`;
        }
        if (h1Count === 0 && filter !== 'hidden') { // Don't warn about no H1 if only showing hidden ones
             listHtml += `<p class="${KOLLA_A11Y_PREFIX}-issue" style="margin-top: 10px;">Warning: No H1 heading found${visibleCount > 0 ? " among matching headings" : ""}.</p>`;
        }

        return listHtml;
    }

    function runHeadingsCheck() {
        console.log("Kolla A11y: Running Headings Check...");
        cleanupHeadings(); // Clean previous run first
        headingCheckData = []; // Reset data

        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        let previousLevel = 0;
        let h1Count = 0; // Overall H1 count

        headings.forEach((heading, index) => {
            // Skip headings within the Kolla A11y UI itself
            if (heading.closest(`#${KOLLA_A11Y_TOOLBAR_ID}`) || heading.closest(`#${KOLLA_A11Y_OUTPUT_ID}`)) {
                return;
            }

            const level = parseInt(heading.tagName.substring(1), 10);
            // Add highlight and level info to element
            heading.style.setProperty(`--${KOLLA_A11Y_PREFIX}-heading-level`, `"H${level}"`);
            const text = (heading.textContent || "").trim();
            const targetId = `${KOLLA_A11Y_PREFIX}-heading-${index}`;
            heading.setAttribute('data-kolla-a11y-id', targetId); // For linking from panel
            heading.classList.add(`${KOLLA_A11Y_PREFIX}-highlight`);
            heading.classList.add(`${KOLLA_A11Y_PREFIX}-highlight-heading`);

            // --- Check for Issues ---
            let issues = [];
            if (level === 1) {
                h1Count++;
                if (h1Count > 1) {
                    issues.push("Multiple H1");
                }
            } else if (index > 0 && level > previousLevel + 1) {
                 // Only check skip if previousLevel is valid (not the very first heading)
                 if(previousLevel > 0) {
                     issues.push(`Skipped level (previous was H${previousLevel}`);
                 }
            }
            if (text === "") {
                issues.push("Empty Heading");
            }

            // --- Get Visibility & Store Data ---
            const visibility = getElementVisibility(heading);
            headingCheckData.push({
                level: level,
                text: text,
                targetId: targetId,
                issues: issues,
                visibility: visibility
            });

            // Update previousLevel only if the current heading is not completely hidden
            // (otherwise, skips over hidden elements are expected)
            if(visibility !== 'hidden') {
                previousLevel = level;
            }
        });

        // --- Create Panel HTML ---
        let panelHtml = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h3 id="${KOLLA_A11Y_PANEL_TITLE_ID}" style="margin: 0;">Headings Outline</h3>
                            <button id="${KOLLA_A11Y_PANEL_CLOSE_BTN_ID}" aria-label="Close Headings Outline Panel" class="${KOLLA_A11Y_PREFIX}-panel-close-btn">&times;</button>
                         </div>`;
        panelHtml += `<fieldset class="${KOLLA_A11Y_PREFIX}-filter-group">
                        <legend class="${KOLLA_A11Y_PREFIX}-visually-hidden">Filter headings by visibility</legend>
                        <label><input type="radio" name="${KOLLA_A11Y_PREFIX}-heading-filter" value="all" ${headingCheckFilter === 'all' ? 'checked' : ''}> All</label>
                        <label><input type="radio" name="${KOLLA_A11Y_PREFIX}-heading-filter" value="visible" ${headingCheckFilter === 'visible' ? 'checked' : ''}> Visible Only</label>
                        <label><input type="radio" name="${KOLLA_A11Y_PREFIX}-heading-filter" value="hidden" ${headingCheckFilter === 'hidden' ? 'checked' : ''}> Hidden Only</label>
                      </fieldset>`;
        // Accessible title for the list itself
        panelHtml += `<h4 id="${KOLLA_A11Y_HEADING_LIST_TITLE_ID}" class="${KOLLA_A11Y_PREFIX}-visually-hidden">List of page headings with structure analysis</h4>`;
        // Container for the dynamic list content
        panelHtml += `<div id="${KOLLA_A11Y_HEADING_LIST_CONTAINER_ID}"></div>`;

        // --- Create and Inject Panel ---
        const panel = document.createElement('div');
        panel.id = KOLLA_A11Y_OUTPUT_ID;
        panel.innerHTML = panelHtml;
        document.body.appendChild(panel);

        // --- Render Initial List ---
        const listContainer = document.getElementById(KOLLA_A11Y_HEADING_LIST_CONTAINER_ID);
        listContainer.innerHTML = renderHeadingsList(headingCheckData, headingCheckFilter);

        // --- Add Panel Event Listener ---
        panel.addEventListener('click', (event) => {
            // Handle clicks on heading links
            const headingLink = event.target.closest('.kolla-a11y-heading-text');
            if (headingLink && headingLink.dataset.targetId) {
                event.preventDefault();
                const targetElement = document.querySelector(`[data-kolla-a11y-id="${headingLink.dataset.targetId}"]`);
                if (targetElement) {
                    targetElement.setAttribute('tabindex', '-1'); // Make focusable
                    targetElement.focus({ preventScroll: true }); // Focus without jarring scroll
                    targetElement.removeAttribute('tabindex'); // Clean up
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Smooth scroll
                }
                return; // Stop processing click
            }

            // Handle clicks on the panel close button
            const closeButton = event.target.closest(`.${KOLLA_A11Y_PREFIX}-panel-close-btn`);
            if (closeButton) {
                event.preventDefault();
                cleanupHeadings(); // Clean up this specific tool
                // Also visually deactivate the main toolbar button
                 const headingToolButton = document.querySelector(`#${KOLLA_A11Y_TOOLBAR_ID} button[data-tool="headings"]`);
                 if(headingToolButton) headingToolButton.setAttribute('aria-pressed', 'false');
                 currentActiveTool = null; // Update global state
                return;
            }

            // Handle clicks on filter radio buttons
            if (event.target.type === 'radio' && event.target.name === `${KOLLA_A11Y_PREFIX}-heading-filter`) {
                headingCheckFilter = event.target.value;
                console.log("Kolla A11y: Filter changed to", headingCheckFilter);
                listContainer.innerHTML = renderHeadingsList(headingCheckData, headingCheckFilter); // Re-render list
            }
        });
    }


    // --- Images Tool Functions ---

    function getSvgAccessibleName(svgElement) {
        // Check explicit hiding first
        if (svgElement.getAttribute('aria-hidden') === 'true') {
            return { name: "[Hidden by aria-hidden]", type: 'hidden', statusClass: 'hidden', statusText: 'HIDDEN' };
        }
        // Check explicit decorative role
        if (svgElement.getAttribute('role') === 'presentation') {
            return { name: "[Marked as decorative]", type: 'decorative', statusClass: 'decorative', statusText: 'DECO' };
        }

        // Check for accessible name via aria-label or aria-labelledby
        const label = svgElement.getAttribute('aria-label');
        if (label) {
            return { name: label, type: 'aria-label', statusClass: 'named', statusText: 'NAME' };
        }
        const labelledby = svgElement.getAttribute('aria-labelledby');
        if (labelledby) {
            try { // Finding elements by ID can fail if ID is invalid
                 const labelElement = document.getElementById(labelledby);
                 if (labelElement) {
                     return { name: (labelElement.textContent || '').trim(), type: 'aria-labelledby', statusClass: 'named', statusText: 'NAME' };
                 }
            } catch (e) {
                 console.warn("Kolla A11y: Error finding labelledby element", labelledby, e);
            }
        }

        // Check for <title> element (direct child recommended)
        const titleElement = svgElement.querySelector(':scope > title');
        if (titleElement) {
            return { name: (titleElement.textContent || '').trim(), type: 'title', statusClass: 'named', statusText: 'NAME' };
        }

        // Check if it has role="img" but *no* name was found above
        if (svgElement.getAttribute('role') === 'img') {
            return { name: null, type: 'missing', statusClass: 'missing', statusText: 'NO NAME' };
        }

        // Default: No explicit role=img or name found
        return { name: "[No explicit name or role=\"img\"]", type: 'unclear', statusClass: 'unclear', statusText: '???' };
    }

    function runImagesCheck() {
        console.log("Kolla A11y: Running Images Check...");
        cleanupImages(); // Clean previous run first

        const images = Array.from(document.querySelectorAll('img'));
        const svgs = Array.from(document.querySelectorAll('svg'));
        const outputItems = [];
        let imgCount = 0;
        let svgCount = 0;
        let missingAltCount = 0;
        let emptyAltCount = 0;
        let missingSvgNameCount = 0;

        images.forEach((img, index) => {
            if (img.closest(`#${KOLLA_A11Y_TOOLBAR_ID}`) || img.closest(`#${KOLLA_A11Y_OUTPUT_ID}`)) return; // Skip our own UI

            imgCount++;
            const targetId = `${KOLLA_A11Y_PREFIX}-image-${index}`;
            img.setAttribute('data-kolla-a11y-id', targetId);
            img.classList.add(`${KOLLA_A11Y_PREFIX}-highlight`);
            img.classList.add(`${KOLLA_A11Y_PREFIX}-highlight-image`);

            const src = img.getAttribute('src') || "[No src]";
            let altText = '';
            let altState = 'present'; // 'present', 'missing', 'empty'
            let issueMsg = null;
            let statusClass = '';
            let statusText = '';

            if (img.hasAttribute('alt')) {
                altText = img.getAttribute('alt');
                if (altText.trim() === '') {
                    altState = 'empty';
                    altText = '[Empty alt]';
                    emptyAltCount++;
                    statusClass = `${KOLLA_A11Y_PREFIX}-highlight-image-alt-empty`;
                    statusText = 'ALT=""';
                    // issueMsg = 'Empty alt attribute (alt="") - Verify if decorative.'; // Optional: make this an issue
                } else {
                    altState = 'present';
                    statusClass = `${KOLLA_A11Y_PREFIX}-highlight-image-alt-present`;
                    statusText = 'ALT';
                }
            } else {
                altState = 'missing';
                altText = '[Missing alt!]';
                issueMsg = 'Missing alt attribute!';
                missingAltCount++;
                statusClass = `${KOLLA_A11Y_PREFIX}-highlight-image-alt-missing`;
                statusText = 'NO ALT';
            }
            // Add status class and variable for ::before pseudo-element
            img.classList.add(statusClass);
            img.style.setProperty(`--${KOLLA_A11Y_PREFIX}-img-status`, `'${statusText}'`);

            outputItems.push({
                type: 'img',
                targetId: targetId,
                src: img.currentSrc || src, // Use currentSrc for responsive images if available
                altText: altText,
                altState: altState,
                issue: issueMsg
            });
        });

        svgs.forEach((svg, index) => {
            if (svg.closest(`#${KOLLA_A11Y_TOOLBAR_ID}`) || svg.closest(`#${KOLLA_A11Y_OUTPUT_ID}`)) return;

            // Skip very small SVGs unless they have role=img (likely icons/spacers)
            const rect = svg.getBoundingClientRect();
            if (rect.width < 5 && rect.height < 5 && !svg.hasAttribute('role')) return;

            svgCount++;
            const targetId = `${KOLLA_A11Y_PREFIX}-svg-${index}`;
            svg.setAttribute('data-kolla-a11y-id', targetId);
            svg.classList.add(`${KOLLA_A11Y_PREFIX}-highlight`);
            svg.classList.add(`${KOLLA_A11Y_PREFIX}-highlight-svg`);

            const accessibleInfo = getSvgAccessibleName(svg);
            let issueMsg = null;

            if (accessibleInfo.type === 'missing') {
                issueMsg = 'SVG has role="img" but no accessible name found!';
                missingSvgNameCount++;
            } else if (accessibleInfo.type === 'unclear') {
                 issueMsg = 'SVG has no explicit role or name. Verify purpose.'; // More of a notice than an error
            }

            // Add status class and variable for ::before pseudo-element
            svg.classList.add(`${KOLLA_A11Y_PREFIX}-highlight-svg-${accessibleInfo.statusClass}`);
            svg.style.setProperty(`--${KOLLA_A11Y_PREFIX}-img-status`, `'${accessibleInfo.statusText}'`);

            outputItems.push({
                type: 'svg',
                targetId: targetId,
                altText: accessibleInfo.name, // Use altText property for consistency
                altState: accessibleInfo.type, // e.g., 'aria-label', 'title', 'missing', etc.
                issue: issueMsg
            });
        });

        // --- Generate Panel HTML ---
        let panelHtml = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h3 id="${KOLLA_A11Y_PANEL_TITLE_ID}" style="margin: 0;">Images & SVGs</h3>
                            <button id="${KOLLA_A11Y_PANEL_CLOSE_BTN_ID}" aria-label="Close Images Panel" class="${KOLLA_A11Y_PREFIX}-panel-close-btn">&times;</button>
                         </div>`;

        // Use plain text for tag names
        panelHtml += `<div class="${KOLLA_A11Y_PREFIX}-info-header">
                        Found: ${imgCount} img, ${svgCount} relevant svg. Issues: ${missingAltCount} missing alt, ${emptyAltCount} empty alt, ${missingSvgNameCount} SVG name missing.
                      </div>`;

        panelHtml += `<div id="${KOLLA_A11Y_IMAGE_LIST_CONTAINER_ID}">`; // Container for the list

        if (outputItems.length === 0) {
            panelHtml += '<p>No relevant images or SVGs found on this page.</p>';
        } else {
            outputItems.forEach(item => {
                panelHtml += `<div class="kolla-a11y-image-item">`;
                // Preview Column
                panelHtml += `<div class="kolla-a11y-image-preview" data-target-id="${item.targetId}" title="Click to scroll to element">`;
                if (item.type === 'img') {
                     // Handle images with no src for preview
                     if (item.src === "[No src]") {
                         panelHtml += `<span class="${KOLLA_A11Y_PREFIX}-no-src-preview">[No src]</span>`;
                     } else {
                         panelHtml += `<img src="${item.src}" alt="Preview" loading="lazy">`; // Add lazy loading
                     }
                } else { // SVG
                    try {
                        // Attempt to clone SVG - might fail for complex cases or shadow DOM
                        const svgElement = document.querySelector(`[data-kolla-a11y-id="${item.targetId}"]`);
                        if (svgElement) {
                            const clone = svgElement.cloneNode(true);
                            // Remove attributes that might affect preview size/rendering
                            clone.removeAttribute('width');
                            clone.removeAttribute('height');
                            clone.removeAttribute('style');
                            clone.removeAttribute('class'); // Avoid inheriting page styles within preview
                            panelHtml += clone.outerHTML;
                        } else {
                            panelHtml += 'SVG'; // Fallback text
                        }
                    } catch (e) {
                         console.warn("Kolla A11y: Error cloning SVG for preview", item.targetId, e);
                         panelHtml += 'SVG'; // Fallback text on error
                    }
                }
                panelHtml += `</div>`; // End preview

                // Info Column
                panelHtml += `<div class="kolla-a11y-image-info">`;
                if (item.type === 'img') {
                    panelHtml += `<strong>Alt Text:</strong>`;
                    // Apply error background directly to alt text display if issue
                    panelHtml += `<div class="kolla-a11y-image-alt ${item.altState === 'missing' || item.altState === 'empty' ? KOLLA_A11Y_PREFIX + '-heading-error' : ''}">${item.altText}</div>`;
                     panelHtml += `<div class="kolla-a11y-image-src">Src: ${item.src}</div>`;
                } else { // SVG
                     panelHtml += `<strong>Accessible Name (${item.altState}):</strong>`;
                     panelHtml += `<div class="kolla-a11y-svg-name ${item.altState === 'missing' || item.altState === 'unclear' ? KOLLA_A11Y_PREFIX + '-heading-error' : ''}">${item.altText || "[None]"}</div>`;
                }

                if (item.issue) {
                    // Use standard issue styling
                    panelHtml += `<div class="kolla-a11y-issue">(${item.issue})</div>`;
                }
                panelHtml += `</div>`; // End info

                panelHtml += `</div>`; // End item
            });
        }

        panelHtml += `</div>`; // End list container

        // --- Create and Inject Panel ---
        const panel = document.createElement('div');
        panel.id = KOLLA_A11Y_OUTPUT_ID;
        panel.innerHTML = panelHtml;
        document.body.appendChild(panel);

        // Add event listener for panel interactions
        panel.addEventListener('click', (event) => {
            // Handle clicks on preview/link to element
            const targetId = event.target.closest('[data-target-id]')?.dataset.targetId;
            if (targetId) {
                event.preventDefault();
                const targetElement = document.querySelector(`[data-kolla-a11y-id="${targetId}"]`);
                if (targetElement) {
                    targetElement.setAttribute('tabindex', '-1');
                    targetElement.focus({ preventScroll: true });
                    targetElement.removeAttribute('tabindex');
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return; // Stop processing click
            }

            // Handle clicks on the panel close button
            const closeButton = event.target.closest(`.${KOLLA_A11Y_PREFIX}-panel-close-btn`);
            if (closeButton) {
                event.preventDefault();
                cleanupImages(); // Clean up this specific tool
                 // Also visually deactivate the main toolbar button
                 const imageToolButton = document.querySelector(`#${KOLLA_A11Y_TOOLBAR_ID} button[data-tool="images"]`);
                 if(imageToolButton) imageToolButton.setAttribute('aria-pressed', 'false');
                 currentActiveTool = null; // Update global state
            }
        });
    }


    // --- Toolbar Creation ---
    function createToolbar() {
        // --- CSS Definitions ---
        const css = `
            /* --- General Toolbar --- */
            #${KOLLA_A11Y_TOOLBAR_ID} {
                all: initial;
                position: fixed; top: 0; left: 0; width: 100%;
                box-sizing: border-box; z-index: 2147483647; background-color: #333;
                color: #fff; padding: 8px 12px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                font-size: 14px; line-height: 1.5; display: flex; flex-wrap: wrap;
                gap: 8px; align-items: center; border-bottom: 1px solid #555;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3); text-align: left;
            }
            #${KOLLA_A11Y_TOOLBAR_ID} * {
                box-sizing: border-box; font-family: inherit; font-size: inherit;
                line-height: inherit; color: inherit; margin: 0; padding: 0;
                border: 0; background: none;
            }
            #${KOLLA_A11Y_TOOLBAR_ID} button {
                all: initial; display: inline-block; text-align: center;
                font-family: inherit; font-size: inherit; line-height: inherit; color: #fff;
                background-color: #555; border: 1px solid #777; padding: 5px 10px;
                cursor: pointer; border-radius: 3px; transition: background-color 0.2s ease;
                white-space: nowrap;
            }
            #${KOLLA_A11Y_TOOLBAR_ID} button:focus-visible {
                outline: 3px solid cyan !important; outline-offset: 1px;
                box-shadow: 0 0 0 3px rgba(0, 150, 255, 0.7);
            }
            #${KOLLA_A11Y_TOOLBAR_ID} button:hover { background-color: #666; }
            #${KOLLA_A11Y_TOOLBAR_ID} button[aria-pressed="true"] {
                background-color: #007bff; border-color: #0056b3; font-weight: bold;
            }
            #${KOLLA_A11Y_TOOLBAR_ID} button.${KOLLA_A11Y_PREFIX}-close {
                background-color: #dc3545; border-color: #bd2130; margin-left: auto;
                font-weight: bold; font-size: 1.2em; padding: 2px 8px; line-height: 1;
            }
            #${KOLLA_A11Y_TOOLBAR_ID} button.${KOLLA_A11Y_PREFIX}-close:hover { background-color: #c82333; }

            /* --- General Highlighting (Outline/Shadow Only) --- */
            .${KOLLA_A11Y_PREFIX}-highlight {
                outline: 3px dashed red !important;
                outline-offset: 2px;
                box-shadow: 0 0 5px 2px rgba(255, 0, 0, 0.5) !important;
                /* background-color: rgba(255, 0, 0, 0.1) !important; REMOVED */
                scroll-margin-top: 50px !important; /* Offset for fixed toolbar */
            }

             /* --- Heading Specific Highlights --- */
            .${KOLLA_A11Y_PREFIX}-highlight-heading {
                outline-color: magenta !important;
                box-shadow: 0 0 5px 2px rgba(255, 0, 255, 0.5) !important;
                background-color: rgba(255, 0, 255, 0.1) !important; /* Specific background */
                position: relative; /* Needed for ::before */
            }
            .${KOLLA_A11Y_PREFIX}-highlight-heading::before {
                content: var(--${KOLLA_A11Y_PREFIX}-heading-level, '?');
                position: absolute; top: -1.8em; left: -5px; background-color: magenta;
                color: #fff; font-size: 10px; font-weight: bold; padding: 2px 4px;
                border-radius: 2px; z-index: 1; line-height: 1; font-family: sans-serif;
                display: inline-block; text-align: center; white-space: nowrap;
            }

             /* --- Image/SVG Specific Highlights --- */
            .${KOLLA_A11Y_PREFIX}-highlight-image,
            .${KOLLA_A11Y_PREFIX}-highlight-svg {
                outline-offset: 3px; /* Slightly larger offset for images */
                position: relative; /* Needed for ::before */
                /* scroll-margin-top is inherited from general highlight */
            }
            .${KOLLA_A11Y_PREFIX}-highlight-image { outline-color: #007bff !important; }
            .${KOLLA_A11Y_PREFIX}-highlight-svg { outline-color: #ff9800 !important; }

            /* Status Tag via ::before */
            .${KOLLA_A11Y_PREFIX}-highlight-image::before,
            .${KOLLA_A11Y_PREFIX}-highlight-svg::before {
                content: var(--${KOLLA_A11Y_PREFIX}-img-status, '?'); /* Display status text */
                position: absolute; top: -1.5em; left: -5px; color: #fff;
                font-size: 10px; font-weight: bold; padding: 2px 4px; border-radius: 2px;
                z-index: 1; line-height: 1; font-family: sans-serif; white-space: nowrap;
                text-align: center; min-width: 2em; display: inline-block;
            }
            /* Status Tag Colors */
            .${KOLLA_A11Y_PREFIX}-highlight-image-alt-present::before { background-color: #4CAF50; } /* Green */
            .${KOLLA_A11Y_PREFIX}-highlight-image-alt-empty::before { background-color: #ff9800; } /* Orange */
            .${KOLLA_A11Y_PREFIX}-highlight-image-alt-missing::before { background-color: #f44336; } /* Red */
            .${KOLLA_A11Y_PREFIX}-highlight-svg-named::before { background-color: #4CAF50; } /* Green */
            .${KOLLA_A11Y_PREFIX}-highlight-svg-decorative::before { background-color: #ff9800; } /* Orange */
            .${KOLLA_A11Y_PREFIX}-highlight-svg-missing::before { background-color: #f44336; } /* Red */
            .${KOLLA_A11Y_PREFIX}-highlight-svg-unclear::before { background-color: #9e9e9e; } /* Grey */
            .${KOLLA_A11Y_PREFIX}-highlight-svg-hidden::before { background-color: #9e9e9e; } /* Grey */


            /* --- General Output Panel --- */
            #${KOLLA_A11Y_OUTPUT_ID} {
                all: initial; /* Reset styles */
                position: fixed; top: 60px; right: 10px; max-width: 350px;
                max-height: 70vh; overflow-y: auto; background-color: #fff; /* SOLID WHITE */
                color: #111; border: 1px solid #999; box-shadow: 3px 3px 8px rgba(0,0,0,0.3);
                padding: 15px; z-index: 2147483646; /* Below toolbar */
                /* Use sans-serif font stack */
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                font-size: 13px; line-height: 1.6; border-radius: 4px;
                /* Removed opacity */
            }
            #${KOLLA_A11Y_OUTPUT_ID} * {
                 all: revert; /* Allow basic styles inside, inherit font */
            }
            #${KOLLA_A11Y_OUTPUT_ID} h3 { /* Panel Title Style */
                 margin: 0 0 10px 0; padding-bottom: 5px; font-size: 1.1em;
                 font-weight: bold; color: #333;
                 /* Removed border - handled by flex layout div */
            }
             /* Panel Close Button */
            .${KOLLA_A11Y_PREFIX}-panel-close-btn {
                all: initial; font-family: inherit; font-size: 1.6em; line-height: 1;
                color: #666; background: transparent; border: none; padding: 0 5px;
                cursor: pointer; border-radius: 3px;
            }
            .${KOLLA_A11Y_PREFIX}-panel-close-btn:hover { color: #111; background-color: #ddd; }
            .${KOLLA_A11Y_PREFIX}-panel-close-btn:focus-visible {
                outline: 2px solid #005a9c; outline-offset: 2px;
            }
            /* Generic issue styling */
            .${KOLLA_A11Y_PREFIX}-issue {
                font-weight: bold; color: red; margin-left: 8px; font-size: 0.9em;
            }
             /* Style for hiding elements accessibly */
            .${KOLLA_A11Y_PREFIX}-visually-hidden {
                border: 0 !important; clip: rect(1px, 1px, 1px, 1px) !important;
                height: 1px !important; overflow: hidden !important; padding: 0 !important;
                position: absolute !important; width: 1px !important; white-space: nowrap !important;
            }

            /* --- Headings Panel Specific --- */
            #${KOLLA_A11Y_OUTPUT_ID} ul { list-style-type: none; padding-left: 0; margin: 0; }
            #${KOLLA_A11Y_OUTPUT_ID} li {
                padding-left: calc((var(--level, 1) - 1) * 20px); /* Indentation */
                margin-bottom: 4px; white-space: normal; /* Allow wrapping */
            }
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-heading-level {
                display: inline-block; width: 25px; font-weight: bold; color: #555;
            }
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-heading-text {
                 cursor: pointer; text-decoration: none; color: #005a9c;
            }
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-heading-text:hover { text-decoration: underline; }
            #${KOLLA_A11Y_OUTPUT_ID} li.${KOLLA_A11Y_PREFIX}-heading-error { /* Error highlighting for list item */
                background-color: #ffebee; border-left: 3px solid #e57373;
                padding-left: calc( (var(--level, 1) - 1) * 20px + 5px ); margin-left: -8px;
                padding-right: 5px; margin-right: -5px; border-radius: 3px;
            }
            #${KOLLA_A11Y_OUTPUT_ID} li.${KOLLA_A11Y_PREFIX}-heading-error .kolla-a11y-issue { color: #c62828; }
            #${KOLLA_A11Y_OUTPUT_ID} .${KOLLA_A11Y_PREFIX}-filter-group { /* Headings filter */
                 all: revert; border: 1px solid #ccc; padding: 5px 10px 8px 10px;
                 margin: 0 0 10px 0; display: block; border-radius: 3px;
            }
            #${KOLLA_A11Y_OUTPUT_ID} .${KOLLA_A11Y_PREFIX}-filter-group legend { font-size: 0.9em; font-weight: bold; padding: 0 5px; }
            #${KOLLA_A11Y_OUTPUT_ID} .${KOLLA_A11Y_PREFIX}-filter-group label {
                 margin-right: 15px; font-size: 0.95em; cursor: pointer;
                 display: inline-flex; align-items: center;
            }
            #${KOLLA_A11Y_OUTPUT_ID} .${KOLLA_A11Y_PREFIX}-filter-group input[type=radio] { margin-right: 5px; position: relative; top: -1px; }
            #${KOLLA_A11Y_OUTPUT_ID} .${KOLLA_A11Y_PREFIX}-hidden-info { /* [hidden] / [visually hidden] tag */
                 font-style: italic; color: #757575; margin-left: 8px; font-size: 0.9em;
            }

            /* --- Images Panel Specific --- */
             #${KOLLA_A11Y_OUTPUT_ID} .${KOLLA_A11Y_PREFIX}-info-header { /* Summary counts */
                font-size: 0.9em; margin-bottom: 15px; padding-bottom: 5px;
                border-bottom: 1px dashed #ccc; color: #444;
                display: block !important; /* Ensure visibility */
            }
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-image-item {
                display: flex; align-items: flex-start; margin-bottom: 12px;
                padding-bottom: 8px; border-bottom: 1px solid #ddd;
            }
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-image-preview {
                flex: 0 0 50px; height: 50px; margin-right: 10px; background-color: #eee;
                display: flex; align-items: center; justify-content: center;
                overflow: hidden; border: 1px solid #ccc; cursor: pointer;
            }
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-image-preview img,
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-image-preview svg {
                max-width: 100%; max-height: 100%; display: block;
            }
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-image-info { flex: 1; font-size: 0.95em; }
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-image-info strong { color: #333; font-weight: bold; }
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-image-alt,
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-svg-name {
                display: block; margin-top: 2px; padding: 3px 5px;
                background-color: #e9e9e9; border-radius: 3px; word-wrap: break-word;
            }
             /* Use heading error style for image alt/name backgrounds */
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-image-alt.${KOLLA_A11Y_PREFIX}-heading-error,
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-svg-name.${KOLLA_A11Y_PREFIX}-heading-error {
                 background-color: #ffebee !important; border: 1px solid #e57373;
            }
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-image-info .kolla-a11y-issue { /* Issue text below alt/name */
                display: block; margin-top: 4px; font-size: 0.9em;
            }
            #${KOLLA_A11Y_OUTPUT_ID} .kolla-a11y-image-src { /* Image source URL */
                font-size: 0.85em; color: #555; margin-top: 4px; word-break: break-all;
            }
            .${KOLLA_A11Y_PREFIX}-no-src-preview { /* Placeholder for preview img with no src */
                font-size: 0.8em; color: #777; text-align: center;
            }
        `;

        // --- Inject Stylesheet ---
        const styleElement = document.createElement('style');
        styleElement.id = KOLLA_A11Y_STYLE_ID;
        styleElement.textContent = css;
        document.head.appendChild(styleElement);

        // --- Toolbar HTML ---
        const toolbarElement = document.createElement('div');
        toolbarElement.id = KOLLA_A11Y_TOOLBAR_ID;
        toolbarElement.setAttribute('role', 'toolbar');
        toolbarElement.setAttribute('aria-label', 'Kolla A11y Accessibility Tools');
        // Button order: Headings, Images, Landmarks, Links, Focusable, Toggle CSS, Close
        toolbarElement.innerHTML = `
            <button data-tool="headings" aria-pressed="false">Headings</button>
            <button data-tool="images" aria-pressed="false">Images</button>
            <button data-tool="landmarks" aria-pressed="false">Landmarks</button>
            <button data-tool="links" aria-pressed="false">Links</button>
            <button data-tool="focusable" aria-pressed="false">Focusable</button>
            <button data-tool="togglecss" aria-pressed="false">Toggle CSS</button>
            <button class="${KOLLA_A11Y_PREFIX}-close" aria-label="Close Kolla A11y Toolbar">&times;</button>
        `;
        document.body.appendChild(toolbarElement);

        // --- Toolbar Event Listener ---
        toolbarElement.addEventListener('click', function(event) {
            const target = event.target;
            // Only process clicks directly on buttons
            if (target.tagName === 'BUTTON') {
                if (target.classList.contains(`${KOLLA_A11Y_PREFIX}-close`)) {
                    cleanupAll(); // Close everything
                } else {
                    const tool = target.getAttribute('data-tool');
                    if (tool) {
                        activateTool(tool, target); // Activate the specific tool
                    }
                }
            }
        });

        // --- Set Initial Focus ---
        const firstButton = toolbarElement.querySelector('button');
        if (firstButton) {
            firstButton.focus();
        }

        console.log('Kolla A11y: Toolbar created.');
    }


    // --- Initialization Logic ---
    const existingToolbar = document.getElementById(KOLLA_A11Y_TOOLBAR_ID);
    if (existingToolbar) {
        // If toolbar exists, clicking again should remove it
        console.log("Kolla A11y: Toolbar exists. Cleaning up.");
        cleanupAll();
    } else {
        // Otherwise, create the toolbar
        console.log("Kolla A11y: Toolbar not found. Creating.");
        createToolbar();
    }

})(); // End of IIFE