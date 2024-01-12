// import { NextResponse } from "next/server";
import { handlerWrapper } from "../../utils/handler-wrapper";
// import { NextApiRequest } from "next";
// import { cookies } from "next/headers";

export default handlerWrapper(async (request) => {

    // export async function handler(req, res) {
    // const cook = cookies();
    // console.log(cook, 123)
    return {
        data: 'xxx'
    }
})
