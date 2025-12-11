export async function readBody(request: Request) {
  const text = await request.clone().text()
  return text.length ? JSON.parse(text) : null
}
