import JwtUtils from "../utils/jwt";
import { Request, Response, NextFunction } from "express";

class AuthMiddleware {
    private jwtUtils: JwtUtils;

    constructor() {
        this.jwtUtils = new JwtUtils();

        this.VerifyToken = this.VerifyToken.bind(this);
    }

    async VerifyToken(req: Request, res: Response, next: NextFunction) {
        try {
            const token = req.headers.authorization.split(" ")[1]
            const result = await this.jwtUtils.VerifyToken(token);
            if(result instanceof Error) {
                res.status(401).json(result);
                return;
            }
            next();
        } catch (error) {
            res.status(502).json(error);
        }
    }
}

export default AuthMiddleware;