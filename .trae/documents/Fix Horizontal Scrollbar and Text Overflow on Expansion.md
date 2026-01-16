I have identified the potential causes for the horizontal scrollbar and content overflow issues when expanding text cards.

### Problem Analysis
1.  **Horizontal Scrollbar**: The main container in `App.tsx` allows vertical scrolling (`overflow-y-auto`) but defaults to `overflow-x: auto` (or visible), which can trigger a horizontal scrollbar if any content slightly exceeds the width.
2.  **Content Overflow**: In `TextCard.tsx`, the text area uses `whitespace-pre-wrap` which preserves whitespace. Combined with very long words or URLs, `break-words` might sometimes be insufficient to contain the text within the card's padding, especially with the negative margins (`-mx-1`) used for the hover effect.

### Proposed Changes

#### 1. Prevent App-wide Horizontal Scrolling
In `src/sidepanel/App.tsx`, I will add `overflow-x-hidden` to the main content area. This ensures that even if a card is slightly too wide, it won't trigger a scrollbar for the entire panel.

#### 2. Improve Text Wrapping in Cards
In `src/sidepanel/components/cards/TextCard.tsx`, I will:
*   Add `max-w-full` to the text container to ensure it strictly respects the parent width.
*   Retain `break-words` (which maps to `overflow-wrap: break-word`).
*   The negative margin `-mx-1` is acceptable as long as the parent has enough padding (`p-4` is sufficient), but I will ensure the text element itself doesn't force a width expansion.

### Implementation Steps
1.  **Edit `src/sidepanel/App.tsx`**: Update the `<main>` className to include `overflow-x-hidden`.
2.  **Edit `src/sidepanel/components/cards/TextCard.tsx`**: Add `max-w-full` to the text display div.

This approach addresses the scrollbar annoyance directly and reinforces the text container's width constraints.