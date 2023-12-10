import { Page } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDocument = (elm: any): Document =>
  (elm || {}).ownerDocument || document;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getWindow = (elm: any): typeof window =>
  (getDocument(elm) || {}).defaultView || window;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isHTMLElement = (elm: any) =>
  elm instanceof HTMLElement || elm instanceof getWindow(elm).HTMLElement;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isHTMLCanvasElement = (elm: any) =>
  elm instanceof HTMLCanvasElement ||
  elm instanceof getWindow(elm).HTMLCanvasElement;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const asElement = (x: any): HTMLElement => x;

/**
 * 根据当前的dom元素向上查找对应的 Page 对象，返回的 page 对象包含 dom 元素和页码
 */
export const getPageFromElement = (target: HTMLElement): Page | null => {
  // 向上查找满足 class='page' 条件的元素
  const node = asElement(target.closest(".page"));

  // 非法dom元素直接返回
  if (!node || !isHTMLElement(node)) {
    return null;
  }

  // 读取 dom 上的 data-page-number 属性，即页码
  const number = Number(asElement(node).dataset.pageNumber);

  return { node, number } as Page;
};

/**
 * 根据range的起止位置计算出对应的Page列表
 */
export const getPagesFromRange = (range: Range): Page[] => {
  // 根据 range 的 startContainer 和 endContainer 获取对应的 dom 元素
  const startParentElement = range.startContainer.parentElement;
  const endParentElement = range.endContainer.parentElement;

  if (!isHTMLElement(startParentElement) || !isHTMLElement(endParentElement)) {
    return [] as Page[];
  }
  // 根据 dom 元素调用getPageFromElement获取对应的 Page 对象
  const startPage = getPageFromElement(asElement(startParentElement));
  const endPage = getPageFromElement(asElement(endParentElement));

  // 任何一个page对象不合法直接返回
  if (!startPage?.number || !endPage?.number) {
    return [] as Page[];
  }

  // 起止属于同一页，合并返回
  if (startPage.number === endPage.number) {
    return [startPage] as Page[];
  }

  // 仅跨越一页，枚举结果
  if (startPage.number === endPage.number - 1) {
    return [startPage, endPage] as Page[];
  }

  // 处理跨多页(大于1页)的情况
  const pages: Page[] = [];

  let currentPageNumber = startPage.number;

  // 拿到 top-level 的 document 对象
  const document = startPage.node.ownerDocument;

  // 从起始页开始，依次向后遍历，直到结束页，将每一页的 Page 对象放入 pages 数组
  while (currentPageNumber <= endPage.number) {
    const currentPage = getPageFromElement(
      document.querySelector(
        `[data-page-number='${currentPageNumber}'`
      ) as HTMLElement
    );
    if (currentPage) {
      pages.push(currentPage);
    }
    currentPageNumber++;
  }

  return pages as Page[];
};

export const findOrCreateContainerLayer = (
  container: HTMLElement,
  className: string
) => {
  const doc = getDocument(container);
  let layer = container.querySelector(`.${className}`);

  if (!layer) {
    layer = doc.createElement("div");
    layer.className = className;
    container.appendChild(layer);
  }

  return layer;
};
