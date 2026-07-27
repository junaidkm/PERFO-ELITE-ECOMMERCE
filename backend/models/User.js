const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    blocked: {
      type: Boolean,
      default: false
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: String
    }
  },
  { timestamps: true }
);
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Mongoose Post Middleware: Cascade delete Wishlist, Cart, and Orders when a User is deleted
userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Promise.all([
      mongoose.model("Cart").deleteMany({ userId: doc._id }),
      mongoose.model("Wishlist").deleteMany({ userId: doc._id }),
      mongoose.model("Order").deleteMany({ userId: doc._id })
    ]);
  }
});


userSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret, options) {
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model("User", userSchema);
