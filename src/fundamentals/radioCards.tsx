/**
 * 🧚‍♀️ How to access:
 *     - import { RadioCards, blueActiveStyle, greenActiveStyle, purpleActiveStyle } from '@ace/radioCards'
 *     - import type { RadioCardProps } from '@ace/radioCards'
 */


import { clear } from './clear'
import { For, Show, createMemo, createSignal, createUniqueId, type JSX } from 'solid-js'


/**
 * Display lovely radios
 * @example
  ```tsx
  <RadioCards
    name="color"
    value="blue"
    label="Choose color"
    activeStyle={blueActiveStyle}
    onChange={(val) => console.log(val)}
    radios={[
      { id: 'red', value: 'red', title: 'Red', checked: true },
      { id: 'blue', value: 'blue', title: 'Blue', slot: <div>🌊</div> },
      { id: 'green', value: 'green', title: 'Green', disabled: true }
    ]}
  />
  ```
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
          const isSelected = createMemo(() => selectedValue() === radio.value)

          return <>
            <div class="ace-radio-card">
              <input type="radio" use:clear name={name} id={radio.id} value={radio.value} checked={isSelected()} disabled={radio.disabled} onChange={() => handleChange(radio.value)} />
              <label role="radio" for={radio.id} style={activeStyle} aria-checked={isSelected()} tabIndex={isSelected() ? 0 : -1}>
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
  name: string,
  label: string,
  value?: string
  radios: {
    id: string,
    value: string,
    title?: string,
    slot?: JSX.Element,
    disabled?: boolean,
    description?: string,
  }[],
  activeStyle?: JSX.CSSProperties,
  onChange?: (value: string) => void
}
