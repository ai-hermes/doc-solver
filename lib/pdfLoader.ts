import { Document } from "@langchain/core/documents";
import { BufferLoader } from 'langchain/document_loaders/fs/buffer'
import {
    PDFDocumentProxy, TextItem, ChunkItem, PdfItem,
    extractPageNums, getBoundingRect, isSentenceComplete
} from './pdfUtils';
import { v4 as uuidv4 } from 'uuid';


/**
 * A class that extends the `BufferLoader` class. It represents a document
 * loader that loads documents from PDF files.
 * @example
 * ```typescript
 * const loader = new PDFLoader("path/to/bitcoin.pdf");
 * const docs = await loader.load();
 * console.log({ docs });
 * ```
 */
export class PDFLoader extends BufferLoader {
    // eslint-disable-next-line no-use-before-define
    private pdfjs: typeof PDFLoaderImports;
    private doc?: PDFDocumentProxy;
    protected minContentLen = 1000;

    private lines: PdfItem[] = [];
    private chunks: ChunkItem[] = [];
    private metaData: Record<string, string> = {};
    constructor(
        filePath: string,
        {
            // eslint-disable-next-line no-use-before-define
            pdfjs = PDFLoaderImports,
            metaData = {} as Record<string, string>,
        } = {}
    ) {
        super(filePath);
        this.pdfjs = pdfjs;
        this.metaData = metaData;
    }

    /**
     * A method that takes a `raw` buffer and `metadata` as parameters and
     * returns a promise that resolves to an array of `Document` instances. It
     * uses the `getDocument` function from the PDF.js library to load the PDF
     * from the buffer. It then iterates over each page of the PDF, retrieves
     * the text content using the `getTextContent` method, and joins the text
     * items to form the page content. It creates a new `Document` instance
     * for each page with the extracted text content and metadata, and adds it
     * to the `documents` array. If `splitPages` is `true`, it returns the
     * array of `Document` instances. Otherwise, if there are no documents, it
     * returns an empty array. Otherwise, it concatenates the page content of
     * all documents and creates a single `Document` instance with the
     * concatenated content.
     * @param raw The buffer to be parsed.
     * @param metadata The metadata of the document.
     * @returns A promise that resolves to an array of `Document` instances.
     */
    public async parse(
        raw: Buffer,
        metadata: Document["metadata"]
    ): Promise<Document[]> {
        const { getDocument, version } = await this.pdfjs();
        const doc = await getDocument({
            data: new Uint8Array(raw.buffer),
            useWorkerFetch: false,
            isEvalSupported: false,
            useSystemFonts: true,
        }).promise;
        this.doc = doc;

        const lines = await this.getPdfItems();
        const chunks = this.generateChunks(lines);

        // mark relationship of chunk and lines
        // a chunk contains many lines, and a line belongs to many chuncks
        this.chunks = chunks.map((chunk, chunkIndex) => {
            chunk.id = uuidv4();
            chunk.lines = chunk.lines.map((line, lineIndex) => {
                return {
                    ...line,
                    id: uuidv4(),
                    chunk_id: chunk.id,
                    attribute: {
                        ...this.metaData,
                        innerChunkNo: lineIndex,
                    }
                }
            })
            chunk.attribute = {
                ...this.metaData,
                innerChunkNo: chunkIndex,
            };
            return chunk;
        })
        this.lines = this.chunks.reduce((p, c) => {
            return p.concat(c.lines);
        }, this.lines)


        return chunks.map((chunk, index) => {
            return new Document({
                pageContent: chunk.str,
                metadata: {
                    ...metadata,
                    ...this.metaData,
                    libVersion: version,
                    chunkId: chunk.id,
                    innerChunkNo: index,
                    pageNums: chunk.page_nums
                }
            })
        });
    }

    private async getPdfItems() {
        if (!this.doc) return []
        let items: Array<PdfItem> = [];

        const doc = this.doc;
        const numPages = doc.numPages;

        // 遍历所有的page得到items数组
        for (let i = 1; i <= numPages; i++) {
            const page = await doc.getPage(i);
            const [pageWidth, pageHeight] = [page.view[2], page.view[3]];
            const content = await page.getTextContent();
            const contentItems = content.items.map((_item) => {
                const item = _item as TextItem;
                // 坐标转换
                const x1 = item.transform[4];
                const y1 = (pageHeight - item.transform[5]) - item.height;
                const x2 = (item.transform[4] + item.width);
                const y2 = y1 + item.height;
                const width = pageWidth;
                const height = pageHeight;
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

    private generateChunks(pdfItem: Array<PdfItem>) {
        const lines: Array<PdfItem> = [];
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
                    if (!boundRect) continue
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
        const chunks: Array<ChunkItem> = [];
        let chunk: Array<PdfItem> = []
        let contentBuff = '';
        let lastLine = null;
        for (const line of lines) {
            lineHeight.push(line.height)
            if (lastLine === null) {
                chunk = [line];
                contentBuff = line.str;
                lastLine = line;
            } else if (lastLine.height !== line.height) {
                // 行高度不同
                chunks.push({
                    str: contentBuff,
                    page_nums: extractPageNums(chunk),
                    lines: [...chunk]
                })
                contentBuff = line.str
                chunk = [line]
                lastLine = line
            } else if (isSentenceComplete(contentBuff + ' ' + line.str) &&
                `${contentBuff + ' ' + line.str}`.length >= this.minContentLen) {
                chunk.push(line)
                contentBuff = contentBuff + ' ' + line.str
                chunks.push({
                    str: contentBuff,
                    page_nums: extractPageNums(chunk),
                    lines: [...chunk]
                })

                contentBuff = ''
                chunk = []
                lastLine = null
            } else {
                contentBuff += ' ' + line.str
                chunk.push(line)
                lastLine = line
            }
        }
        lineHeight = Array.from(new Set(lineHeight)).sort((a, b) => a - b)

        return chunks
    }

    public getChunkAndLines() {
        return {
            chunks: this.chunks,
            lines: this.lines
        }
    }
}

async function PDFLoaderImports() {
    try {
        const { default: pdfjslib } = await import('pdfjs-dist');
        return pdfjslib;
    } catch (e) {
        console.error(e);
        throw new Error(
            "Failed to load pdf-parse. Please install it with eg. `npm install pdf-parse`."
        );
    }
}
