const site_url = process.env.NEXT_PUBLIC_APP_URL;

export const siteConfig = {
    name: "DocSolver",
    description:
        "Use the new GPT-4 api to build a chatGPT chatbot for multiple Large PDF files.",
    url: site_url,
    ogImage: `${site_url}/og.jpg`,
    links: {
        twitter: "",
        github: "https://github.com/ai-hermes/doc-solver",
    },
    mailSupport: "hehuan07@gmail.com"
}
