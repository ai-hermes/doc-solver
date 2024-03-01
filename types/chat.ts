import { Document } from 'langchain/document';

export type Message = {
    type: 'apiMessage' | 'userMessage';
    message: string;
    isStreaming?: boolean;
    sourceDocs?: (Document & {
        highlight: Highlight[]
    })[];
};

export interface Highlight {
    rect_info: RectInfo
    content: string
    chunk_id: string
    origin_info: OriginInfo
    pageNumber: number
}
export interface RectInfo {
    x1: number
    x2: number
    y1: number
    y2: number
    width: number
    height: number
}

export interface OriginInfo {
    id: string
    dir: string
    str: string
    rect: Rect
    width: number
    hasEOL: boolean
    height: number
    chunk_id: string
    fontName: string
    attribute: Attribute
    // transform: any[]
    pageNumber: number
}

export interface Rect {
    x1: number
    x2: number
    y1: number
    y2: number
    width: number
    height: number
}

export interface Attribute {
    source: string
    indexName: string
    innerChunkNo: number
}