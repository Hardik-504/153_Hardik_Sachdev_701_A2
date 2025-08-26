const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true }
});

adminSchema.methods.verifyPassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

adminSchema.statics.createDefaultAdmin = async function () {
  const hash = await bcrypt.hash("admin123", 10);
  return this.create({ username: "admin", passwordHash: hash });
};

module.exports = mongoose.model("Admin", adminSchema);