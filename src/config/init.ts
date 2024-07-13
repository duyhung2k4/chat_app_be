import testEvent from "../events/test";
import { serverSocket } from "../ws";
import { connectPg, connectRedis } from "./connect"

export const init = async () => {
    await connectPg();
    await connectRedis();

    testEvent.Init();
    serverSocket.Init();
}