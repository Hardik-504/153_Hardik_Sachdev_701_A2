// require("dotenv").config();
// const express = require("express");
// const path = require("path");
// const mongoose = require("mongoose");
// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const methodOverride = require("method-override");

// const Admin = require("./models/Admin");
// const authRoutes = require("./routes/auth");
// const employeeRoutes = require("./routes/employees");

// const app = express();

// // --- DB ---
// const MONGO_URI = process.env.MONGO_URI; // ✅ use one name consistently
// mongoose
//   .connect(MONGO_URI)
//   .then(() => console.log("✅ MongoDB connected"))
//   .catch((err) => console.error("MongoDB error:", err));

// // --- View & Static ---
// app.set("view engine", "ejs");
// app.set("views", path.join(__dirname, "views"));
// app.use(express.static(path.join(__dirname, "public")));

// // --- Middlewares ---
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride("_method"));

// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "dev",
//     resave: false,
//     saveUninitialized: false,
//     store: MongoStore.create({
//       mongoUrl: MONGO_URI, // ✅ match with DB connection
//       collectionName: "sessions",
//     }),
//     cookie: { maxAge: 1000 * 60 * 30 }, // 30 minutes
//   })
// );

// // make user available to views
// app.use((req, res, next) => {
//   res.locals.currentUser = req.session.admin || null;
//   next();
// });

// // --- Seed default admin if none ---
// async function seedAdmin() {
//   const count = await Admin.countDocuments();
//   if (count === 0) {
//     await Admin.createDefaultAdmin(); // admin / admin123
//     console.log("🌱 Seeded default admin: username=admin, password=admin123");
//   }
// }
// seedAdmin().catch(console.error);

// // --- Routes ---
// app.use("/", authRoutes); // /login, /logout
// app.use("/employees", employeeRoutes); // protected CRUD

// app.get("/", (req, res) => res.redirect("/employees"));

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`🚀 Server http://localhost:${PORT}`));




require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const cors = require("cors"); // ✅ allow frontend requests

const Admin = require("./models/Admin");
const authRoutes = require("./routes/auth"); // Admin login
const employeeRoutes = require("./routes/employees"); // Admin-protected employee CRUD
const employeeAuthApi = require("./routes/employeeAuth"); // JWT auth for employees
const employeeLeavesApi = require("./routes/employeeLeaves"); // Leave API for employees

const app = express();

// --- DB ---
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// --- View & Static ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// --- Middlewares ---
app.use(express.json()); // ✅ for JWT APIs (JSON requests)
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cors()); // ✅ allow JAMstack frontend (HTML/CSS/JS)

// --- Admin Session (for Q4 part only) ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      collectionName: "sessions",
    }),
    cookie: { maxAge: 1000 * 60 * 30 }, // 30 min
  })
);

// Make admin user available in views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.admin || null;
  next();
});

// --- Seed default admin if none ---
async function seedAdmin() {
  const count = await Admin.countDocuments();
  if (count === 0) {
    await Admin.createDefaultAdmin(); // admin / admin123
    console.log("🌱 Seeded default admin: username=admin, password=admin123");
  }
}
seedAdmin().catch(console.error);

// --- Routes ---
app.use("/", authRoutes);              // Admin login/logout
app.use("/employees", employeeRoutes); // Admin-protected CRUD
app.use("/api/employee/auth", employeeAuthApi); // ✅ JWT login/register
app.use("/api/employee/leaves", employeeLeavesApi); // ✅ JWT protected leave APIs

// --- Default route ---
app.get("/", (req, res) => res.redirect("/employees"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
