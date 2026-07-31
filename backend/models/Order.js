const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name: String,
  img: String,
  price: { type: Number, required: true },
  size: { type: String, required: true },
  quantity: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    },
    status: {
      type: String,
      enum: ["Placed", "Cancelled", "Pending", "Processing", "Shipped", "Delivered"],
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
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

module.exports = mongoose.model("Order", orderSchema);
