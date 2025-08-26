const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    empId: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    basic: { type: Number, default: 0 },
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    pf: { type: Number, default: 0 }
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

employeeSchema.virtual("netSalary").get(function () {
  const b = this.basic || 0;
  const h = this.hra || 0;
  const d = this.da || 0;
  const p = this.pf || 0;
  return b + h + d - p;
});

module.exports = mongoose.model("Employee", employeeSchema);