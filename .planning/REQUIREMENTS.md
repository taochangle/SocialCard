# REQUIREMENTS.md

## Milestone: v1.4-细节打磨与功能扩展

### Goal
Refine the user interface to ensure a smoother and more professional user experience, focusing on sidebar navigation and action layout.

### Functional Requirements

1. **Enhanced Date Component**
   - Replace the default `<input type="date">` with a more visually consistent component.
   - The component should allow for easy day selection and clearly display the currently selected date.

2. **Scrollable Sidebar Content**
   - The sidebar must support vertical scrolling when its content exceeds the viewport height.
   - The scrollbar should be styled to match the app's aesthetic (using `custom-scrollbar`).

3. **Section Reordering**
   - Move the "One-click Distribution (Beta)" (一键分发) section to the bottom of the sidebar list.
   - Ensure it is positioned just above the "Hashtags" section.

4. **Fixed Export Footer**
   - The "Export 3:4 High-res Image" (导出 3:4 高清图) button must be fixed at the bottom of the sidebar.
   - It should remain visible and accessible even when the sidebar content is scrolled.

### Non-Functional Requirements
- **Responsive Consistency:** The sidebar behavior must remain robust across different screen sizes (desktop vs mobile).
- **Smooth Animation:** Any UI transitions (e.g., date component interactions) should be smooth.
- **Independent Layout:** Sidebar scrolling should not affect the scrolling or layout of the right-side preview panel.
