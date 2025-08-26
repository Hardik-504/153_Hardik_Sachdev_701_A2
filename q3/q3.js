const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis").default; 
const Redis = require("ioredis");
const path = require("path");

const app = express();
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const redisClient = new Redis();

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "hardik",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 10 },
  })
);

function isLoggedIn(req, res, next) {
  if (req.session.user) next();
  else res.redirect("/login");
}


app.get("/login", (req, res) => {
  res.render("login", { error: null });
});

app.post("/login", (req, res) => {
  const { txtusername, txtpassword } = req.body;

  if (txtusername === "hardik" && txtpassword === "hello") {
    req.session.user = { txtusername };
    res.redirect("/profile");
  } else {
    res.render("login", { error: "Invalid credentials" });
  }
});

app.get("/profile", isLoggedIn, (req, res) => {
  res.render("profile", { user: req.session.user });
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.redirect("/login");
  });
});

app.listen(3000, () =>
  console.log("Server running at http://localhost:3000")
);
