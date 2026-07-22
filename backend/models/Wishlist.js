const mongoose = require("mongoose");
const crypto = require("crypto");

const wishlistItemSchema = new mongoose.Schema({
  _id: { type: String, default: () => crypto.randomUUID() },
  productId: { type: String, required: true },
  name: { type: String },
  img: { type: String },
  price: { type: Number }
});

wishlistItemSchema.virtual("id").get(function () {
  return this._id;
});

wishlistItemSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    items: [wishlistItemSchema]
  },
  { timestamps: true }
);

wishlistSchema.virtual("id").get(function () {
  return this._id;
});

wishlistSchema.set("toJSON", {
  virtuals: true,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
