const Router = require("express");

const router = Router();

router.get("/", (req, res) => "Hello World! procssRoutes");
router.get("/:filename");
router.post("/csv/:fileId");
module.exports = router;
