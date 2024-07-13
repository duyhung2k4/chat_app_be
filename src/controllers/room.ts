import { Request, Response } from "express"; 

class RoomController {
    GetData(req: Request, res: Response) {
        res.status(200).json({
            mess: "done",
        })
    }
}

export default RoomController;