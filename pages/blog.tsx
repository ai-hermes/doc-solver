import Layout from "@/components/layout";
import React, { ReactElement } from "react";
const BlogPage = () => {
    return (
        <div>
            <h1>Blog Page</h1>
        </div>
    )
}
BlogPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <Layout>
            {page}
        </Layout>
    )
}

export default BlogPage;