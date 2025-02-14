export const Block = (props: { key?: string; layout?: 'course' | 'default'; children: any[] }) => ({
    _type: 'courseBlock',
    _key: props.key || generateKey(),
    layout: props.layout || 'course',
    content: props.children,
});

// Heading Components
export const H1 = (props: { text: string; key?: string }) => ({
    _type: 'block',
    _key: props.key || generateKey(),
    style: 'h1',
    children: [{ _type: 'span', _key: generateKey(), text: props.text }],
});

export const H2 = (props: { text: string; key?: string }) => ({
    _type: 'block',
    _key: props.key || generateKey(),
    style: 'h2',
    children: [{ _type: 'span', _key: generateKey(), text: props.text }],
});

export const H3 = (props: { text: string; key?: string }) => ({
    _type: 'block',
    _key: props.key || generateKey(),
    style: 'h3',
    children: [{ _type: 'span', _key: generateKey(), text: props.text }],
});

export const H4 = (props: { text: string; key?: string }) => ({
    _type: 'block',
    _key: props.key || generateKey(),
    style: 'h4',
    children: [{ _type: 'span', _key: generateKey(), text: props.text }],
});

// Text Components
export const Text = (props: { text: string; key?: string }) => ({
    _type: 'block',
    _key: props.key || generateKey(),
    style: 'normal',
    children: [{ _type: 'span', _key: generateKey(), text: props.text }],
});

// Rich Text Components
export const Bold = (props: { text: string; key?: string }) => ({
    _type: 'block',
    _key: props.key || generateKey(),
    style: 'normal',
    children: [{ _type: 'span', _key: generateKey(), text: props.text, marks: ['strong'] }],
});

export const Italic = (props: { text: string; key?: string }) => ({
    _type: 'block',
    _key: props.key || generateKey(),
    style: 'normal',
    children: [{ _type: 'span', _key: generateKey(), text: props.text, marks: ['em'] }],
});

// Special Components
export const Callout = (props: {
    title: string;
    points: string[];
    type?: 'info' | 'warning' | 'tip' | 'learning' | 'important'; // Match exactly with CALLOUT_STYLES
    key?: string;
}) => ({
    _type: 'callout',
    _key: props.key || generateKey(),
    title: props.title,
    type: props.type || 'learning',
    points: props.points,
});

export const Image = (props: { url: string; caption?: string; alt: string; key?: string }) => ({
    _type: 'image',
    _key: props.key || generateKey(),
    asset: {
        _type: 'reference',
        _ref: props.url,
    },
    alt: props.alt,
    caption: props.caption,
});

export const CodeBlock = (props: { code: string; language?: string; key?: string }) => ({
    _type: 'code',
    _key: props.key || generateKey(),
    code: props.code,
    language: props.language || 'javascript',
});

export const Quiz = (props: { question: string; options: string[]; correctAnswer: number; explanation: string; key?: string }) => ({
    _type: 'quiz',
    _key: props.key || generateKey(),
    question: props.question,
    options: props.options,
    correctAnswer: props.correctAnswer,
    explanation: props.explanation,
});

function generateKey(length = 12) {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}
