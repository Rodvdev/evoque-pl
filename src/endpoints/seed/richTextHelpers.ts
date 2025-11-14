/**
 * Helper functions to create Lexical rich text nodes for Payload CMS seed data
 */

export function createHeadingNode(text: string, level: 'h1' | 'h2' | 'h3' | 'h4' = 'h2') {
  return {
    type: 'heading',
    children: [
      {
        type: 'text',
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text,
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    tag: level,
    version: 1,
  }
}

export function createParagraphNode(text: string) {
  return {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text,
        version: 1,
      },
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

export function createLinkNode(text: string, url: string, newTab: boolean = false) {
  return {
    type: 'link',
    children: [
      {
        type: 'text',
        detail: 0,
        format: 0,
        mode: 'normal',
        style: '',
        text,
        version: 1,
      },
    ],
    direction: 'ltr',
    fields: {
      linkType: 'custom',
      newTab,
      url,
    },
    format: '',
    indent: 0,
    version: 3,
  }
}

export function createTextNode(text: string) {
  return {
    type: 'text',
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    version: 1,
  }
}

export function createRichTextRoot(children: unknown[]) {
  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

export function createRichTextFromText(text: string) {
  return createRichTextRoot([createParagraphNode(text)])
}

export function createRichTextWithHeading(heading: string, paragraph: string) {
  return createRichTextRoot([
    createHeadingNode(heading),
    createParagraphNode(paragraph),
  ])
}

export function createParagraphWithLink(
  textBefore: string,
  linkText: string,
  linkUrl: string,
  textAfter: string = '',
  newTab: boolean = false,
) {
  return {
    type: 'paragraph',
    children: [
      createTextNode(textBefore),
      createLinkNode(linkText, linkUrl, newTab),
      ...(textAfter ? [createTextNode(textAfter)] : []),
    ],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    version: 1,
  }
}

