import type { ReactNode } from "react"

const renderInlineMarkdown = (text: string): ReactNode[] => {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g

  return text
    .split(pattern)
    .filter(Boolean)
    .map((part, index) => {
      if (
        (part.startsWith("**") && part.endsWith("**")) ||
        (part.startsWith("__") && part.endsWith("__"))
      ) {
        return <strong key={index}>{part.slice(2, -2)}</strong>
      }

      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className='rounded bg-black/5 px-1 py-0.5 font-mono text-[0.85em]'
          >
            {part.slice(1, -1)}
          </code>
        )
      }

      if (
        (part.startsWith("*") && part.endsWith("*")) ||
        (part.startsWith("_") && part.endsWith("_"))
      ) {
        return <em key={index}>{part.slice(1, -1)}</em>
      }

      return part
    })
}

export const MarkdownDescription = ({ value }: { value: string }) => {
  const lines = value.split("\n")
  const blocks: ReactNode[] = []
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length === 0) return

    blocks.push(
      <ul
        key={`list-${blocks.length}`}
        className='my-2 list-disc space-y-1 pl-5'
      >
        {listItems.map((item, index) => (
          <li key={index}>{renderInlineMarkdown(item)}</li>
        ))}
      </ul>,
    )

    listItems = []
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      return
    }

    const listMatch = trimmed.match(/^[-*]\s+(.+)$/)

    if (listMatch) {
      listItems.push(listMatch[1])
      return
    }

    flushList()

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/)

    if (headingMatch) {
      const HeadingTag = `h${headingMatch[1].length}` as "h1" | "h2" | "h3"

      blocks.push(
        <HeadingTag key={`heading-${index}`} className='my-2 font-semibold'>
          {renderInlineMarkdown(headingMatch[2])}
        </HeadingTag>,
      )
      return
    }

    blocks.push(
      <p key={`paragraph-${index}`} className='my-1'>
        {renderInlineMarkdown(trimmed)}
      </p>,
    )
  })

  flushList()

  return <div className='break-words'>{blocks}</div>
}
