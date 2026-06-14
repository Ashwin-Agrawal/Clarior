const express = require("express");
const router = express.Router();

const {
  getAllColleges,
  getCollegeById
} = require("../controllers/college.controller");

// 🌍 PUBLIC — all colleges list (search/filters)
router.get("/", getAllColleges);

// 🌍 PUBLIC — single college profile & its seniors list
router.get("/:id", getCollegeById);

module.exports = router;
