/**
 * 🧚‍♀️ How to access:
 *     - Plugin: cf
 *     - import { createLiveWorker, createLiveDurableObject, readCookie } from '@ace/liveServer'
 *     - import type { CreateLiveDurableObjectProps } from '@ace/liveServer'
 */



import { env } from './env'
import { DurableObject } from 'cloudflare:workers'


/**
 * #### An `Ace Live Server` helps us show updates on the screen w/o requiring customers to refresh the page
 * - How `Ace Live Server` works:
 *     - On the `FE` start a `ws` to `/subscribe`
 *     - On the `BE` call `/event` and the payload will be given to all listening @ `/subscribe`
 *     - IF and `onMessage()` is provided @ `createLiveDurableObject()` then you can also accept messages from the browser `ws`
 *     - While the `env` is local (via `ace build local`) then an html is available for testing @ `http://localhost:8787`
 * @example
    ```ts
    // index.ts

    import { jwtValidate } from '@ace/jwtValidate'
    import { createLiveWorker, createLiveDurableObject, readCookie } from '@ace/liveServer'


    export default createLiveWorker() satisfies ExportedHandler<Env>


    export const LiveDurableObject = createLiveDurableObject({
      onMessage(props) {
        console.log('onMessage > props', props)
      },
      onValidateEvent(request) {
        if (request.headers.get('live_secret') !== process.env.LIVE_SECRET) { // to create a password "ace password" in bash ❤️ & place this password in the .env of your app & the .env of your live server, so that only your app can call /event
          return new Response('Unauthorized', { status: 400 })
        }
      },
      async onValidateSubscribe(request) {
        const jwt = readCookie(request, 'aceJWT')
        const res = await jwtValidate({ jwt })
        if (!res.isValid) return new Response('Unauthorized', { status: 400 })
      }
    })
    ```
 */
export function createLiveWorker() {
  return {
    async fetch(request: Request, env: Env) {
      const stub = env.LIVE_DURABLE_OBJECT.getByName('global'); // create durable object stub

      const liveWorker = new LiveWorker(request, stub) // create live worker

      return liveWorker.onFetch()
    }
  }
}



/**
 * #### An `Ace Live Server` helps us show updates on the screen w/o requiring customers to refresh the page
 * - IF `props.onValidateEvent()` OR `props.onValidateSubscribe()` return a Response, that Response will be given to the user, and no further processing will happen
 * - How `Ace Live Server` works:
 *     - On the `FE` start a `ws` to `/subscribe`
 *     - On the `BE` call `/event` and the payload will be given to all listening @ `/subscribe`
 *     - IF and `onMessage()` is provided @ `createLiveDurableObject()` then you can also accept messages from the browser `ws`
 *     - While the `env` is local (via `ace build local`) then an html is available for testing @ `http://localhost:8787`
 * @example
    ```ts
    // index.ts

    import { jwtValidate } from '@ace/jwtValidate'
    import { createLiveWorker, createLiveDurableObject, readCookie } from '@ace/liveServer'


    export default createLiveWorker() satisfies ExportedHandler<Env>


    export const LiveDurableObject = createLiveDurableObject({
      onMessage(props) {
        console.log('onMessage > props', props)
      },
      onValidateEvent(request) {
        if (request.headers.get('live_secret') !== process.env.LIVE_SECRET) { // to create a password "ace password" in bash ❤️ & place this password in the .env of your app & the .env of your live server, so that only your app can call /event
          return new Response('Unauthorized', { status: 400 })
        }
      },
      async onValidateSubscribe(request) {
        const jwt = readCookie(request, 'aceJWT')
        const res = await jwtValidate({ jwt })
        if (!res.isValid) return new Response('Unauthorized', { status: 400 })
      }
    })
    ```
 * @param props.onValidateEvent - Optional, validations to occur when /event is called. IF valid THEN return nothing. IF invalid THEN retrurn the error response that we will give to the user & stop any further processing
 * @param props.onValidateSubscribe - Optional, validations to occur when /subscribe is called. IF valid THEN return nothing. IF invalid THEN retrurn the error response that we will give to the user & stop any further processing
 * @param props.onMessage - Optional, callback to handle direct WS messages from the browser and not from /event
 */
