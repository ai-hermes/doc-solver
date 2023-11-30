import type { LTWHP, Page } from "../types.js";

import optimizeClientRects from "./optimize-client-rects";

/**
 * 判断 clientRect 是否在 pageRect 内部
 */
const isClientRectInsidePageRect = (clientRect: DOMRect, pageRect: DOMRect) => {
  if (clientRect.top < pageRect.top) {
    return false;
  }
  if (clientRect.bottom > pageRect.bottom) {
    return false;
  }
  if (clientRect.right > pageRect.right) {
    return false;
  }
  if (clientRect.left < pageRect.left) {
    return false;
  }

  return true;
};

const getClientRects = (
  range: Range,
  pages: Page[],
  shouldOptimize: boolean = true
): Array<LTWHP> => {
  // 得到 range 对应的 rect 区域
  const clientRects = Array.from(range.getClientRects());

  const rects: LTWHP[] = [];


  // 外层遍历所有的rects, 内层遍历所有的pages，
  // 如果rect在page内部，则计算LTWHP，加入到rects中
  for (const clientRect of clientRects) {
    for (const page of pages) {
      // page的node字段就是对应的html元素，获取对应的rect区域
      const pageRect = page.node.getBoundingClientRect();

      // clientRect在pageRect内部，宽高合法且小于pageRect的宽高
      if (
        isClientRectInsidePageRect(clientRect, pageRect) &&
        clientRect.width > 0 &&
        clientRect.height > 0 &&
        clientRect.width < pageRect.width &&
        clientRect.height < pageRect.height
      ) {
        const highlightedRect = {
          top: clientRect.top + page.node.scrollTop - pageRect.top,
          left: clientRect.left + page.node.scrollLeft - pageRect.left,
          width: clientRect.width,
          height: clientRect.height,
          pageNumber: page.number,
        } as LTWHP;

        rects.push(highlightedRect);
      }
    }
  }
  // !!TODO应该是一些合并优化的逻辑
  return shouldOptimize ? optimizeClientRects(rects) : rects;
};

export default getClientRects;
