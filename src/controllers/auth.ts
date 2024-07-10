import { Request, Response } from "express";
import { Client } from "pg";
import { clientPg } from "../config/connect";
import AuthService from "../services/auth";

class AuthController {
    private clientPg: Client
    private authService: AuthService

    constructor() {
        this.clientPg = clientPg;
        this.authService = new AuthService();

        this.login = this.login.bind(this);
    }

    async login(req: Request, res: Response) {
        try {            
            const data: { email: string, password: string } = req.body;
            const result = await this.authService.checkUser(data.email);
            res.json(result);
        } catch (error) {            
            res.json(error);
        }
    }
    
    async get(req: Request, res: Response) {
        res.json({
            "mess": "done",
        })
    }
}

export default AuthController;