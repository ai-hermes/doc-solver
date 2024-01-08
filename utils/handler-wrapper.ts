import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export const handlerWrapper = (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
    if (!req.method) {
        res.status(500).json({
            message: 'Unsupported method'
        });
        return;
    }
    try {
        const result = await handler(req, res);
        res.status(200).json(result);
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: 'error: ' + e
        });
    }
};
