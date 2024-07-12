import { Router } from "express";
import RoomController from "../controllers/room";

const routerRoom = Router();
const roomController = new RoomController();

routerRoom.get("/", roomController.GetData);

export default routerRoom;