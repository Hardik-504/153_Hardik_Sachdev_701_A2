const express = require("express");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const Employee = require("../models/Employee");

const router = express.Router();

/**
 * POST /api/employee/login
 * body: { login: (email or empId), password }
 */
router.post(
  "/login",
  [
    body("login").trim().notEmpty().withMessage("Email or EmpID required"),
    body("password").notEmpty().withMessage("Password required")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ error: errors.array()[0].msg });

    const { login, password } = req.body;

    // allow either email or empId
    const employee = await Employee.findOne({
      $or: [{ email: login }, { empId: login }]
    });

    if (!employee) return res.status(401).json({ error: "User not found" });

    const ok = await employee.verifyPassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const payload = {
      _id: employee._id.toString(),
      empId: employee.empId,
      email: employee.email,
      name: employee.name
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: `${process.env.TOKEN_TTL_HOURS || 8}h`
    });

    res.json({ token, employee: payload });
  }
);

/**
 * GET /api/employee/me (profile)
 * header: Authorization: Bearer <token>
 */
router.get("/me", require("../middleware/employeeJwt"), async (req, res) => {
  const emp = await Employee.findById(req.emp._id).lean();
  if (!emp) return res.status(404).json({ error: "Not found" });

  // compute net salary (same as your EJS)
  const net = (emp.basic || 0) + (emp.hra || 0) + (emp.da || 0) - (emp.pf || 0);

  res.json({
    _id: emp._id,
    empId: emp.empId,
    name: emp.name,
    email: emp.email,
    basic: emp.basic || 0,
    hra: emp.hra || 0,
    da: emp.da || 0,
    pf: emp.pf || 0,
    netSalary: Number(net.toFixed(2))
  });
});

module.exports = router;


