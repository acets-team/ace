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

  export abstract class WorkerEntrypoint<Env = Cloudflare.Env, Props = {}> implements Rpc.WorkerEntrypointBranded {
    [Rpc.__WORKER_ENTRYPOINT_BRAND]: never;
    protected ctx: ExecutionContext<Props>;
    protected env: Env;
    constructor(ctx: ExecutionContext, env: Env);
    email?(message: ForwardableEmailMessage): void | Promise<void>;
    fetch?(request: Request): Response | Promise<Response>;
    queue?(batch: MessageBatch<unknown>): void | Promise<void>;
    scheduled?(controller: ScheduledController): void | Promise<void>;
    tail?(events: TraceItem[]): void | Promise<void>;
    tailStream?(event: TailStream.TailEvent<TailStream.Onset>): TailStream.TailEventHandlerType | Promise<TailStream.TailEventHandlerType>;
    test?(controller: TestController): void | Promise<void>;
    trace?(traces: TraceItem[]): void | Promise<void>;
  }

  type R2Range = {
    offset: number;
    length?: number;
  } | {
    offset?: number;
    length: number;
  } | {
    suffix: number;
  };
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

interface Request<CfHostMetadata = unknown, Cf = CfProperties<CfHostMetadata>> extends Body {
  /**
   * The **`clone()`** method of the Request interface creates a copy of the current `Request` object.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/clone)
   */
  clone(): Request<CfHostMetadata, Cf>;
  /**
   * The **`method`** read-only property of the `POST`, etc.) A String indicating the method of the request.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/method)
   */
  method: string;
  /**
   * The **`url`** read-only property of the Request interface contains the URL of the request.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/url)
   */
  url: string;
  /**
   * The **`headers`** read-only property of the with the request.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/headers)
   */
  headers: Headers;
  /**
   * The **`redirect`** read-only property of the Request interface contains the mode for how redirects are handled.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/redirect)
   */
  redirect: string;
  fetcher: Fetcher | null;
  /**
   * The read-only **`signal`** property of the Request interface returns the AbortSignal associated with the request.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/signal)
   */
  signal: AbortSignal;
  cf: Cf | undefined;
  /**
   * The **`integrity`** read-only property of the Request interface contains the subresource integrity value of the request.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/integrity)
   */
  integrity: string;
  /**
   * The **`keepalive`** read-only property of the Request interface contains the request's `keepalive` setting (`true` or `false`), which indicates whether the browser will keep the associated request alive if the page that initiated it is unloaded before the request is complete.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/keepalive)
   */
  keepalive: boolean;
  /**
   * The **`cache`** read-only property of the Request interface contains the cache mode of the request.
   *
   * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/cache)
   */
  cache?: "no-store" | "no-cache";
}


type CfProperties<HostMetadata = unknown> = IncomingRequestCfProperties<HostMetadata> | RequestInitCfProperties;

declare abstract class R2Bucket {
  head(key: string): Promise<R2Object | null>;
  get(key: string, options: R2GetOptions & {
    onlyIf: R2Conditional | Headers;
  }): Promise<R2ObjectBody | R2Object | null>;
  get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: R2PutOptions & {
    onlyIf: R2Conditional | Headers;
  }): Promise<R2Object | null>;
  put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: R2PutOptions): Promise<R2Object>;
  createMultipartUpload(key: string, options?: R2MultipartOptions): Promise<R2MultipartUpload>;
  resumeMultipartUpload(key: string, uploadId: string): R2MultipartUpload;
  delete(keys: string | string[]): Promise<void>;
  list(options?: R2ListOptions): Promise<R2Objects>;
}

declare abstract class R2Object {
  readonly key: string;
  readonly version: string;
  readonly size: number;
  readonly etag: string;
  readonly httpEtag: string;
  readonly checksums: R2Checksums;
  readonly uploaded: Date;
  readonly httpMetadata?: R2HTTPMetadata;
  readonly customMetadata?: Record<string, string>;
  readonly range?: R2Range;
  readonly storageClass: string;
  readonly ssecKeyMd5?: string;
  writeHttpMetadata(headers: Headers): void;
}

type R2Objects = {
  objects: R2Object[];
  delimitedPrefixes: string[];
} & ({
  truncated: true;
  cursor: string;
} | {
  truncated: false;
});


interface R2PutOptions {
  onlyIf?: (R2Conditional | Headers);
  httpMetadata?: (R2HTTPMetadata | Headers);
  customMetadata?: Record<string, string>;
  md5?: ((ArrayBuffer | ArrayBufferView) | string);
  sha1?: ((ArrayBuffer | ArrayBufferView) | string);
  sha256?: ((ArrayBuffer | ArrayBufferView) | string);
  sha384?: ((ArrayBuffer | ArrayBufferView) | string);
  sha512?: ((ArrayBuffer | ArrayBufferView) | string);
  storageClass?: string;
  ssecKey?: (ArrayBuffer | string);
}

interface R2Checksums {
  readonly md5?: ArrayBuffer;
  readonly sha1?: ArrayBuffer;
  readonly sha256?: ArrayBuffer;
  readonly sha384?: ArrayBuffer;
  readonly sha512?: ArrayBuffer;
  toJSON(): R2StringChecksums;
}

interface R2HTTPMetadata {
  contentType?: string;
  contentLanguage?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  cacheControl?: string;
  cacheExpiry?: Date;
}