export function createLiveDurableObject(props?: {
  /**  Optional, validations to occur when /event is called. IF valid THEN return nothing. IF invalid THEN retrurn the error response that we will give to the user & stop any further processing */
  onValidateEvent?: (request: Request) => void | Response | Promise<void | Response>,

  /** Optional, validations to occur when /subscribe is called. IF valid THEN return nothing. IF invalid THEN retrurn the error response that we will give to the user & stop any further processing */
  onValidateSubscribe?: (request: Request) => void | Response | Promise<void | Response>,

  /** Optional, callback to handle direct WS messages from the browser and not from /event */
  onMessage?: (props: { ws: WebSocket, stream: string, message: string | ArrayBuffer }) => void | Promise<void>
}) {
  return class LiveDurableObject extends DurableObject {
    wsStreamKey = '___ace_stream'


    async fetch(request: Request): Promise<Response> {
      const url = new URL(request.url)
      const stream = url.searchParams.get('stream')

      if (!stream) return new Response('Missing `stream` query parameter', { status: 400 })

      switch (url.pathname) {
        case '/subscribe': return this.onDurableObjectSubscribe(request, stream)
        case '/event': return this.onDurableObjectEvent(request, stream)
        default: return new Response('Not found', { status: 404 })
      }
    }


    async webSocketMessage(ws: WebSocket, message: ArrayBuffer | string) {
      if (props?.onMessage) {
        const stream = (ws as any)[this.wsStreamKey]
        if (!stream) throw new Error('!stream')

        await props.onMessage({ ws, stream, message })
      }
    }


    webSocketClose(ws: WebSocket, code: number) {
      ws.close(code, 'WebSocket closed by Durable Object')
    }


    async onDurableObjectSubscribe(request: Request, stream: string) {
      if (props?.onValidateSubscribe) {
        const res = await props.onValidateSubscribe(request)
        if (res instanceof Response) return res
      }

      const pair = new WebSocketPair()
      const [client, server] = Object.values(pair);

      if (!server) throw new Error('!server');

      (server as any)[this.wsStreamKey] = stream // save stream on server WS

      this.ctx.acceptWebSocket(server, [stream])
      return new Response(null, { status: 101, webSocket: client })
    }


    async onDurableObjectEvent(request: Request, stream: string) {
      if (props?.onValidateEvent) {
        const res = await props.onValidateEvent(request)
        if (res instanceof Response) return res
      }

      const data = await request.json().catch(() => null)

      if (!data) {
        return new Response('Invalid JSON', { status: 400 })
      }

      const message = JSON.stringify(data)
      const sockets = this.ctx.getWebSockets(stream)

      for (const ws of sockets) {
        try {
          ws.send(message)
        } catch {
          ws.close(1011, 'Broadcast failed')
        }
      }

      return new Response('success', { status: 200 })
    }
  }
}



/**
 * Helpful if you'd love to do validations for a /subscribe
 * @example
    ```ts
    async onValidateSubscribe(request) {
      const jwt = readCookie(request, 'aceJWT')
      const res = await jwtValidate({ jwt })
      if (!res.isValid) return new Response('Unauthorized', { status: 400 })
    }
    ```
 * @param request - Request that has the cookie we wanna know
 * @param cookieName - Cookies "primary key" identifier is its name, which is this
 */
export function readCookie(request: Request, cookieName: string): undefined | string {
  const cookieHeader = request.headers.get("Cookie") || "" // get all cookies from the request headers
  const cookies: Record<string, string> = {} // split cookies into key=value pairs

  cookieHeader.split(";").forEach(cookie => {
    const [name, ...rest] = cookie.trim().split("=")
    if (!name) return

    cookies[name] = rest.join("=")
  })

  return cookies[cookieName]
}



export type CreateLiveDurableObjectProps = Parameters<typeof createLiveDurableObject>[0]



class LiveWorker {
  url: URL
  request: Request
  stub: DurableObjectStub

  constructor(request: Request, stub: DurableObjectStub) {
    this.stub = stub
    this.request = request
    this.url = new URL(this.request.url)
  }

  async onFetch() {
    switch (this.url.pathname) {
      case '/event': return await this.onWorkerEvent()
      case '/subscribe': return await this.onWorkerSubscribe()
      default: return this.onDefault()
    }
  }

