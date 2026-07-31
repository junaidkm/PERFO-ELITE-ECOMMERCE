const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    sizes: [
      {
        size: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: String, default: "In Stock" }
      }
    ],
    description: String,
    topNotes: String,
    baseNotes: String,
    importedBy: String,
    origin: String,
    manufacturer: String,
    img: String
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

module.exports = mongoose.model("Product", productSchema);
