import React, { ReactElement } from "react";
import Layout from "@/components/layout";

const DocsPage = () => {
    return (
        <div>
            <h1>Docs Page</h1>
        </div>
    )
}
DocsPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}


export default DocsPage;