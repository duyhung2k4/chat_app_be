import jwt from "jsonwebtoken";
import fs from "fs";

class JwtUtils {
    private privateKey: Buffer

    constructor() {
        this.privateKey = fs.readFileSync("src/keys/private.key");
    }

    CreateToken(payload: Record<string, any>, type: "access_token" | "refresh_token"): string {
        const token: string = jwt.sign(payload, this.privateKey, {
            expiresIn: 60 * (type === "access_token" ? 1 : 3),
            algorithm: "RS256",
        });

        return token;
    }

    async VerifyToken(token: string): Promise<Record<string, any> | Error> {
        try {
            const data = jwt.verify(token, this.privateKey) as Record<string, any>;
            return data;
        } catch (error) {
            return error;
        }
    }
}

export default JwtUtils;