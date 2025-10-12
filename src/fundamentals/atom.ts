import type { AtomIs, AtomSaveLocations } from './types'


export class Atom<T> {
  save: AtomSaveLocations
  is?: AtomIs
  init?: T
  onSerialize?: (value: T) => string
  onDeserialize?: (raw: string) => T

  constructor(props: {
    init?: T,
    is?: AtomIs,
    save?: AtomSaveLocations,
    onSerialize?: (value: T) => string,
    onDeserialize?: (raw: string) => T
  }) {
    this.save = props.save ?? 'idb'
    this.is = props.is
    this.init = props.init
    this.onSerialize = props.onSerialize
    this.onDeserialize = props.onDeserialize
  }
}
