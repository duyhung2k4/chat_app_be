import { Router } from "express";
import routerAuth from "./auth";
import routerRoom from "./room";
import AuthMiddleware from "../middlewares/auth";

const router = Router();
const authMiddleware = new AuthMiddleware();

router.use("/api/v1/public/auth", routerAuth);
router.use("/api/v1/public/room", authMiddleware.VerifyToken, routerRoom);

export default router;