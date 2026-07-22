const mongoose = require("mongoose");
const crypto = require("crypto");

const orderItemSchema = new mongoose.Schema({
  _id: { type: String, default: () => crypto.randomUUID() },
  productId: { type: String, required: true },
  name: { type: String },
  img: { type: String },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true }
});

orderItemSchema.virtual("id").get(function () {
  return this._id;
});

orderItemSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

const orderSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    userId: { type: String, ref: "User", required: true },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    },
    status: {
      type: String,
      enum: ["Placed", "Cancelled", "Pending", "Processing", "Delivered"],
      default: "Placed"
    },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    address: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String, required: true },
      addressLine: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true }
  },
  { timestamps: true }
);

orderSchema.virtual("id").get(function () {
  return this._id;
});

orderSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Order", orderSchema);
