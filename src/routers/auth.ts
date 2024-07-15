
import { Router } from "express";
import AuthController from "../controllers/auth";

const routerAuth = Router();
const controller = new AuthController();

routerAuth.get("/time-code-pending", controller.GetTimeCodePending);

routerAuth.post("/accept-code", controller.AcceptCode);
routerAuth.post("/register", controller.Register);
routerAuth.post("/login", controller.Login);
routerAuth.post("/repeat-code", controller.SendRepeatCode);

export default routerAuth;