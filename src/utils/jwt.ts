import jwt from "jsonwebtoken";
import fs from "fs";

class JwtUtils {
    private privateKey: Buffer

    constructor() {
        this.privateKey = fs.readFileSync("src/keys/private.key");
    }

    CreateToken(payload: TokenInfoPayload, type: TokenType): string {
        const token: string = jwt.sign(payload, this.privateKey, {
            expiresIn: 60 * (type === "access_token" ? 1 : 3),
            algorithm: "RS256",
        });

        return token;
    }

    async VerifyToken(token: string): Promise<TokenInfoResult | Error> {
        try {
            const data = jwt.verify(token, this.privateKey) as Record<string, any>;
            return data as TokenInfoResult;
        } catch (error) {
            return error;
        }
    }
}

export type TokenType = "access_token" | "refresh_token";

export type TokenInfoPayload = {
    profile_id: number
    role_id: number
    email: string
    uuid: string
}

export type TokenInfoResult = TokenInfoPayload & {
    iat: number
    exp: number
}

export default JwtUtils;