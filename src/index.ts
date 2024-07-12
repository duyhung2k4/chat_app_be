import express from "express";
import router from "./routers";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import morgan from "morgan";
import { init } from "./config/init";

dotenv.config();
init();

const app = express();
const port = process.env.APP_PORT;

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/v1/", router);

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});