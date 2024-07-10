import { BaseModel } from "./base";

export type UserModel = BaseModel & {
    role_id: number
    email: string
    password: string
}