import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import nlp from 'compromise';

function isSentenceComplete(sentence) {
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
const rootPath = '/workspaces/gpt4-pdf-chatbot-langchain'
const pdfPath = `${rootPath}/docs/raft.pdf`;
// const pageNum = 1;
const minContentLen = 1000;


function getBoundingRect(items) {
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

(async () => {
    const doc = await getDocument(pdfPath).promise;
    const numPages = doc.numPages;

    let items = [];

    // 遍历所有的page得到items数组
    for (let i = 1; i <= numPages; i++) {
        // 解析处理每一页数据
        const page = await doc.getPage(i);
        const pageWidth = page.view[2];
        const pageHeight = page.view[3];
        const content = await page.getTextContent();
        const contentItems = content.items.map(item => {
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
                pageNumber: pageNum,
            }
        })
        items = items.concat(contentItems)
    }

    
    
    const lines = [];
    let tmp = [];
    for (const item of items) {
        if (!item.hasEOL) {
            tmp.push(item)
        } else {
            if (tmp.length === 0) {
                lines.push(item)
            } else {
                tmp.push(item)
                const boundRect = getBoundingRect(tmp);
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
                    }
                })
                tmp = []
            }
        }
    }

    // 从语法完整角度对lines进行merge
    const chuncks = [];
    let chunck = []
    let contentBuff = '';
    let lastLine = null;
    for (const line of lines) {
        if (lastLine === null) {
            chunck = [line];
            contentBuff = line.str;
            lastLine = line;
        } else if (lastLine.height !== line.height) {
            // 行高度不同
            chuncks.push({
                str: contentBuff,
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

    console.log('finished')
})();