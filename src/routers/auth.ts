
import { Router } from "express";
import AuthController from "../controllers/auth";

const routerAuth = Router();
const controller = new AuthController();


routerAuth.get("/test", controller.get);
routerAuth.post("/login", controller.login);

export default routerAuth;