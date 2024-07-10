import { Client } from "pg";
import { clientPg } from "../config/connect";
import { UserModel } from "../models/user";

class AuthService {
    private clientPg: Client

    constructor() {
        this.clientPg = clientPg;

        this.checkUser = this.checkUser.bind(this);
    }

    async checkUser(email: string): Promise<UserModel | Error> {
        try {
            const result = await this.clientPg.query<UserModel>(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );
            return result.rows[0];
        } catch (error) {
            console.log(error); 
        }
    }
}

export default AuthService;