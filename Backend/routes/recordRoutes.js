const express = require("express");
const {
  getRecords,
  createRecord,
  updateRecord,
} = require("../controllers/recordController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(getRecords).post(createRecord);
router.route("/:id").put(updateRecord);

module.exports = router;
