import testEvent from "../events/test";
import { connectPg, connectRedis } from "./connect"

export const init = async () => {
    await connectPg();
    await connectRedis();

    testEvent.Init();
}