'use client'

import { useState, useEffect } from 'react'

const ROLES = [
  'Software Engineers',
  'Product Managers',
  'Data Scientists',
  'DevOps Engineers',
  'UX Designers',
  'Engineering Leads',
]

export function RoleCycler() {
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % ROLES.length)
        setFading(false)
      }, 250)
    }, 2800)
    return () => clearInterval(id)
  }, [])

  return (
    <span
      className="transition-opacity duration-300"
      style={{ opacity: fading ? 0 : 1 }}
    >
      {ROLES[index]}
    </span>
  )
}
