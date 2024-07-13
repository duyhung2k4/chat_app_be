
import { Router } from "express";
import AuthController from "../controllers/auth";

const routerAuth = Router();
const controller = new AuthController();

routerAuth.post("/accept-code", controller.AcceptCode);
routerAuth.post("/register", controller.Register);
routerAuth.post("/login", controller.Login);

export default routerAuth;