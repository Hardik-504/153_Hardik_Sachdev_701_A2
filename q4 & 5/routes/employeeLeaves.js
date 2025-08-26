const express = require("express");
const { body, validationResult } = require("express-validator");
const authEmployee = require("../middleware/employeeJwt");
const Leave = require("../models/Leave");

const router = express.Router();

// List my leaves
router.get("/", authEmployee, async (req, res) => {
  const leaves = await Leave.find({ employee: req.emp._id })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ leaves });
});

// Add leave (employee can optionally pick grant, default Pending)
router.post(
  "/",
  authEmployee,
  [
    body("date").notEmpty().withMessage("Date required"),
    body("reason").trim().notEmpty().withMessage("Reason required"),
    body("grant").optional().isIn(["Pending", "Yes", "No"])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ error: errors.array()[0].msg });

    const { date, reason, grant } = req.body;

    const leave = await Leave.create({
      employee: req.emp._id,
      date: new Date(date),
      reason,
      grant: grant || "Pending"
    });

    res.status(201).json({ leave });
  }
);

module.exports = router;
