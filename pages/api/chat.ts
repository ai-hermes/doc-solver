import type { NextApiRequest, NextApiResponse } from 'next';
import type { Document } from 'langchain/document';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { genlangPrompt, makeChain } from '@/utils/makechain';
import { pinecone } from '@/utils/pinecone-client';
import { PINECONE_INDEX_NAME } from '@/config/pinecone';
import { embeddingBaseCfg, extraCfg } from '@/config/openai';
import { prisma } from '@/utils/prisma';
import _ from 'lodash';
import { JsonObject } from '@prisma/client/runtime/library';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Content-Encoding', 'none');

  const { question, history, language = "english" } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!question) {
    return res.status(400).json({ message: 'No question in the request' });
  }
  // OpenAI recommends replacing newlines with spaces for best results
  const sanitizedQuestion = question.trim().replaceAll('\n', ' ');

  try {
    const index = pinecone.Index(PINECONE_INDEX_NAME);

    /* create vectorstore*/
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings(embeddingBaseCfg, extraCfg),
      {
        pineconeIndex: index,
        textKey: 'text',
        // namespace: PINECONE_NAME_SPACE, //namespace comes from your config folder
      },
    );

    // Use a callback to get intermediate sources from the middle of the chain
    let resolveWithDocuments: (value: Document[]) => void;
    const documentPromise = new Promise<Document[]>((resolve) => {
      resolveWithDocuments = resolve;
    });
    const retriever = vectorStore.asRetriever({
      callbacks: [
        {
          handleRetrieverEnd(documents) {
            resolveWithDocuments(documents);
          },
        },
      ],
    });

    //create chain
    const chain = makeChain(retriever);

    const pastMessages = history
      .map((message: [string, string]) => {
        return [`Human: ${message[0]}`, `Assistant: ${message[1]}`].join('\n');
      })
      .join('\n');
    console.log(pastMessages);

    const qaRespStream = await chain.stream({
      question: sanitizedQuestion,
      chat_history: pastMessages,
      language: genlangPrompt(language),
    })
    for await (const chunk of qaRespStream) {
      res.write(`data: ${JSON.stringify({
        type: 'msg',
        msg: chunk,
      })}\n\n`);
    }
    


    const sourceDocuments = await documentPromise;
    const uuids = sourceDocuments.map(d => d.metadata['uuid']).filter(Boolean);
    const hs = await prisma.content_items.findMany({
      select: {
        rect_info: true,
        content: true,
        chunk_id: true,
        origin_info: true,
      },
      where: {
        chunk_id: {
          in: uuids
        }
      }
    })
    const hsWithPageNumber = hs.map(h => {
      const pageNumber = (h.origin_info as JsonObject)?.['pageNumber'] as number;
      return {
        ...h,
        pageNumber,
      }
    })
    const groupedHs = _.groupBy(hsWithPageNumber, 'chunk_id');
    const sourceDocumentsWithHs = sourceDocuments.map(s => {
      return {
        ...s,
        highlight: groupedHs[s.metadata['uuid']]
      }
    })
    res.write(`data: ${JSON.stringify({
      type: 'hs',
      highlights: sourceDocumentsWithHs,
    })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end()
    // console.log('response', response);
    // , highlight: hs
    // res.status(200).json({ text: response, sourceDocuments: sourceDocumentsWithHs });
  }
  /* eslint-disable @typescript-eslint/no-explicit-any */
  catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
