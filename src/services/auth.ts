import AuthUtils from "../utils/auth";

import { Client, QueryConfig } from "pg";
import { clientPg, clientRedis, RedisClient } from "../config/connect";
import { UserModel } from "../models/user";
import { TABLE } from "../constants/query";
import { emailTransporter, EmailTransporter } from "../config/email";
import { ProfileModel } from "../models/profile";
import { COLUMN_TABLE } from "../constants/table";
import { RegisterRequest } from "../dto/request/auth";
import dayjs, { Dayjs } from "dayjs";


class AuthService {
    private clientPg: Client
    private clientRedis: RedisClient
    private clientEmail: EmailTransporter
    private authUtils: AuthUtils

    constructor() {
        this.clientPg = clientPg;
        this.clientRedis = clientRedis;
        this.clientEmail = emailTransporter;
        this.authUtils = new AuthUtils();


        this.CheckUser = this.CheckUser.bind(this);
        this.AcceptCode = this.AcceptCode.bind(this);
        this.CreatePendingUser = this.CreatePendingUser.bind(this);
        this.CreateProfile = this.CreateProfile.bind(this);
        this.CheckUserLogin = this.CheckUserLogin.bind(this);
        this.GetDataCodePending = this.GetDataCodePending.bind(this);

        this.getRole = this.getRole.bind(this);
    }

    async CheckUser(email: string): Promise<UserModel | Error> {
        try {
            const queryConfig: QueryConfig = {
                text: `SELECT * FROM ${TABLE.USER} WHERE email = $1`,
                values: [email]
            }

            const result = await this.clientPg.query<UserModel>(queryConfig);

            return result.rows[0];
        } catch (error) {
            return error;
        }
    }

    async CreatePendingUser(payload: RegisterRequest): Promise<any | Error> {
        try {
            const code: string = `${Math.floor(100000 + Math.random() * 900000)}`;

            const data: TypeRedisCreatePendingUser = {
                data: payload,
                code,
                ex: dayjs().add(30, "second"),
            }

            await this.clientRedis.del(`sign_in_${payload.email}`);

            await this.clientRedis.set(
                `sign_in_${payload.email}`,
                JSON.stringify(data),
                {
                    EX: 60,
                    NX: true,
                }
            );

            await this.clientEmail.sendMail({
                from: "D.Hung",
                to: payload.email,
                subject: "Mã xác nhận",
                text: code,
            });

            return null;
        } catch (error) {
            return error;
        }
    }

    async AcceptCode(email: string, code: string): Promise<string | Error> {
        try {
            const jsonStringData = await clientRedis.get(`sign_in_${email}`);
            const data = JSON.parse(jsonStringData) as TypeRedisCreatePendingUser;

            if (!data || data?.code !== code) return null;

            const passwordHash = this.authUtils.HashPassword(data.data.password);
            return passwordHash;
        } catch (error) {
            return error;
        }
    }

    async CreateProfile(email: string, passwordHash: string): Promise<ProfileModel | Error> {
        try {
            const infoUserPendingString = await this.clientRedis.get(`sign_in_${email}`);
            const infoUserPending = JSON.parse(infoUserPendingString) as TypeRedisCreatePendingUser;

            await this.clientPg.query("BEGIN");
            const id = await this.getRole();
            if (id === null) return null;

            const queryConfigUser: QueryConfig = {
                text: `INSERT INTO users (email, password, role_id) values ($1, $2, $3) RETURNING *`,
                values: [email, passwordHash, id]
            };
            const resultUser = await clientPg.query<UserModel>(queryConfigUser);
            const newUser = resultUser.rows[0];

            const queryConfigProfile: QueryConfig = {
                text: `INSERT INTO profiles (first_name, last_name, email, user_id) values ($1, $2, $3, $4) RETURNING *`,
                values: [
                    infoUserPending.data.firstName,
                    infoUserPending.data.lastName,
                    email, 
                    newUser.id
                ],
            }
            const resultProfile = await this.clientPg.query<ProfileModel>(queryConfigProfile);

            await this.clientPg.query("COMMIT");

            this.clientRedis.del(`sign_in_${resultProfile.rows[0].email}`);

            return resultProfile.rows[0];
        } catch (error) {
            await this.clientPg.query("ROLLBACK");
            return error
        }
    }

    async CheckUserLogin(infoLogin: { email: string, password: string }): Promise<ProfileModel | Error> {
        try {
            const columnProfile = COLUMN_TABLE.profiles.map(c => `p.${c} as p__${c}`);
            const columnUser = COLUMN_TABLE.user.map(c => `u.${c} as u__${c}`);
            const columnRole = COLUMN_TABLE.roles.map(c => `r.${c} as r__${c}`);

            const queryConfig: QueryConfig = {
                text: `
                    SELECT
                        ${columnProfile.join(",")},
                        ${columnUser.join(",")},
                        ${columnRole.join(",")}
                    FROM profiles as p
                    JOIN users as u ON u.id = p.user_id
                    JOIN roles as r ON r.id = u.role_id
                    WHERE 
                        u.email = $1 
                        AND p.deleted_at IS NULL
                        AND u.deleted_at IS NULL
                        AND r.deleted_at IS NULL
                `,
                values: [infoLogin.email],
            };

            const result = await this.clientPg.query<Record<string, any>>(queryConfig);

            if (result.rowCount === 0) return null;

            let dataMap: Record<string, any> = {
                user: {
                    role: {},
                },
            };
            const data = result.rows[0];
            Object.keys(data).forEach(key => {
                const field = key.split("__")[1];
                if(!field) return;
                switch (key.split("__")[0]) {
                    case "p":
                        dataMap[field] = data[key];
                        break;
                    case "u":
                        dataMap.user[field] = data[key];
                        break;
                    case "r":
                        dataMap.user.role[field] = data[key];
                        break;
                    default:
                        break;
                }
            });

            const profile = dataMap as ProfileModel;

            const ok = await this.authUtils.ComparePassword(infoLogin.password, profile?.user.password);
            if (!ok) return null;

            delete profile?.user.password;

            return profile;
        } catch (error) {
            return error;
        }
    }

    async GetDataCodePending(email: string): Promise<TypeRedisCreatePendingUser | Error> {
        try {
            const stringData = await this.clientRedis.get(`sign_in_${email}`);
            const infoPending = JSON.parse(stringData) as TypeRedisCreatePendingUser;
            return infoPending;
        } catch (error) {
            return error;
        }
    }

    private async getRole(): Promise<number | null> {
        try {
            const queryConfig: QueryConfig = {
                text: "SELECT id FROM roles WHERE code = $1 AND deleted_at IS NULL",
                values: ["user"]
            }


            const result = await this.clientPg.query<{ id: number }>(queryConfig);
            return result.rows[0].id;
        } catch (error) {
            console.log(error);
            return null
        }
    }
}

export type TypeRedisCreatePendingUser = {
    data: RegisterRequest
    code: string
    ex: Dayjs
}

export default AuthService;