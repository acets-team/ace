/**
 * 🧚‍♀️ How to access:
 *     - import { startHidden, fadeIn } from '@ace/fadeInOnMount'
 */



import { onMount, type JSX } from 'solid-js'


/**
 * - Helpful mainly in production when you've got images and components that appear before the stylesheets load in and you'd love the initial load to be less janky and more smooth
 * - Place on the `<body>` in the `entry-server.tsx` file
 * @example
  ```
  // @refresh reload
  import { startHidden } from '@ace/fadeInOnMount'
  import { createHandler, StartServer } from '@solidjs/start/server'

  export default createHandler(() => (
    <StartServer
      document={({ assets, children, scripts }) => (
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" href="/favicon.ico" />
            {assets}
          </head>
          <body style={startHidden}>
            <div id="app">{children}</div>
            {scripts}
          </body>
        </html>
      )}
    />
  ))
  ```
 */
export const startHidden: JSX.CSSProperties = { opacity: 0, transition: 'opacity 0.3s ease;'}


/**
 * - Helpful mainly in production when you've got images and components that appear before the stylesheets load in and you'd love the initial load to be less janky and more smooth
 * - For easiest use place this in a RootLayout
 * @example
  ```tsx
  import { Nav } from '@src/Nav/Nav'
  import { Layout } from '@ace/layout'
  import { fadeIn } from '@ace/fadeInOnMount'
  import { Copyright } from '@src/Copyright/Copyright'

  export default new Layout()
    .component(({children}) => {
      fadeIn()

      return <>
        <Nav />
        {children}
        <Copyright />
      </>
    })

  ```
 */
export function fadeIn() {
  onMount(() => document.body.style.opacity = '1')
}
