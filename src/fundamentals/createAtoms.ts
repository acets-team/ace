/**
 * 🧚‍♀️ How to use:
 *   Plugin solid
 *   import { createAtoms } from '@ace/createAtoms'
 */


import type { InferAtoms, Atoms } from './types'
import { useContext, createContext } from 'solid-js'


export function createAtoms<T_Atoms extends Atoms>(atoms: T_Atoms) {
  const AtomsContext = createContext<InferAtoms<T_Atoms>>()

  const useAtoms = () => {
    const context = useContext(AtomsContext)
    if (!context) throw new Error('useAtoms: cannot find AtomsContext')
    return context
  }

  return {
    atoms,
    useAtoms,
    AtomsContext,
  }
}
