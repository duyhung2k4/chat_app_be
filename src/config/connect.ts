import { Client } from "pg";

export const clientPg = new Client({
    user: "postgres",
    password: "123456",
    database: "chat_app",
    port: 5432,
    host: "192.168.31.101",
});

export const connectPg = async () => {
    try {
        await clientPg.connect();
    } catch (error) {
        console.log(error);
    }
}