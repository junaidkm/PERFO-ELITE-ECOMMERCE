const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  sizes: [
    {
      size: { type: String, required: true },
      price: { type: Number, required: true },
      stock: { type: String, default: "In Stock" }
    }
  ],
  description: { type: String },
  topNotes: { type: String },
  baseNotes: { type: String },
  importedBy: { type: String },
  origin: { type: String },
  manufacturer: { type: String },
  img: { type: String }
}, { timestamps: true });

productSchema.set("toJSON", {
  virtuals: true,
  transform: function(doc, ret, options) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
module.exports = mongoose.model("Product", productSchema);
