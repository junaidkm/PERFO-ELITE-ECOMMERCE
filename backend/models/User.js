const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    blocked: { type: Boolean, default: false },
    isOnline: { type: Boolean, default: false },
    lastLogin: String
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      }
    }
  }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Cascade delete Wishlist, Cart, and Orders when a User is deleted
userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Promise.all([
      mongoose.model("Cart").deleteMany({ userId: doc._id }),
      mongoose.model("Wishlist").deleteMany({ userId: doc._id }),
      mongoose.model("Order").deleteMany({ userId: doc._id })
    ]);
  }
});

module.exports = mongoose.model("User", userSchema);
