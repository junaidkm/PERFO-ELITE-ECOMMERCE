const mongoose = require("mongoose");
const crypto = require("crypto");

const cartItemSchema = new mongoose.Schema({
  _id: { type: String, default: () => crypto.randomUUID() },
  productId: { type: String, required: true },
  name: { type: String },
  img: { type: String },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, default: 1, min: 1 }
});

cartItemSchema.virtual("id").get(function () {
  return this._id;
});

cartItemSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

const cartSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

cartSchema.virtual("id").get(function () {
  return this._id;
});

cartSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Cart", cartSchema);
