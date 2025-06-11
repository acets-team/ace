/**
 * 🧚‍♀️ How to access:
 *     - import { iso } from '@ace/iso'
 */


export function iso (d: DateLike, split = true) {
  const iso = typeof d === 'string' ? d : d.toISOString()
  return split ? iso.split("T")[0] : iso
}


export type DateLike = string | Date
