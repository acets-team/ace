import type { JSX } from 'solid-js'


export function Pulse(props?: {$div?: JSX.HTMLAttributes<HTMLDivElement>}) {
  const baseClass = 'ace-pulse'
  const mergedClass = props?.$div?.class ? `${baseClass} ${props.$div.class}`  : baseClass

  return <>
    <div {...props?.$div} class={mergedClass}></div>
  </>
}
