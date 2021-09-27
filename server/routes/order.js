var express = require("express");
var router = express.Router();
var automator = require("../automator");

const orderQueue = [];
const statusQueue = [];
let currentIndex = -1;
/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send(JSON.stringify({status: automator.getStatus()}));
});

router.post("/", async function (req, res, next) {
  automator.checkout(req.body.products);
  res.send(JSON.stringify({ msg: "Requested!" }));
});

module.exports = router;
