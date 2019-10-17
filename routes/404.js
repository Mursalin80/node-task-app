const express = require("express");

const router = express.Router();

router.get("*", (req, res) => {
  res.status(404).send("<h1>No Page Found!</h1>");
});

module.exports = router;
