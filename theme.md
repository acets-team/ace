## Typography

| Variable | Description  | Default |
| -------- | -------- | --- |
| `--ace-font-family`    | Base font stack | `system-ui, sans-serif`|
| `--ace-font-size`      | Base UI size | `1.8rem` |
| `--ace-line-height`    | Base line height | `1.41` |
| `--ace-font-semibold`  | Semibold font-weight | `500` |
| `--ace-font-bold`      | Bold font-weight | `600` |


## Colors
- `oklch` is recommended b/c gives us more:
    - Consistent lightness across all hues, which is crucial for predictable accessible contrast
    - Consistent Hues when adjusting lightness or chroma, making for better color ramps
    - Smooth and vibrant gradients, avoiding the dull, grayish midpoint

| Variable | Description  | Default |
| -------- | -------- | --- |
| `--ace-background`               | Apply to `html` | `oklch(0.17 0.06 254.82)` |
| `--ace-background-gradient`      | Apply to `body`, If not defined we'll apply `--ace-background` to body (ex: `background: var(--ace-background-gradient, var(--ace-background));`), the  `html` style is what is seen when ios fast bounce scroll at top or bottom of page happens     | `N/A` |
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
| `--ace-input`                    | Background color for input/select/textarea fields                               |
| `--ace-input-foreground`         | Text color for input/select/textarea fields                                     |
| `--ace-ring`                     | Color used for focus rings and keyboard focus indicators                        |
| `--ace-code`                     | Inline code text color                                                          |
| `--ace-anchor`                   | Anchor / link text color                                                        |




## Focus Ring
| Variable                | Description                                      |
| ----------------------- | ---------------------------------------------|
| `--ace-ring-width`      | Thickness of the focus ring outline          |
| `--ace-ring-offset`     | Space between the element and its focus ring |




## Radius
- To increase radius: `calc(var(--ace-radius) * 3)`

| Variable | Description  |
| -------- | -------- |
| `--ace-radius` | Base radius (ex: `0.45`) |



## Spacing
- To increase space: `calc(var(--ace-space) * 3)`

| Variable | Description  |
| -------- | -------- |
| `--ace-space` | Base spacing (ex: `0.45`) |



## Width

| Variable                  | Description                                    |
| ------------------------- | ------------------------------------------ |
| `--ace-content-max-width` | Maximum readable content width for layouts |




## Motion

| Variable | Description  |
| -------- | -------- |
| `--ace-duration-fast`    | Fast transitions (`hover`, `focus`, `micro-interactions`) |
| `--ace-duration-normal`  | Standard UI transitions and animations |
| `--ace-easing`           | Default easing function for UI motion |



## Shadows

| Variable | Description  |
| -------- | -------- |
| `--ace-shadow`        | Default `card` |
| `--ace-shadow-inset`  | `buttons` & `inputs` |



## Z-Index
- To place something a little higher: `z-index: calc(var(--ace-z-content) + 1);`

| Variable | Description |
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
