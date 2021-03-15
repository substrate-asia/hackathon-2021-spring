import { useCallback, useState } from 'react'

export default function useStatus(defaultState = false): [boolean, () => void] {
  const [state, setState] = useState(defaultState)
  const toggle = useCallback(() => setState(state => !state), [])
  return [state, toggle]
}
