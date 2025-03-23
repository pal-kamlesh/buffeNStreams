import { Router } from "express";
import { streamVideo } from "../controllers/streamController.js";
const router = Router();

router.get("/video/:fileId", streamVideo);

export default router;
