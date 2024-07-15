import AuthService from "../services/auth";
import JwtUtils from "../utils/jwt";
import dayjs from "dayjs";

import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { RegisterRequest } from "../dto/request/auth";
import { HandleResponse } from "./http";

class AuthController {
    private authService: AuthService
    private jwtUtils: JwtUtils
    private handleResponse: HandleResponse

    constructor() {
        this.authService = new AuthService();
        this.jwtUtils = new JwtUtils();
        this.handleResponse = new HandleResponse();

        this.Register = this.Register.bind(this);
        this.AcceptCode = this.AcceptCode.bind(this);
        this.Login = this.Login.bind(this);
        this.GetTimeCodePending = this.GetTimeCodePending.bind(this);
        this.SendRepeatCode = this.SendRepeatCode.bind(this);
    }

    async Register(req: Request, res: Response) {
        try {
            const data: RegisterRequest = req.body;

            const resultCheckUser = await this.authService.CheckUser(data.email);
            if (resultCheckUser instanceof Error) {
                this.handleResponse.ErrorResponse(res, resultCheckUser);
                return;
            }
            if (resultCheckUser) {
                this.handleResponse.ErrorResponse(res, new Error("email exist"));
                return;
            }

            const resultSetRedisUserPending = await this.authService.CreatePendingUser(data);

            this.handleResponse.SuccessResponse(res, resultSetRedisUserPending);
        } catch (error) {
            res.json(error);
        }
    }

    async GetTimeCodePending(req: Request, res: Response) {
        try {
            const { email }: { email: string } = req.query as { email: string };
            const data = await this.authService.GetDataCodePending(email);
            if(data instanceof Error) {
                this.handleResponse.ErrorResponse(res, data);
                return;
            }

            this.handleResponse.SuccessResponse(res, { dataTime: dayjs(data.ex).toDate() });
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    async AcceptCode(req: Request, res: Response) {
        try {
            const { email, code }: { email: string, code: string } = req.body;
            const resultAccept = await this.authService.AcceptCode(email, code);

            if (resultAccept instanceof Error) {
                this.handleResponse.ErrorResponse(res, resultAccept);
                return;
            }

            const resultProfile = await this.authService.CreateProfile(email, resultAccept);
            if (resultProfile instanceof Error) {
                this.handleResponse.ErrorResponse(res, resultProfile);
                return;
            }

            this.handleResponse.SuccessResponse(res, resultProfile);
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    async Login(req: Request, res: Response) {
        try {
            const infoLogin: { email: string, password: string } = req.body;
            const result = await this.authService.CheckUserLogin(infoLogin);

            if(result instanceof Error) {
                this.handleResponse.ErrorResponse(res, result);
                return;
            }

            const access_token = this.jwtUtils.CreateToken({
                profile_id: result.id,
                role_id: result?.user?.role.id,
                email: result.email,
                uuid: uuidv4().toString(),
            }, "access_token");

            const refresh_token = this.jwtUtils.CreateToken({
                profile_id: result.id,
                role_id: result?.user?.role.id,
                email: result.email,
                uuid: uuidv4().toString(),
            }, "refresh_token");

            this.handleResponse.SuccessResponse(res, {
                access_token,
                refresh_token,
                result,
            });
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }

    async SendRepeatCode(req: Request, res: Response) {
        try {
            const { email }: { email: string } = req.body as { email: string };
            const dataPending = await this.authService.GetDataCodePending(email);

            if(dataPending instanceof Error) {
                this.handleResponse.ErrorResponse(res, dataPending);
                return;
            }


            const createUserPending = await this.authService.CreatePendingUser(dataPending.data);
            if(createUserPending instanceof Error) {
                this.handleResponse.ErrorResponse(res, createUserPending);
                return;
            }

            this.handleResponse.SuccessResponse(res, null);
        } catch (error) {
            this.handleResponse.ErrorResponse(res, error);
        }
    }
}

export default AuthController;