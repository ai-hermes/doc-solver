// import fs from 'fs';
/*
!!node-canvas not support for macos m2 chip
TODO make a self hosted machine

import { createCanvas, Image } from 'canvas';
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs'


async function renderPdfToImage(pdfPath, imagePath) {
    // Load the PDF file.
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const pdfDocument = await pdfjsLib.getDocument({ data }).promise;

    // Get the first page.
    const page = await pdfDocument.getPage(1);

    // Create a canvas to render the page.
    const viewport = page.getViewport({ scale: 1.6666666666666665 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    // Render the page.
    await page.render({ canvasContext: context, viewport }).promise;

    // Save the canvas as an image.
    const image = new Image();
    image.src = canvas.toDataURL();
    // fs.writeFileSync(imagePath, image.toBuffer());
    console.log('finished')
}


const rootDir = '/workspaces/gpt4-pdf-chatbot-langchain';
const pathToPdf = `${rootDir}/docs/raft.pdf`
const pathToPng = `${rootDir}/docs/raft.png`
renderPdfToImage(pathToPdf, pathToPng);
*/