## Typography

| Variable | Meaning  |
| -------- | -------- |
| `--ace-font-family`    | Base font stack |
| `--ace-font-size`      | Base UI size (ex: `1.6rem` or `1.8rem`) |
| `--ace-line-height`    | Global rhythm |
| `--ace-font-semibold`  | Semibold font-weight |
| `--ace-font-bold`      | Bold font-weight |


## Colors
- `oklch` is recommended & gives us more:
    - Consistent lightness across all hues, which is crucial for predictable accessible contrast
    - Consistent Hues when adjusting lightness or chroma, making for better color ramps
    - Smooth and vibrant gradients, avoiding the dull, grayish midpoint

| Variable                         | Meaning                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------- |
| `--ace-background`               | Apply to `html`                                               |
| `--ace-background-gradient`      | Apply to `body`, If not defined we'll apply `--ace-background` to body (ex: `background: var(--ace-background-gradient, var(--ace-background));`), the  `html` style is what is seen when ios fast bounce scroll at top or bottom of page happens     |
| `--ace-foreground`               | Primary text color on the main background                                       |
| `--ace-card`                     | Background color for `card` surfaces                                            |
| `--ace-card-foreground`          | Text and icon color on `card` surfaces                                          |
| `--ace-popover`                  | Background color for `popovers`, `dropdowns`, and `tooltips`                    |
| `--ace-popover-foreground`       | Text and icon color inside popovers                                             |
| `--ace-primary`                  | Primary brand and action color                                                  |
| `--ace-primary-foreground`       | Text and icon color on primary backgrounds                                      |
| `--ace-secondary`                | Secondary surface or action color                                               |
| `--ace-secondary-foreground`     | Text and icon color on secondary surfaces                                       |
| `--ace-muted`                    | Subtle background for muted UI elements                                         |
| `--ace-muted-foreground`         | Text color for muted or de-emphasized content                                   |
| `--ace-accent`                   | Background accent (highlight) color                                             |
| `--ace-accent-foreground`        | Text and icon color on accent backgrounds                                       |
| `--ace-destructive`              | Color used for destructive actions (e.g. delete, error)                         |
| `--ace-destructive-foreground`   | Text and icon color on destructive backgrounds                                  |
| `--ace-border`                   | Default border color for structural elements                                    |
| `--ace-input`                    | Background color for input fields                                               |
| `--ace-ring`                     | Color used for focus rings and keyboard focus indicators                        |
| `--ace-code`                     | Inline code text color                                                          |




## Focus Ring
| Variable                | Meaning                                      |
| ----------------------- | ---------------------------------------------|
| `--ace-ring-width`      | Thickness of the focus ring outline          |
| `--ace-ring-offset`     | Space between the element and its focus ring |




## Radius

| Variable | Meaning  |
| -------- | -------- |
| `--ace-radius`     | Used everywhere: `buttons`, `cards`, `inputs` |



## Spacing

| Variable | Meaning  |
| -------- | -------- |
| `--ace-spacing-xs`     | Tight padding (chips, icons)        |
| `--ace-spacing-sm`     | Things we click, tap, or type into  |
| `--ace-spacing-md`     | Card padding                        |
| `--ace-spacing-lg`     | Section spacing                     |
| `--ace-spacing-xl`     | Page-level spacing                  |


## Width

| Variable                  | Meaning                                    |
| ------------------------- | ------------------------------------------ |
| `--ace-content-max-width` | Maximum readable content width for layouts |




## Motion

| Variable | Meaning  |
| -------- | -------- |
| `--ace-duration-fast`     | Fast transitions (`hover`, `focus`, `micro-interactions`) |
| `--ace-duration-normal`     | Standard UI transitions and animations |
| `--ace-easing`     | Default easing function for UI motion |



## Shadows

| Variable | Meaning  |
| -------- | -------- |
| `--ace-shadow-sm`     | Subtle elevation |
| `--ace-shadow`        | Default `card` |
| `--ace-shadow-lg`     | `Modal` |
| `--ace-shadow-inset`  | `buttons` & `inputs` |



## Z-Index
- To place something a little higher: `z-index: calc(var(--ace-z-content) + 1);`

| Variable | Meaning |
| -------- | --------|
| `--ace-z-base`     | Base document level: `body` |
| `--ace-z-content`  | Standard content (text, cards, inline elements) |
| `--ace-z-nav`      | Primary navigation and fixed headers |
| `--ace-z-popover`  | Modals, tooltips & popovers |



## Apply Themes in CSS
```css
:root {
  /* light theme defaults */
}

@media (prefers-color-scheme: dark) {
  :root {
    /* dark overrides */
  }
}

html[data-theme="light"] { /* force light */ }
html[data-theme="dark"]  { /* force dark */ }
```



## Set Theme in JS
```js
function setTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}
```



## Apply Text Gradient
```html
<h1 class="ace-text-gradient" style="--ace-text-gradient: var(--ace-foreground-gradient)">
  Ace UI
</h1>
```
