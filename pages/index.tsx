import React, { FormEvent, KeyboardEvent } from 'react';
import { useRef, useState, useEffect } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import PdfComponent from '@/components/ui/pdf'
import { cn } from '@/utils/cn'
import { useAtom } from 'jotai';
import { hightlightAtom } from '@/components/ui/pdf/store'
// import { v4 as uuidv4 } from 'uuid';
import { IHighlight } from '@/components/ui/react-pdf-highlighter/types'
import MD5 from 'crypto-js/md5';
import { usePathname } from 'next/navigation'
import { createBrowserClient } from "@supabase/ssr";
import { SSE } from 'sse.js';
import type { SSEvent } from 'sse.js';
import { extractSSEData } from '@/utils/sse';
import { Typewriter } from '@/utils/typewriter';
import { useBrowserLanguage } from '@/utils/useBrowserLanguage';
export default function Home() {
  const pathname = usePathname();

  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hi, what would you like to learn about this document?',
        type: 'apiMessage',
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  const [response, setResponse] = useState("");
  const responseRef = useRef(response);

  const [typeWriter] = useState(() => {
    const t = new Typewriter((delta) => {
      responseRef.current += delta
      setResponse(responseRef.current)
    })
    return t;
  })
  const language = useBrowserLanguage()
  //handle form submission
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();
    const source = new SSE('/api/chat', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: "POST",
      payload: JSON.stringify({
        question,
        history,
        language
      }),
    })
    // clear and start consume data from sse stream
    typeWriter.start()
    setResponse('')
    responseRef.current = ''
    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
    }));
    setLoading(true);
    setQuery('');
    setMessageState((state) => {
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            type: 'apiMessage' as Message['type'],
            message: '',
            sourceDocs: [],
          },
        ],
        history: [...state.history, [query, '']],
      }
    });

    source.addEventListener('message', (e: SSEvent) => {
      // console.log("Message: ", e.data);
      if (e.data == "[DONE]") {
        setLoading(false);
        source.close()
        typeWriter.done()
        //scroll to bottom
        messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
        return;
      }
      const { data, isSSEData } = extractSSEData(e.data)
      if (!isSSEData) {
        setLoading(false)
        source.close()
        typeWriter.done()
        messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
        return
      }
      const objectsArray = data.map(item => JSON.parse(item))
      if (objectsArray && !!objectsArray[0].type) {
        // ref: only two type data, one is msg, another is hs
        // msg: pages/api/chat.ts:L80, which means the response is a text message, generate by llm
        // hs:  pages/api/chat.ts:L118, represents highligh area in the pdf, when click the source, it'll highlight the area of pdf and scroll to the highlight area
        if (objectsArray[0].type === 'msg') {
          typeWriter.add(objectsArray[0].msg)
        } else if (objectsArray[0].type === 'hs') {
          setMessageState((state) => {
            let { messages = [] } = state
            if (messages.length !== 0) {
              messages = [
                ...messages.slice(0, messages.length - 1),
                {
                  ...messages[messages.length - 1],
                  sourceDocs: objectsArray[0].highlights,
                },
              ]
            }
            return {
              ...state,
              messages,
            }
          })
        }
      }
    })
    source.stream()
  }

  useEffect(() => {
    if (!response) return
    setMessageState((state) => {
      let { messages = [], history = [] } = state
      if (messages.length !== 0) {
        messages = [
          ...messages.slice(0, messages.length - 1),
          {
            ...messages[messages.length - 1],
            type: 'apiMessage',
            message: response,
          },
        ]
      }
      if (history.length !== 0) {
        history = [
          ...history.slice(0, history.length - 1),
          [query, response]
        ]
      }
      return {
        ...state,
        messages,
        history,
      }
    });
  }, [response])

  //prevent empty submissions
  const handleEnter = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e as unknown as FormEvent<HTMLFormElement>);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };
  // const url = 'https://savemoney.spotty.com.cn/poems/raft.pdf'
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [, setHighlight] = useAtom(hightlightAtom);
  if (!isMounted) {
    return null;
  }
  const updateHash = (highlight: IHighlight) => {
    document.location.hash = `highlight-${highlight.id}`;
  };
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  type HightlightDocument = Document<Record<string, any>> & {
    highlight: Array<{
      chunk_id: string;
      content: string;
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      origin_info: Record<string, any>;
      pageNumber: number;
      rect_info: {
        x1: number;
        x2: number;
        y1: number;
        y2: number;
        height: number;
        width: number;
      }
    }>
  }
  const clickSourceDocument = (doc: HightlightDocument) => {
    const mappedHighlight = doc.highlight.map(h => {
      const r = {
        x1: h.rect_info.x1,
        y1: h.rect_info.y1,
        x2: h.rect_info.x2,
        y2: h.rect_info.y2,
        width: h.rect_info.width,
        height: h.rect_info.height,
        pageNumber: h.pageNumber,
      }
      return {
        id: MD5(h.content).toString(),
        content: {
          text: h.content,
        },
        position: {
          boundingRect: r,
          rects: [r],
          pageNumber: h.pageNumber,
        }
      }
    })
    console.log('mappedHighlight', mappedHighlight)
    setHighlight(mappedHighlight)
    updateHash(mappedHighlight[0])
  }
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: location.origin + "/auth/callback?next=" + pathname,
      }
    });
  }
  return (
    <>
      <Layout>
        <div onClick={handleLogin}>login</div>
        <div className="w-full mx-auto flex flex-col gap-4">

          <div className="grid grid-cols-8 gap-2 ">
            <div className='col-span-4 '>
              <PdfComponent />
            </div>
            <div className='col-span-4 overflow-hidden'>
              <h1 className="text-2xl font-bold leading-[1.1] text-center">
                Chat With Your Docs
              </h1>
              <main className={cn(styles.main, 'py-10 px-8')}>
                <div className={cn(styles.cloud, 'w-full')}>
                  <div ref={messageListRef} className={styles.messagelist}>
                    {messages.map((message, index) => {
                      let icon;
                      let className;
                      if (message.type === 'apiMessage') {
                        icon = (
                          <Image
                            key={index}
                            src="/bot-image.png"
                            alt="AI"
                            width="40"
                            height="40"
                            className={styles.boticon}
                            priority
                          />
                        );
                        className = styles.apimessage;
                      } else {
                        icon = (
                          <Image
                            key={index}
                            src="/usericon.png"
                            alt="Me"
                            width="30"
                            height="30"
                            className={styles.usericon}
                            priority
                          />
                        );
                        // The latest message sent by the user will be animated while waiting for a response
                        className =
                          loading && index === messages.length - 1
                            ? styles.usermessagewaiting
                            : styles.usermessage;
                      }
                      return (
                        <div key={`pdfmessag-${index}`}>
                          <div key={`chatMessage-${index}`} className={className}>
                            {icon}
                            <div className={styles.markdownanswer}>
                              <ReactMarkdown linkTarget="_blank">
                                {message.message}
                              </ReactMarkdown>
                            </div>
                          </div>
                          {message.sourceDocs && (
                            <div
                              className="p-5"
                              key={`sourceDocsAccordion-${index}`}
                            >
                              <Accordion
                                type="single"
                                collapsible
                                className="flex-col"
                              >
                                {message.sourceDocs.map((doc, index) => (
                                  <div key={`messageSourceDocs-${index}`}>
                                    <AccordionItem value={`item-${index}`}>
                                      <AccordionTrigger>
                                        <h3>Source {index + 1}</h3>
                                      </AccordionTrigger>
                                      <AccordionContent className='cursor-pointer' onClick={() => {
                                        clickSourceDocument(doc as HightlightDocument)
                                      }}>
                                        <ReactMarkdown linkTarget="_blank">
                                          {doc.pageContent}
                                        </ReactMarkdown>
                                        <p className="mt-2">
                                          <b>Source:</b> {doc.metadata.source}
                                        </p>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </div>
                                ))}
                              </Accordion>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={cn(styles.center, 'w-full')}>
                  <div className={cn(styles.cloudform, 'w-full')}>
                    <form onSubmit={handleSubmit}>
                      <textarea
                        disabled={loading}
                        onKeyDown={handleEnter}
                        ref={textAreaRef}
                        autoFocus={false}
                        rows={1}
                        maxLength={512}
                        id="userInput"
                        name="userInput"
                        placeholder={
                          loading
                            ? 'Waiting for response...'
                            : 'What is this legal case about?'
                        }
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className={cn(styles.textarea, 'w-full')}
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className={styles.generatebutton}
                      >
                        {loading ? (
                          <div className={styles.loadingwheel}>
                            <LoadingDots color="#000" />
                          </div>
                        ) : (
                          // Send icon SVG in input field
                          <svg
                            viewBox="0 0 20 20"
                            className={styles.svgicon}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                          </svg>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
                {error && (
                  <div className="border border-red-400 rounded-md p-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
        <footer className="m-auto p-4">
          <a href="https://twitter.com/mayowaoshin">
            Powered by LangChainAI. Demo built by Mayo (Twitter: @mayowaoshin).
          </a>
        </footer>
      </Layout>
    </>
  );
}
