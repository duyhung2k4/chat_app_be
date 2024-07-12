import { Request, Response } from "express";
import AuthService from "../services/auth";
import JwtUtils from "../utils/jwt";

class AuthController {
    private authService: AuthService
    private jwtUtils: JwtUtils

    constructor() {
        this.authService = new AuthService();
        this.jwtUtils = new JwtUtils();

        this.SignIn = this.SignIn.bind(this);
        this.AcceptCode = this.AcceptCode.bind(this);
        this.Login = this.Login.bind(this);
    }

    async SignIn(req: Request, res: Response) {
        try {
            const data: { email: string, password: string } = req.body;

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