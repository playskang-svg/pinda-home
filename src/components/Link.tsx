import type React from 'react'

// shortcut: plain navigation instead of next/link, so no RSC prefetch renders on the free plan. Pages load from the stored HTML in worker.ts.
export default function Link(props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a {...props} />
}
