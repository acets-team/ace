type DiffItem<T> = { a: T; b: T }

export type DiffResult<T> = {
  moves: Record<string, DiffItem<T>>
  one: Record<string, T>
  isDiff: boolean
}

export function diff<T extends Record<string, any>>(a: T, b: T): DiffResult<T> {
  const moves: Record<string, DiffItem<T>> = {}
  const one: Record<string, T> = {}
  let isDiff = false

  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  const seen: Record<string, boolean> = {}

  // Check all keys from a
  for (const key of aKeys) {
    const aVal = a[key]
    const bVal = b[key]

    if (!isEqualValue(aVal, bVal)) {
      moves[key] = { a: aVal, b: bVal }
      one[key] = bVal
      isDiff = true
    }
    seen[key] = true
  }

  // Check keys only in b
  for (const key of bKeys) {
    if (seen[key]) continue

    moves[key] = { a: undefined as any, b: b[key] }
    one[key] = b[key]
    isDiff = true
  }

  return { moves, one, isDiff }
}

function isEqualValue(a: any, b: any): boolean {
  if (a === b) return true
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime()
  return false
}
