import express from "express";
import router from "./routers";
import bodyParser from "body-parser";
import { init } from "./config/init";

init();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/", router);

app.listen(port, () => {
    return console.log(`Express is listening at http://localhost:${port}`);
});