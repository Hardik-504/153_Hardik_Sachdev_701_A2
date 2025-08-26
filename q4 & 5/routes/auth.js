const express = require("express");
const { body, validationResult } = require("express-validator");
const Admin = require("../models/Admin");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("login", { error: null });
});

router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username required"),
    body("password").notEmpty().withMessage("Password required")
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).render("login", { error: errors.array()[0].msg });
    }

    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin || !(await admin.verifyPassword(password))) {
      return res.status(401).render("login", { error: "Invalid credentials" });
    }

    req.session.admin = { id: admin._id, username: admin.username };
    res.redirect("/employees");
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

module.exports = router;