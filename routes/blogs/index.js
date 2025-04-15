import express from "express";
import { verifyToken } from "../../middlewares/verifyToken.middleware.js";
import ProtectedRouter from "./protectedRoute.js";
import publicRouter from "./publicRoute.js";

const router = express.Router();

router.use("/", publicRouter);

router.use("/", verifyToken, ProtectedRouter);

export default router;
