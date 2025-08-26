const express = require("express");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
const Employee = require("../models/Employee");
const { sendWelcomeEmail } = require("../utils/mailer");

const router = express.Router();

// auth guard
function isAuthed(req, res, next) {
  if (req.session.admin) return next();
  res.redirect("/login");
}

router.use(isAuthed);

// helpers
function genEmpId() {
  // e.g., EMP-837264 (6 digits random)
  const n = Math.floor(100000 + Math.random() * 900000);
  return `EMP-${n}`;
}

function genTempPassword(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

// List employees
router.get("/", async (req, res) => {
  const employees = await Employee.find().sort({ empId: 1 });
  res.render("employees/index", { employees });
});

// New form
router.get("/new", (req, res) => {
  res.render("employees/new", { error: null, old: {} });
});

// Create employee
router.post(
  "/",
  [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("basic").toFloat(),
    body("hra").toFloat(),
    body("da").toFloat(),
    body("pf").toFloat()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("employees/new", { error: errors.array()[0].msg, old: req.body });
    }

    try {
      // generate unique empId
      let empId;
      while (true) {
        empId = genEmpId();
        const exists = await Employee.exists({ empId });
        if (!exists) break;
      }

      const tempPassword = genTempPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      const employee = await Employee.create({
        empId,
        name: req.body.name,
        email: req.body.email,
        passwordHash,
        basic: req.body.basic || 0,
        hra: req.body.hra || 0,
        da: req.body.da || 0,
        pf: req.body.pf || 0
      });

      // Send welcome email (logs preview URL)
      await sendWelcomeEmail({
        to: employee.email,
        name: employee.name,
        empId: employee.empId,
        tempPassword
      });

      res.redirect("/employees");
    } catch (err) {
      console.error(err);
      let msg = "Something went wrong";
      if (err.code === 11000) msg = "Email or EmpID already exists";
      res.status(400).render("employees/new", { error: msg, old: req.body });
    }
  }
);

// Edit form
router.get("/:id/edit", async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) return res.redirect("/employees");
  res.render("employees/edit", { employee, error: null });
});

// Update
// Update
router.put(
  "/:id",
  [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("basic").toFloat(),
    body("hra").toFloat(),
    body("da").toFloat(),
    body("pf").toFloat()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const employee = await Employee.findById(req.params.id);
      return res
        .status(422)
        .render("employees/edit", { employee, error: errors.array()[0].msg });
    }

    try {
      await Employee.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        email: req.body.email,
        basic: req.body.basic || 0,
        hra: req.body.hra || 0,
        da: req.body.da || 0,
        pf: req.body.pf || 0
      });

      res.redirect("/employees");
    } catch (err) {
      console.error(err);
      const employee = await Employee.findById(req.params.id);
      res
        .status(400)
        .render("employees/edit", { employee, error: "Update failed" });
    }
  }
);

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.redirect("/employees");
  } catch (err) {
    console.error(err);
    res.status(500).send("Delete failed");
  }
});

module.exports = router;
