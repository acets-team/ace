export function isFile(file: any, props?: { maxSize?: number, errorMessage?: string, allowedExtensions?: string[] }): { status: true, file: File } | { status: false } {
  if (!(file instanceof File)) return { status: false }
  if (file.size === 0) return { status: false }
  if (props?.maxSize && file.size > props?.maxSize) return { status: false }

  if (props?.allowedExtensions && props.allowedExtensions.length > 0) {
    const extension = file.name.match(/\.([^.]+)$/) // get extension
    if (!extension) return { status: false }

    const ext = extension[1]?.toLowerCase()
    if (!ext) return { status: false }

    const allowed = props.allowedExtensions.map(e => e.toLowerCase())
    if (!allowed.includes(ext)) return { status: false }
  }

  return { file, status: true}
}
