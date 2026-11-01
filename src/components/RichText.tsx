import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import {
  type JSXConvertersFunction,
  RichText as PayloadRichText,
} from '@payloadcms/richtext-lexical/react'

const firstText = (node: { children?: unknown[] }): string =>
  (node.children?.[0] as { text?: string } | undefined)?.text ?? ''

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  paragraph: ({ node, nodesToJSX }) => {
    const children = nodesToJSX({ nodes: node.children })
    const text = firstText(node)
    if (text.startsWith('▲')) return <p className="caption">{children}</p>
    if (/^(📌|✅|⚠️)/.test(text)) return <p className="note">{children}</p>
    return <p>{children}</p>
  },
})

export function RichText({ data }: { data: unknown }) {
  return (
    <div className="prose">
      <PayloadRichText converters={converters} data={data as SerializedEditorState} disableContainer />
    </div>
  )
}
