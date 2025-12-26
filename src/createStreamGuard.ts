/**
 * A TransformStream that counts bytes and kills the stream if it exceeds a limit
 * This prevents `Header Lying` attacks
 */
export function createStreamGuard(limit: number, errorMessage?: string) {
  let totalBytes = 0;

  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      totalBytes += chunk.byteLength;
      if (totalBytes > limit) {
        controller.error(new Error(errorMessage ?? 'Stream exceeded authorized limit'));
      } else {
        controller.enqueue(chunk);
      }
    },
  });
}