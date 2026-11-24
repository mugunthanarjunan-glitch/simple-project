const express = require("express");
const router = express.Router();
const { searchBuses } = require("../controllers/busController");

// GET /api/buses/search?from=Erode&to=Chennai&date=YYYY-MM-DD
router.get("/search", searchBuses);

module.exports = router;

