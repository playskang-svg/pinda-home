import Link from '@/components/Link'
import { TOOLS } from '@/lib/site'

export function ToolCards({ except }: { except?: string }) {
  return (
    <ul className="tool-grid">
      {TOOLS.filter((tool) => tool.href !== except).map((tool) => (
        <li key={tool.href}>
          <Link href={tool.href}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" height={280} loading="lazy" src={tool.photo} width={480} />
            <strong>{tool.title}</strong>
            <span>{tool.desc}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
