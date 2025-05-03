const express = require("express");
const router = express.Router();
const { addToCart, getCartItems, updateCartQuantity, deleteCartItem,clearCart } = require("../controllers/cartController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, addToCart);
router.get("/", authMiddleware, getCartItems);
router.patch("/:itemId", authMiddleware, updateCartQuantity);
router.delete("/", authMiddleware, clearCart);
router.delete("/:itemId", authMiddleware, deleteCartItem);


module.exports = router;
