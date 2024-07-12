import { Request, Response } from "express"; 

class RoomController {
    GetData(req: Request, res: Response) {
        res.json({
            mess: "done",
        })
    }
}

export default RoomController;