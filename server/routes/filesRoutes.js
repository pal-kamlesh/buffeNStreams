const Router = require("express");

const router = Router();

router.get("/", (req, res) => "Hello World! filesRoutes");
router.post("/:fileId");
module.exports = router;
