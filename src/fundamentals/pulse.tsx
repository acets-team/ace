import type { JSX } from 'solid-js'


export function Pulse(props?: {$div?: JSX.HTMLAttributes<HTMLDivElement>}) {
  let mergedClass = 'ace-pulse'
  if (props?.$div?.class) mergedClass += ' ' + props.$div.class

  return <>
    <div {...props?.$div} class={mergedClass}>{}</div>
  </>
}
