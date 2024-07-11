import { connectPg, connectRedis } from "./connect"

export const init = async () => {
    await connectPg();
    await connectRedis();
}