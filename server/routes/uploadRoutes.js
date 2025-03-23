import { Router } from "express";
import { uploadFile } from "../controllers/uploadController.js";

const router = Router();

router.get("/", (req, res) => res.send("Hello World! uploadRoutes"));
router.post("/", uploadFile);

export default router;
