import React, { Component } from "react";

import dynamic from 'next/dynamic'
const PdfLoader = dynamic(() => import('../react-pdf-highlighter/components/PdfLoader'), {
    ssr: false
})
const PdfHighlighter = dynamic(() => import('../react-pdf-highlighter/components/PdfHighlighter'), {
    ssr: false
})
// const Tip = dynamic(() => import('../react-pdf-highlighter/components/Tip'), {
//     ssr: false
// })
const Highlight = dynamic(() => import('../react-pdf-highlighter/components/Highlight'), {
    ssr: false
})
const AreaHighlight = dynamic(() => import('../react-pdf-highlighter/components/AreaHighlight'), {
    ssr: false
})
const Popup = dynamic(() => import('../react-pdf-highlighter/components/Popup'), {
    ssr: false
})

import type { IHighlight, NewHighlight } from "../react-pdf-highlighter";
import { Spinner } from "@/components/ui/spinner";
import { useAtomValue } from 'jotai';
import { hightlightAtom } from './store'

interface State {
    url: string;
    highlights: Array<IHighlight>;
    isMounted: boolean;
}

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
    document.location.hash.slice("#highlight-".length);

const resetHash = () => {
    document.location.hash = "";
};

const HighlightPopup = ({
    comment,
}: {
    comment?: { text: string; emoji: string };
}) =>
    (comment && comment.text) ? (
        <div className="Highlight__popup">
            {comment.emoji} {comment.text}
        </div>
    ) : null;

const PRIMARY_PDF_URL = "https://savemoney.spotty.com.cn/poems/raft.pdf";
const SECONDARY_PDF_URL = "https://arxiv.org/pdf/1604.02480.pdf";

const initialUrl = PRIMARY_PDF_URL;
// const mockHighlights = [
//     {
//         "id": "111",
//         "content": {
//             "text": "In Search of an Understandable Consensus Algorithm"
//         },
//         "position": {
//             "boundingRect": {
//                 "x1": 111.23999786376953,
//                 "y1": 74.5650405883789,
//                 "x2": 508.1391906738281,
//                 "y2": 113.62065124511719,
//                 "width": 612,
//                 "height": 792,
//                 "pageNumber": 1
//             },
//             "rects": [
//                 {
//                     "x1": 111.23999786376953,
//                     "y1": 74.5650405883789,
//                     "x2": 508.1391906738281,
//                     "y2": 113.62065124511719,
//                     "width": 612,
//                     "height": 792,
//                     "pageNumber": 1
//                 }
//             ],
//             pageNumber: 1,
//         },
//     }
// ]
class App extends Component<{ highlights: IHighlight[] }, State> {
    state = {
        url: initialUrl,
        highlights: [] as IHighlight[],
        isMounted: false
    };

    resetHighlights = () => {
        this.setState({
            highlights: [],
        });
    };

    toggleDocument = () => {
        const newUrl =
            this.state.url === PRIMARY_PDF_URL ? SECONDARY_PDF_URL : PRIMARY_PDF_URL;

        this.setState({
            url: newUrl,
            highlights: [],
        });
    };

    scrollViewerTo = (highlight: IHighlight) => { };

    scrollToHighlightFromHash = () => {
        const highlight = this.getHighlightById(parseIdFromHash());
        // debugger
        if (highlight) {
            this.scrollViewerTo(highlight);
        }
    };

    componentDidMount() {
        this.setState({
            ...this.state,
            isMounted: true,
        })
        // pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
        // "https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js",
        // getDocument(initialUrl).promise.then((pdfDocument: any) => {
        //     console.log('xxx', pdfDocument)
        // })
        window.addEventListener(
            "hashchange",
            this.scrollToHighlightFromHash,
            false
        );
    }

    getHighlightById(id: string) {
        // const { highlights } = this.state;
        const { highlights } = this.props;

        return highlights.find((highlight) => highlight.id === id);
    }

    addHighlight(highlight: NewHighlight) {
        // const { highlights } = this.state;
        const { highlights } = this.props;

        console.log("Saving highlight", highlight);

        this.setState({
            highlights: [{ ...highlight, id: getNextId() }, ...highlights],
        });
    }

    updateHighlight(highlightId: string, position: object, content: object) {
        console.log("Updating highlight", highlightId, position, content);

        this.setState({
            highlights: this.state.highlights.map((h) => {
                const {
                    id,
                    position: originalPosition,
                    content: originalContent,
                    ...rest
                } = h;
                return id === highlightId
                    ? {
                        id,
                        position: { ...originalPosition, ...position },
                        content: { ...originalContent, ...content },
                        ...rest,
                    }
                    : h;
            }),
        });
    }

    render() {
        const { url } = this.state;
        const { highlights } = this.props;
        // workerSrc={`//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`}
        return (
            <div
                style={{
                    height: "100vh",
                    // width: "75vw",
                    position: "relative",
                }}
            >
                <PdfLoader url={url} beforeLoad={<Spinner />} >
                    {(pdfDocument) => {

                        return (
                            <PdfHighlighter
                                pdfDocument={pdfDocument}
                                enableAreaSelection={(event) => event.altKey}
                                onScrollChange={resetHash}
                                // pdfScaleValue="page-width"
                                scrollRef={(scrollTo) => {
                                    this.scrollViewerTo = scrollTo;

                                    this.scrollToHighlightFromHash();
                                }}
                                onSelectionFinished={(
                                    position,
                                    content,
                                    hideTipAndSelection,
                                    transformSelection
                                ) => {
                                    // console.log('content', content, 'position', position)
                                    console.log(position)
                                    return (null)
                                }}
                                highlightTransform={(
                                    highlight,
                                    index,
                                    setTip,
                                    hideTip,
                                    viewportToScaled,
                                    screenshot,
                                    isScrolledTo
                                ) => {
                                    const isTextHighlight = !Boolean(
                                        highlight.content && highlight.content.image
                                    );

                                    const component = isTextHighlight ? (
                                        <Highlight
                                            isScrolledTo={isScrolledTo}
                                            position={highlight.position}
                                            comment={highlight.comment}
                                        />
                                    ) : (
                                        <AreaHighlight
                                            isScrolledTo={isScrolledTo}
                                            highlight={highlight}
                                            onChange={(boundingRect) => {
                                                this.updateHighlight(
                                                    highlight.id,
                                                    { boundingRect: viewportToScaled(boundingRect) },
                                                    { image: screenshot(boundingRect) }
                                                );
                                            }}
                                        />
                                    );

                                    return (
                                        <Popup
                                            popupContent={<HighlightPopup {...highlight} />}
                                            onMouseOver={(popupContent) =>
                                                setTip(highlight, (highlight) => popupContent)
                                            }
                                            onMouseOut={hideTip}
                                            key={index}
                                        >
                                            {component}
                                        </Popup>
                                    );
                                }}
                                highlights={highlights}
                            />
                        )
                    }}
                </PdfLoader>
            </div>
        );
    }
}

const AppWrapper = () => {
    const highlights = useAtomValue(hightlightAtom)
    return <App highlights={highlights} />
}
export default AppWrapper;
