const express = require("express");
const User = require("../module/user");
const Product = require("../module/product"); // Consider renaming this to CartItem later

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    let user = await User.findOne({ email });

    if(user.password !== password){
      return res.status(404).json({ success: false, message: "Invalid password" });
    }


    if (user) {
      return res.status(200).json({
        success: true,
        message: "User already exists",
        user,
      });
    }

    user = new User({ name, email, password });
    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/addtocart", async (req, res) => {
  try {
    const { product_id: productId, user_id: userId, numberOfTimes = 1 } = req.body;

    if (!productId || !userId) {
      return res.status(400).json({ message: "product_id and user_id are required" });
    }

    // Atomic increment or insert
    const updatedItem = await Product.findOneAndUpdate(
      { product_id: productId, user_id: userId },
      { $inc: { numberOfTimes: Number(numberOfTimes) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Product added/updated in cart",
      product: updatedItem,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/removefromcart", async (req, res) => {
  try {
    const { product_id: productId, user_id: userId } = req.body;

    if (!productId || !userId) {
      return res.status(400).json({ message: "product_id and user_id are required" });
    }

    const cartItem = await Product.findOne({ product_id: productId, user_id: userId });

    if (!cartItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    if (cartItem.numberOfTimes <= 1) {
      // Remove the entire item
      await Product.findOneAndDelete({ product_id: productId, user_id: userId });
      return res.status(200).json({ success: true, message: "Product removed from cart" });
    }

    // Decrement by 1
    const updatedItem = await Product.findOneAndUpdate(
      { product_id: productId, user_id: userId },
      { $inc: { numberOfTimes: -1 } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "One item removed from cart",
      product: updatedItem,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/getallcartitem/:userid", async (req, res) => {
  try {
    const userId = req.params.userid;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const cartItems = await Product.find({ user_id: userId }).lean();

    res.status(200).json({
      success: true,
      message: "Cart items retrieved",
      count: cartItems.length,
      products: cartItems,
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;