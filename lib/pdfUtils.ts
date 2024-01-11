import nlp from 'compromise';

import { TextItem } from 'pdfjs-dist/types/src/display/api';
export type { PDFDocumentProxy, TextItem } from 'pdfjs-dist/types/src/display/api';



export interface Item {
    height: number;
    width: number;
    rect: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    }
}

export type PdfItem = TextItem & {
    id?: string; // uuid 
    pageNumber: number;
    rect: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        width: number;
        height: number
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attribute?: Record<string, any>
}

export type ChunkItem = {
    id?: string; // uuid 
    str: string,
    page_nums: number[],
    lines: Array<PdfItem>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    attribute?: Record<string, any>
}

export function getBoundingRect(items: Item[]) {
    if (!items || items.length === 0) return null;
    // 元素超过一个
    const firstItemRect = items[0].rect;
    let x1 = firstItemRect.x1, y1 = firstItemRect.y1,
        x2 = firstItemRect.x2, y2 = firstItemRect.y2;
    let height = items[0].height;
    let width = items[0].width;
    items.slice(1).forEach(item => {
        x1 = Math.min(item.rect.x1, x1);
        y1 = Math.min(item.rect.y1, y1);
        x2 = Math.max(item.rect.x2, x2);
        y2 = Math.max(item.rect.y2, y2);
        height = Math.max(item.height, height);
        width = item.width + width;
    })
    return {
        x1, y1, x2, y2,
        width,
        height,
    }
}

export function extractPageNums(chuncks: PdfItem[]) {
    const nums = chuncks.map(c => c.pageNumber)
    return Array.from(new Set(nums))
}

export function isSentenceComplete(sentence: string) {
    // 使用 NLP 库分析句子
    const doc = nlp(sentence);

    // 检查句子是否有动词和名词，这是一个简单的指标，表示句子可能是完整的
    const hasVerb = doc.verbs().length > 0;
    const hasNoun = doc.nouns().length > 0;

    // 检查句子是否以句号、问号或感叹号结束
    const hasEndingPunctuation = /[.!?]$/.test(sentence.trim());

    // 如果句子有动词和名词，并且以句号、问号或感叹号结束，那么我们假设它是完整的
    return hasVerb && hasNoun && hasEndingPunctuation;
}