"use client"

import { useEffect } from "react"

export default function EventShims() {
  useEffect(() => {
    try {
      // Shim para mozPressure -> pressure
      if (typeof window !== 'undefined' && typeof (MouseEvent.prototype as any).mozPressure === 'undefined') {
        Object.defineProperty(MouseEvent.prototype, 'mozPressure', {
          get() {
            // PointerEvent.pressure is the modern property
            // @ts-ignore
            return (this as any).pressure ?? 0
          },
          configurable: true,
        })
      }

      // Shim para mozInputSource -> pointerType
      if (typeof window !== 'undefined' && typeof (MouseEvent.prototype as any).mozInputSource === 'undefined') {
        Object.defineProperty(MouseEvent.prototype, 'mozInputSource', {
          get() {
            // Map pointerType to an approximate numeric code
            // @ts-ignore
            const pt = (this as any).pointerType
            if (!pt) return 0
            if (pt === 'mouse') return 1
            if (pt === 'pen') return 2
            if (pt === 'touch') return 3
            return 0
          },
          configurable: true,
        })
      }
    } catch (e) {
      // noop
    }
  }, [])

  return null
}