  async onWorkerSubscribe() {
    const upgradeHeader = this.request.headers.get('Upgrade')

    if (upgradeHeader !== 'websocket') return new Response('Upgrade header missing', { status: 426 }) // the Upgrade header is an HTTP/1.1 mechanism that allows a client to request switching an already established connection from one protocol to another,
    if (this.request.method !== 'GET') return new Response('When calling /subscribe the request method must be a GET', { status: 400 })

    return this.stub.fetch(this.request);
  }


  async onWorkerEvent() {
    if (this.request.method !== 'POST') return new Response('When calling /event the request method must be a POST', { status: 400 })

    return this.stub.fetch(this.request)
  }


  onDefault() {
    return (env === 'local')
      ? new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
      : new Response('404', { status: 404 })
  }
}



const html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <title>❤️ Ace Live Server</title>
  <style>
    body {
      background-color: #1e1e1e;
      color: #f0f0f0;
      font-family: sans-serif;
      padding: 2rem;
    }

    input,
    button {
      padding: 0.5rem;
      margin: 0.25rem;
      border-radius: 4px;
      border: none;
    }

    input {
      width: 200px;
    }

    button {
      cursor: pointer;
      background-color: #3a3a3a;
      color: #f0f0f0;
    }

    pre {
      background-color: #2a2a2a;
      padding: 1rem;
      border-radius: 4px;
      max-height: 200px;
      overflow-y: auto;
    }

    form {
      margin-bottom: 1rem;
    }

    h3 {
      margin-top: 1.5rem;
    }
  </style>
</head>

<body>
  <h2>❤️ Ace Live Server</h2>

  <!-- Subscribe Form -->
  <form id="subscribeForm">
    <input id="subscribeStream" placeholder="Stream" required />
    <button type="submit">Subscribe</button>
  </form>

  <!-- Event Form -->
  <form id="eventForm">
    <input id="eventStream" placeholder="Stream" required />
    <input id="msg" placeholder="Message" required />
    <button type="submit">Send Event</button>
  </form>

  <!-- Direct WebSocket Form -->
  <form id="wsForm">
    <input id="wsStream" placeholder="Stream" required />
    <input id="wsMsg" placeholder="Message" required />
    <button type="submit">Send WS Message</button>
  </form>

  <div id="streams"></div>

  <script>
    const streamsDiv = document.getElementById("streams");
    const streamSockets = {};   // { streamName: WebSocket }
    const streamElements = {};  // { streamName: preElement }

    // ---------- Subscribe Form ----------
    const subscribeForm = document.getElementById("subscribeForm");
    const subscribeInput = document.getElementById("subscribeStream");

    subscribeForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const stream = subscribeInput.value.trim();
      if (!stream || streamSockets[stream]) return;

      // Create DOM section
      const h3 = document.createElement("h3");
      h3.textContent = '[' + stream + '] Events';
      const pre = document.createElement("pre");
      streamsDiv.appendChild(h3);
      streamsDiv.appendChild(pre);
      streamElements[stream] = pre;

      // Open WebSocket
      const ws = new WebSocket('ws://localhost:8787/subscribe?stream=' + encodeURIComponent(stream));
      ws.addEventListener('message', event => {
        pre.textContent += '\\n' + event.data;
        pre.scrollTop = pre.scrollHeight;
      });
      ws.addEventListener('close', () => {
        pre.textContent += '\\n[WebSocket closed]';
      });

      streamSockets[stream] = ws;
      subscribeInput.value = '';
      subscribeInput.focus();
    });

    // ---------- Event Form ----------
    const eventForm = document.getElementById("eventForm");
    const eventStreamInput = document.getElementById("eventStream");
    const msgInput = document.getElementById("msg");

    eventForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const stream = eventStreamInput.value.trim();
      const message = msgInput.value.trim();
      if (!stream || !message) return;

      const data = { message, timestamp: new Date().toISOString() };

      await fetch('/event?stream=' + encodeURIComponent(stream), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      msgInput.value = "";
      eventStreamInput.focus();
    });

    // ---------- Direct WebSocket Send Form ----------
    const wsForm = document.getElementById("wsForm");
    const wsStreamInput = document.getElementById("wsStream");
    const wsMsgInput = document.getElementById("wsMsg");

    wsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const stream = wsStreamInput.value.trim();
      const message = wsMsgInput.value.trim();
      if (!stream || !message) return;

      const ws = streamSockets[stream];
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }

      wsMsgInput.value = "";
      wsStreamInput.focus();
    });
  </script>
</body>

</html>
`
