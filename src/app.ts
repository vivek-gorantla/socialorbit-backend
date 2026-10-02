import express from "express";
import { httpLogger } from "../middleware/httpLogger";
import router from "../routes";

const app = express();

app.use(express.json());
app.use(httpLogger);

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        service: "social-orbit-api"
    });
});

app.use("/api/v1", router)
export default app;