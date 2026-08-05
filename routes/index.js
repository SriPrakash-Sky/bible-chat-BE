import { Router } from "express";
import chatRouter from "./chatRoutes.js";
const router = Router();

router.use("/chat", chatRouter);

export default router;
