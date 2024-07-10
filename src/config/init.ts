import { connectPg } from "./connect"

export const init = async () => {
    await connectPg();
}