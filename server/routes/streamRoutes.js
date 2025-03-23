import { Router } from "express";
import { streamVideo } from "../controllers/streamController.js";
const router = Router();

router.get("/", (req, res) => "Hello World! StreamRoutes");
router.get("video/:fileId", streamVideo);

export default router;
