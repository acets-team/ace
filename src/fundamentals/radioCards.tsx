/**
 * 🧚‍♀️ How to access:
 *     - import { RadioCards, blueActiveStyle, greenActiveStyle, purpleActiveStyle } from '@ace/radioCards'
 *     - import type { RadioCardProps } from '@ace/radioCards'
 */


import { clear } from './clear'
import { For, Show, createSignal, createUniqueId, type JSX } from 'solid-js'


/**
 * ### Display lovely radios
 * Add to `app.tsx` => `import '@ace/radioCards.styles.css'` & then:
 * @example
  ```tsx
  <RadioCards
    name="color"
    value="blue"
    label="Choose color"
    activeStyle={purpleActiveStyle}
    onChange={(val) => console.log(val)}
    radios={[
      { id: 'red', value: 'red', title: 'Red', checked: true },
      { id: 'blue', value: 'blue', title: 'Blue', slot: <div>🌊</div> },
      { id: 'green', value: 'green', title: 'Green', disabled: true }
    ]}
  />
  ```
 * @param props.label - The `<label>` that goes w/ these `<input>` radios
 * @param props.radios - The array of radioCards to display
 * @param props.radios.id - `<input type="radio" id={radio.id} />`
 * @param props.radios.value - `<input type="radio" value={radio.value} />`
 * @param props.radios.title - Optional, the title in the radioCard
 * @param props.radios.slot - Optional, for custom jsx to be added to a radioCard
 * @param props.radios.disabled - Optional, if this radioCard is disabled. If true, the <label> aka the card gets a class of disabled & the <input> is disabled
 * @param props.radios.description - Optional, the description in the radioCard
 * @param props.name - `<input type="radio" name={name} />` Each radio gets its own name
 * @param props.value - Optional, Set this if you'd like to default the radioCards to a value, must align w/ a value in `props.radios`
 * @param props.onChange - Optional, Callback that happens on radio change that recieves the current value
 * @param props.activeStyle - Optional, what styling you'd love to show when active, defaults to blueActiveStyle, an export of greenActiveStyle and purpleActiveStyle are also available, or your own custom styles
 */
export function RadioCards({ label, radios, name, value, onChange, activeStyle = blueActiveStyle }: RadioCardsProps) {
  const labelId = createUniqueId()

  const [selectedValue, setSelectedValue] = createSignal<string | undefined>(value)

  function handleChange(value: string) {
    setSelectedValue(value)
    if (onChange) onChange(value)
  }

  return <>
    <label class="ace-radio-cards-label" id={labelId}>{label}</label>

    <div class="ace-radio-cards" role="radiogroup" aria-labelledby={labelId}>
      <For each={radios}>{
        (radio) => {
          const isSelected = () => selectedValue() === radio.value

          return <>
            <div class="ace-radio-card">
              <input type="radio" use:clear name={name} id={radio.id} value={radio.value} checked={isSelected()} disabled={radio.disabled} onChange={() => handleChange(radio.value)} />
              <label role="radio" for={radio.id} style={activeStyle} classList={{disabled: radio.disabled}} aria-checked={isSelected()} tabIndex={isSelected() ? 0 : -1}>
                <Show when={radio.slot}>
                  {radio.slot}
                </Show>
                <Show when={radio.title}>
                  <div class="title">{radio.title}</div>
                </Show>
                <Show when={radio.description}>
                  <div class="description">{radio.description}</div>
                </Show>
              </label>
            </div>
          </>
        }
      }</For>
    </div>
  </>
}


export const blueActiveStyle: JSX.CSSProperties = {
  '--ace-radio-card-active-bg-color': '#eef2ff',
  '--ace-radio-card-active-border-color': '#adc7fb',
  '--ace-radio-card-active-transform': 'translateY(-0.18rem)',
  '--ace-radio-card-active-shadow': '0 8px 24px rgba(79, 70, 229, 0.05)'
}


export const greenActiveStyle: JSX.CSSProperties = {
  '--ace-radio-card-active-bg-color': '#60bf8238',
  '--ace-radio-card-active-border-color': '#1b6a38e0',
  '--ace-radio-card-active-transform': 'translateY(-0.18rem)',
  '--ace-radio-card-active-shadow': '0 6px 20px rgba(79, 70, 229, 0.1)',
}


export const purpleActiveStyle: JSX.CSSProperties = {
  '--ace-radio-card-active-bg-color': '#aea5d140',
  '--ace-radio-card-active-border-color': '#664b90cf',
  '--ace-radio-card-active-transform': 'translateY(-0.18rem)',
  '--ace-radio-card-active-shadow': '0 6px 20px rgba(79, 70, 229, 0.1)',
}


export type RadioCardsProps = {
  /** `<input type="radio" name={name} />` Each radio gets its own name */
  name: string,
  /** The `<label>` that goes w/ these `<input>` radios */
  label: string,
  /** Optional, Set this if you'd like to default the radioCards to a value, must align w/ a value in `props.radios` */
  value?: string,
  /** Optional, what styling you'd love to show when active, defaults to blueActiveStyle, an export of greenActiveStyle and purpleActiveStyle are also available, or your own custom styles */
  activeStyle?: JSX.CSSProperties,
  /** Optional, Callback that happens on radio change that recieves the current value */
  onChange?: (value: string) => void,
  /** The array of radioCards to display */
  radios: {
    /** `<input type="radio" id={radio.id} />` */
    id: string,
    /** `<input type="radio" value={radio.value} />` */
    value: string,
    /** Optional, the title in the radioCard */
    title?: string,
    /** Optional, for custom jsx to be added to a radioCard */
    slot?: JSX.Element,
    /** Optional, if this radioCard is disabled. If true, the <label> aka the card gets a class of disabled & the <input> is disabled */
    disabled?: boolean,
    /** Optional, the description in the radioCard */
    description?: string,
  }[],
}
