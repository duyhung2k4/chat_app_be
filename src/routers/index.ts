import { Router } from "express";
import routerAuth from "./auth";
import routerRoom from "./room";
import AuthMiddleware from "../middlewares/auth";

const router = Router();
const authMiddleware = new AuthMiddleware();

router.use("/auth", routerAuth);
router.use("/room", authMiddleware.VerifyToken, routerRoom);

export default router;