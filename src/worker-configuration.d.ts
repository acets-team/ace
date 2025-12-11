declare namespace Cloudflare {
  interface Env {
    LIVE_DURABLE_OBJECT: DurableObjectNamespace<import("./liveDurableObject").LiveDurableObject>;
  }
}
interface Env extends Cloudflare.Env { }

declare const WebSocketPair: {
  new(): {
    0: WebSocket;
    1: WebSocket;
  };
};

declare module 'cloudflare:workers' {
  export = CloudflareWorkersModule;
}

declare namespace CloudflareWorkersModule {
  export abstract class DurableObject<Env = Cloudflare.Env, Props = {}> implements Rpc.DurableObjectBranded {
    [Rpc.__DURABLE_OBJECT_BRAND]: never;
    protected ctx: DurableObjectState<Props>;
    protected env: Env;
    constructor(ctx: DurableObjectState, env: Env);
    fetch?(request: Request): Response | Promise<Response>;
    alarm?(alarmInfo?: AlarmInvocationInfo): void | Promise<void>;
    webSocketMessage?(ws: WebSocket, message: string | ArrayBuffer): void | Promise<void>;
    webSocketClose?(ws: WebSocket, code: number, reason: string, wasClean: boolean): void | Promise<void>;
    webSocketError?(ws: WebSocket, error: unknown): void | Promise<void>;
  }
}

type DurableObjectStub<T extends Rpc.DurableObjectBranded | undefined = undefined> = Fetcher<T, "alarm" | "webSocketMessage" | "webSocketClose" | "webSocketError"> & {
  readonly id: DurableObjectId;
  readonly name?: string;
};

interface ResponseInit {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
  cf?: any;
  webSocket?: (WebSocket | null);
  encodeBody?: "automatic" | "manual";
}


declare namespace Rpc {
  export const __DURABLE_OBJECT_BRAND: '__DURABLE_OBJECT_BRAND';
  export interface DurableObjectBranded {
    [__DURABLE_OBJECT_BRAND]: never;
  }
}


interface DurableObjectState<Props = unknown> {
  waitUntil(promise: Promise<any>): void;
  readonly props: Props;
  readonly id: DurableObjectId;
  readonly storage: DurableObjectStorage;
  container?: Container;
  blockConcurrencyWhile<T>(callback: () => Promise<T>): Promise<T>;
  acceptWebSocket(ws: WebSocket, tags?: string[]): void;
  getWebSockets(tag?: string): WebSocket[];
  setWebSocketAutoResponse(maybeReqResp?: WebSocketRequestResponsePair): void;
  getWebSocketAutoResponse(): WebSocketRequestResponsePair | null;
  getWebSocketAutoResponseTimestamp(ws: WebSocket): Date | null;
  setHibernatableWebSocketEventTimeout(timeoutMs?: number): void;
  getHibernatableWebSocketEventTimeout(): number | null;
  getTags(ws: WebSocket): string[];
  abort(reason?: string): void;
}