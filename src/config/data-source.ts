import { Role } from "@/entities/role";
import { DataSource } from "typeorm";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "123456",
    database: "chat_app",
    synchronize: true,
    logging: true,
    entities: [Role],
    subscribers: [],
    migrations: [],
});

export const connect = () => {
    AppDataSource.initialize()
        .then(() => {})
        .catch((err) => console.log(err))
}