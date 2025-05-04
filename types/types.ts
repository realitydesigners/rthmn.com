import type { PortableTextBlock } from '@portabletext/types';

export interface Signal {
    id: string;
    pair: string;
    pattern_type: string;
    status: string;
    start_price: number | null;
    end_price: number | null;
    stop_loss: number | null;
    take_profit: number | null;
    start_time: string | null;
    end_time: string | null;
    created_at: string;
    pattern_info: string;
    boxes: string;
}

export type CandleData = {
    timestamp: string;
    time?: string;
    volume?: number;
    open: number;
    mid: {
        o: string;
        h: string;
        l: string;
        c: string;
    };
    high: number;
    low: number;
    close: number;
};

export interface Box {
    high: number;
    low: number;
    value: number;
}

export interface BoxSlice {
    timestamp: string;
    boxes: Box[];
    currentOHLC?: OHLC;
}

export interface OHLC {
    open: number;
    high: number;
    low: number;
    close: number;
}

export interface PairData {
    boxes: BoxSlice[];
    currentOHLC: OHLC;
    initialBoxData?: BoxSlice;
}

export interface Candle {
    open: number;
    high: number;
    low: number;
    close: number;
    time: number | string;
    timestamp: number;
    symbol: string;
    volume: number;
}

interface BaseItem {
    _id: string;
    _type: string;
    _createdAt: string;
    title: string;
    name: string;
    slug?: {
        _type: string;
        current: string;
    };
}

export interface Image {
    image?: {
        _id: string;
        _key?: string;
        _type?: string;
        alt?: string;
        asset: {
            _key?: string;
            _type?: string;
            url: string;
        };
    };
    _key?: string;
    _id?: string;
    _type?: string;
    alt?: string;
    block?: Array<BlockItem>;
    slug?: {
        _type: string;
        current: string;
    };
}

export interface TeamMember extends BaseItem {
    role: string;
    image: Image;
    shortBio: string;
}

export interface BlockItem extends BaseItem {
    _key: string;
    heading?: string;
    subheading?: string;
    image?: Image;
    imageRef?: any;
    tags?: string[];
    layout?: string;
    publicationDate?: string;
    team?: TeamMember;
    media?: any;
    videoRefData?: Array<VideoPayload>;
    audioRefData?: any;
    quote?: {
        _key?: string;
        _type?: string;
        quote: string;
        mediaRef?: any;
    };
    markDefs?: any;
    postsRef?: any;
    content?: PortableTextBlock[];
}

export interface PostsPayload extends BaseItem {
    publicationDate?: string;
    excerpt?: string;
    image?: Image;
    block?: Array<BlockItem>;
    content?: PortableTextBlock[];
    ogImage?: Image;
}

export interface CategoryPayload extends BaseItem {
    category?: string;
    isMain?: boolean;
    model?: {
        file?: any;
    };
    sceneIdentifier?: string;
    subCategories?: SubCategoryPayload[];
    position: [number, number, number];
}

export interface SubCategoryPayload extends BaseItem {
    isMain?: boolean;
    sceneIdentifier?: string;
    model?: {
        file?: any;
        l;
    };
    refPosts?: PostsPayload[];
}

export interface VideoPayload extends BaseItem {
    image?: Image;
    video: {
        asset: {
            _ref: string;
        };
    };
    asset: {
        _ref: string;
    };
    url: string;
    subcategories: Array<{
        name: string;
        title: string;
    }>;
    content?: PortableTextBlock[];
    block?: Array<BlockItem>;
    position: number;
    rotationY: number;
}

export interface TeamPayload extends BaseItem {
    role: string;
    shortBio: string;
    block?: Array<BlockItem>;
    content?: PortableTextBlock[];
    bio?: PortableTextBlock[];
    image?: Image;
    scene?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
    tiktok?: string;
}
export interface GlossaryPayload extends BaseItem {
    content?: PortableTextBlock[];
}

export interface BoxData {
    high: number;
    low: number;
    value: number;
    changeToTime?: string;
}

export interface ChangelogEntry {
    _id: string;
    title: string;
    description: string;
    version: string;
    releaseDate: string;
    type: 'feature' | 'bugfix' | 'improvement' | 'breaking';
    content: any[];
    status: 'planned' | 'in-development' | 'released';
    contributors?: {
        _id: string;
        name: string;
        image: {
            asset: {
                url: string;
            };
        };
    }[];
}

export interface BoxColors {
    positive: string;
    negative: string;
    styles?: {
        borderRadius: number;
        shadowIntensity: number;
        opacity: number;
        showBorder: boolean;
        globalTimeframeControl: boolean;
        showLineChart: boolean;
        perspective?: boolean;
        viewMode?: 'default' | '3d' | 'line';
    };
}

export interface PriceData {
    price: number;
    timestamp: string;
    volume?: number;
}

interface Slug {
    current: string;
}

export interface Lesson {
    _id: string;
    title: string;
    description: string;
    slug: {
        current: string;
    };
    content?: any;
}

export interface Chapter {
    _id: string;
    title: string;
    description: string;
    slug: {
        current: string;
    };
    lessons: Lesson[];
}

export interface Course {
    _id: string;
    title: string;
    description: string;
    slug: {
        current: string;
    };
    chapters: Chapter[];
}
