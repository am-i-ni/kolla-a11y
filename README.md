# Kolla A11y

Kolla A11y ("Check Accessibility" in Swedish) is a simple browser bookmarklet designed for developers, designers, and accessibility specialists to perform quick, common accessibility checks on web pages. It injects a toolbar at the top of the page providing access to various analysis tools.

<!-- TODO: Add a screenshot of the toolbar in action -->

## Features (Current)

*   **Accessible Toolbar:**
    *   Fixed position at the top of the viewport.
    *   Keyboard navigable and screen reader friendly (`role="toolbar"`).
    *   Clear focus indicators.
    *   Buttons for specific tools with `aria-pressed` state.
    *   Main close button to remove the toolbar.
*   **Headings Outline:**
    *   Highlights H1-H6 elements on the page with a distinct outline (magenta).
    *   Displays the heading level (H1-H6) as an overlay tag on the highlighted element.
    *   Opens a panel showing the document's heading structure as a nested list.
    *   Flags potential issues in the panel:
        *   Multiple H1 tags.
        *   Skipped heading levels.
        *   Empty headings.
    *   Highlights list items corresponding to headings with issues (pink background).
    *   Allows filtering the list by visibility (All / Visible Only / Hidden Only).
    *   Clicking a heading in the panel scrolls to and focuses the corresponding element on the page.
    *   Panel includes its own close button.
*   **Images & SVGs:**
    *   Highlights `<img>` elements (blue outline) and relevant `<svg>` elements (orange outline) on the page.
    *   Displays the alt text status or SVG accessible name status as an overlay tag on the highlighted element (e.g., "ALT", "ALT=\"\"", "NO ALT", "NAME", "DECO", "NO NAME", "HIDDEN", "???").
    *   Opens a panel listing all found images and relevant SVGs.
    *   Shows a small preview of the image or SVG.
    *   Displays the `alt` text for `<img>` elements or the calculated accessible name for `<svg>` elements (from `aria-label`, `aria-labelledby`, or `<title>`).
    *   Flags potential issues in the panel:
        *   Missing `alt` attribute on `<img>`.
        *   Empty `alt` attribute (`alt=""`) on `<img>` (for verification).
        *   Missing accessible name for `<svg role="img">`.
        *   Unclear purpose for `<svg>` with no role or name.
    *   Highlights list items corresponding to images/SVGs with issues.
    *   Displays the `src` attribute for `<img>` elements.
    *   Handles images with missing `src` attributes gracefully in the preview.
    *   Clicking the preview in the panel scrolls to and focuses the corresponding element on the page.
    *   Panel includes its own close button.
*   **Toggle CSS:**
    *   A dedicated button to disable all page styles (except the toolbar's own) and re-enable them. Useful for checking DOM order and semantic structure.
*   **Bookmarklet Toggle:**
    *   Clicking the bookmarklet while the toolbar is active will remove the toolbar and clean up any generated elements or highlights.

## Installation & Usage (Bookmarklet)

The easiest way to use Kolla A11y is via the pre-compiled bookmarklet code:

1.  Open the [`kolla-a11y-bookmarklet.txt`](./kolla-a11y-bookmarklet.txt) file in this repository.
2.  Copy the **entire content** of the file (it's a single line starting with `javascript:`).
3.  In your web browser, create a new bookmark.
    *   *Tip:* Right-click your bookmarks bar and select "Add Page" or "New Bookmark" (or similar).
4.  In the bookmark editor:
    *   Give it a name (e.g., `Kolla A11y`).
    *   Paste the copied code into the **URL** or **Address** field.
5.  Save the bookmark.
6.  Navigate to any web page you want to check and click the newly created "Kolla A11y" bookmark. The toolbar should appear at the top. Click the bookmark again to remove it.

## Development

The main source code is in [`kolla-a11y.js`](./kolla-a11y.js).

**Prerequisites:**

*   Text Editor
*   (Optional but Recommended) A JavaScript minifier (e.g., [Terser](https://terser.org/), [UglifyJS](https://github.com/mishoo/UglifyJS), or an online tool) to create the bookmarklet code.

**Building the Bookmarklet from Source:**

1.  Make your desired changes to `kolla-a11y.js`.
2.  Take the entire JavaScript code from `kolla-a11y.js`.
3.  Use a minifier to compress the code into a single line, removing comments and unnecessary whitespace.
4.  Wrap the minified code in the bookmarklet structure:
    ```javascript
    javascript:(()=>{ /* PASTE MINIFIED CODE HERE */ })();
    ```
5.  (Optional) Paste the final bookmarklet string into `kolla-a11y-bookmarklet.txt` for distribution.
6.  Create/update your browser bookmark using the final `javascript:` string.

**Contributing:**

Contributions are welcome!

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes in `kolla-a11y.js`.
4.  Test thoroughly.
5.  Consider regenerating the `kolla-a11y-bookmarklet.txt` file with your updated, minified code.
6.  Commit your changes (`git commit -am 'Add some feature'`).
7.  Push to the branch (`git push origin feature/your-feature-name`).
8.  Create a new Pull Request.

## License

<!-- TODO: Add your chosen license information here. MIT is a common choice. -->
Example: This project is licensed under the MIT License - see the LICENSE.md file for details.
