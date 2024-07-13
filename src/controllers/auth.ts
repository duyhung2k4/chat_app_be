import AuthService from "../services/auth";
import JwtUtils from "../utils/jwt";
import { EventEmitter } from "node:events";
import { Request, Response } from "express";
import testEvent from "../events/test";
import { RegisterRequest } from "../dto/request/auth";

class AuthController {
    private authService: AuthService
    private jwtUtils: JwtUtils
    private testEvent: EventEmitter

    constructor() {
        this.authService = new AuthService();
        this.jwtUtils = new JwtUtils();
        this.testEvent = testEvent.GetEvent();

        this.Register = this.Register.bind(this);
        this.AcceptCode = this.AcceptCode.bind(this);
        this.Login = this.Login.bind(this);
    }

    async Register(req: Request, res: Response) {
        try {
            const data: RegisterRequest = req.body;

            const resultCheckUser = await this.authService.CheckUser(data.email);
            if (resultCheckUser instanceof Error) {
                res.json(resultCheckUser);
                return;
            }
            if (resultCheckUser) {
                res.json({
                    mess: "email exist"
                });
                return;
            }

            const resultSetRedisUserPending = await this.authService.CreatePendingUser(data.email, data.password);

            res.json({
                mess: resultSetRedisUserPending,
            });
        } catch (error) {
            res.json(error);
        }
    }

    async AcceptCode(req: Request, res: Response) {
        try {
            const { email, code }: { email: string, code: string } = req.body;
            const resultAccept = await this.authService.AcceptCode(email, code);
            if (resultAccept instanceof Error) {
                res.json(resultAccept);
                return;
            }

            const resultProfile = await this.authService.CreateProfile(email, resultAccept);
            if (resultProfile instanceof Error) {
                res.json(resultProfile);
                return;
            }

            res.json({
                mess: resultProfile,
            });
        } catch (error) {
            res.json(error);
        }
    }

    async Login(req: Request, res: Response) {
        try {
            const infoLogin: { email: string, password: string } = req.body;
            const result = await this.authService.CheckUserLogin(infoLogin);

            if(result instanceof Error) {
                res.json(result);
                return;
            }

            const access_token = this.jwtUtils.CreateToken({
                profile_id: result.id,
                role_id: result?.user?.role.id,
                email: result.email
            }, "access_token");

            const refresh_token = this.jwtUtils.CreateToken({
                profile_id: result.id,
                role_id: result?.user?.role.id,
                email: result.email
            }, "refresh_token");

            this.testEvent.emit("test_1", result);

            res.json({
                access_token,
                refresh_token,
                result,
            });
        } catch (error) {
            res.json(error);
        }
    }
}

export default AuthController;