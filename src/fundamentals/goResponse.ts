/**
 * 🧚‍♀️ How to access:
 *     - import { GoResponse } from '@ace/goResponse'
 */


export class GoResponse {
  url: string
  status: number
  headers?: Headers

  constructor(url: string, opts?: { headers?: Headers, status?: number }) {
    this.url = url
    this.headers = opts?.headers;
    this.status = opts?.status ?? 301;
  }
}
