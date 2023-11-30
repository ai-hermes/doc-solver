import nlp from 'compromise';
// import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import * as pdfjslib from "pdfjs-dist";
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import _ from 'lodash';

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

type PdfItem = TextItem & {
    pageNumber: number;
    rect: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        width: number;
        height: number
    }
}

export async function getPdfItems(pdfPath: string) {
    let items: Array<PdfItem> = [];

    const doc = await pdfjslib.getDocument(pdfPath).promise;
    const numPages = doc.numPages;

    // 遍历所有的page得到items数组
    for (let i = 1; i <= numPages; i++) {
        const page = await doc.getPage(i);
        const [pageWidth, pageHeight] = [page.view[2], page.view[3]];
        const content = await page.getTextContent();
        const contentItems = content.items.map((_item) => {
            const item = _item as TextItem;
            // 坐标转换
            let x1 = item.transform[4];
            let y1 = (pageHeight - item.transform[5]) - item.height;
            let x2 = (item.transform[4] + item.width);
            let y2 = y1 + item.height;
            let width = pageWidth;
            let height = pageHeight;
            return {
                ...item,
                rect: {
                    x1, y1, x2, y2,
                    width, height,
                },
                pageNumber: i,
            }
        })
        items = items.concat(contentItems)
    }

    return items
}


function extractPageNums(chuncks: PdfItem[]) {
    const nums = chuncks.map(c => c.pageNumber)
    return Array.from(new Set(nums))
}


const minContentLen = 1000;
export function generateChunks(pdfItem: Array<PdfItem>) {
    const lines:Array<PdfItem> = [];
    let tmp = [];
    for (const item of pdfItem) {
        if (!item.hasEOL) {
            tmp.push(item)
        } else {
            if (tmp.length === 0) {
                lines.push(item)
            } else {
                tmp.push(item)
                const boundRect = getBoundingRect(tmp);
                if(!boundRect) continue
                const { x1, y1, x2, y2, width, height } = boundRect;
                lines.push({
                    str: tmp.map(item => item.str).join(''),
                    dir: 'ltr',
                    width,
                    height,
                    transform: [], // pos 逆变换 !TODO
                    fontName: 'g_d0_f1',
                    hasEOL: true,
                    rect: {
                        x1, y1, x2, y2, width: item.width, height: item.height
                    },
                    pageNumber: item.pageNumber,
                })
                tmp = []
            }
        }
    }

    // 统计可能得行高，文档中一般包含一级、二级标记、正文、引用
    let lineHeight = [];
    // 从语法完整角度对lines进行merge
    const chuncks = [];
    let chunck:Array<PdfItem> = []
    let contentBuff = '';
    let lastLine = null;
    for (const line of lines) {
        lineHeight.push(line.height)
        if (lastLine === null) {
            chunck = [line];
            contentBuff = line.str;
            lastLine = line;
        } else if (lastLine.height !== line.height) {
            // 行高度不同
            chuncks.push({
                str: contentBuff,
                page_nums: extractPageNums(chunck),
                lines: [...chunck]
            })
            contentBuff = line.str
            chunck = [line]
            lastLine = line
        } else if (isSentenceComplete(contentBuff + ' ' + line.str) && `${contentBuff + ' ' + line.str}`.length >= minContentLen) {
            chunck.push(line)
            contentBuff = contentBuff + ' ' + line.str
            chuncks.push({
                str: contentBuff,
                page_nums: extractPageNums(chunck),
                lines: [...chunck]
            })

            contentBuff = ''
            chunck = []
            lastLine = null
        } else {
            contentBuff += ' ' + line.str
            chunck.push(line)
            lastLine = line
        }
    }
    // const contentLineHeight = _.
    lineHeight = Array.from(new Set(lineHeight)).sort((a, b) => a - b)

    return chuncks
}