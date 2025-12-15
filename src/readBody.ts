import { createFormDataObject } from './fundamentals/createFormDataObject'


export async function readBody(request: Request) {
  if (request instanceof Request) {
    const contentType = request.headers.get('content-type')

    if (contentType && contentType.includes('multipart/form-data')) {
      return createFormDataObject(await request.formData())
    }
  }

  const text = await request.clone().text()
  return text.length ? JSON.parse(text) : null
}
