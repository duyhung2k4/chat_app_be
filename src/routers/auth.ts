import { Router } from "express";

const routerAuth = Router();

routerAuth.get("/", (req, res) => {
    res.json({
        accessToken: "abcdef"
    })
})

routerAuth.post("/login", (req, res) => {
    console.log(req.body);
    res.json({
        "mess": "done",
    })
})

export default routerAuth;