const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    product_id: {
      type: String,
      required: true,
    },
    user_id: {
      type: String,
      required: true,
    },
    ischeckoutdone: {
      type: Boolean,
      default: false,
    },
    numberOfTimes: {
      type: Number,
    },
  },
  { timeisstamp: true },
);
const Product = mongoose.model("Product", productSchema);
module.exports = Product;
