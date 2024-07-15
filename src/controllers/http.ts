import { Response } from "express";

export type ResponsData<T> = {
    data: T
    message: string
    error: Error | null
    status: number
}

export class HandleResponse {
    ErrorResponse(res: Response, err: Error) {
        const dataRes: ResponsData<null> = {
            data: null,
            message: err.message,
            error: err,
            status: 502,
        }

        res.status(502).json(dataRes);
    }

    SuccessResponse(res: Response, data: any) {
        const dataRes: ResponsData<any> = {
            data: data,
            message: "OK",
            error: null,
            status: 200,
        }

        res.status(200).json(dataRes);
    }
}