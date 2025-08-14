const mongoose = require("mongoose");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");

/* ------------------------------ helpers ------------------------------ */

const ObjectId = mongoose.Types.ObjectId;

const getUserIdFromReq = async (req) => {
  if (req.user?.id) return req.user.id;
  if (req.user?.email) {
    const user = await User.findOne({ email: req.user.email }).select("_id");
    return user?._id;
  }
  return null;
};

const isOfferLine = (it) =>
  it?.pricingType === "bulk-price" ||
  it?.pricingType === "buy-x-get-y-free" ||
  !!it?.offerId;

const toNum = (v, d = 0) => (v === undefined || v === null || v === "" ? d : Number(v));

/** Offer lines are line-priced. Regular lines are unit-priced. */
const lineTotal = (it) => {
  const price = toNum(it.totalPrice, 0);
  const qty = toNum(it.quantity, 1);
  return isOfferLine(it) ? price : price * qty;
};

const computeTotals = (cartDoc) => {
  const items = cartDoc?.items || [];
  const total = items.reduce((sum, it) => sum + lineTotal(it), 0);
  const quantity = items.reduce((sum, it) => sum + toNum(it.quantity, 0), 0);
  return { total, quantity };
};

/** Normalize incoming FE items (be lenient but preserve offer metadata) */
const normalizeIncomingItem = (i) => {
  const out = {
    itemId: i.itemId,
    name: i.name,
    photos: Array.isArray(i.photos) ? i.photos.filter((p) => typeof p === "string") : [],
    foodType: i.foodType,
    unit: i.unit,
    unitValue: toNum(i.unitValue, 1),
    loose: !!i.loose,

    // delivered units for this line (or pack)
    quantity: toNum(i.quantity, 1),

    // IMPORTANT: this is a line price (for offer) or unit price (for regular)
    totalPrice: toNum(i.totalPrice, 0),

    quantityLabel: i.quantityLabel,
    pricingType: i.pricingType || "regular",
    offerId: i.offerId || undefined,

    // Hint for backend logic
    lineIsFixedPrice: isOfferLine(i) ? true : false,

    // Optional offer metadata
    packSize: toNum(i.packSize, undefined),
    discountedPrice: toNum(i.discountedPrice, undefined),
    buyQuantity: toNum(i.buyQuantity, undefined),
    freeQuantity: toNum(i.freeQuantity, undefined),
    deliveredUnits: toNum(i.deliveredUnits, undefined),
    chargedUnits: toNum(i.chargedUnits, undefined),
    unitPrice: toNum(i.unitPrice, undefined),
  };

  // Safety for offers if FE omitted fields
  if (out.pricingType === "buy-x-get-y-free") {
    const buy = toNum(out.buyQuantity, 0);
    const free = toNum(out.freeQuantity, 0);
    if (!out.quantity) out.quantity = buy + free; // delivered
    out.lineIsFixedPrice = true;
  } else if (out.pricingType === "bulk-price") {
    const pack = toNum(out.packSize, toNum(i.purchaseQuantity, 0));
    if (pack && !out.quantity) out.quantity = pack; // delivered
    out.lineIsFixedPrice = true;
  }

  return out;
};

/** Decide if two items can be merged into one line */
const canMerge = (existing, incoming) => {
  // Different item? no.
  if (String(existing.itemId) !== String(incoming.itemId)) return false;

  // Offers merge only if same offerId + pricingType
  if (isOfferLine(existing) || isOfferLine(incoming)) {
    return (
      existing.pricingType === incoming.pricingType &&
      String(existing.offerId || "") === String(incoming.offerId || "")
    );
  }

  // Regular items: merge only if same variant/label (avoid mixing loose sizes)
  const a = existing.quantityLabel || "";
  const b = incoming.quantityLabel || "";
  return a === b;
};

/** Merge incoming items into cart with correct pricing math */
const mergeItemsIntoCart = (cart, incomingItems) => {
  for (const raw of incomingItems) {
    const incoming = normalizeIncomingItem(raw);

    const idx = cart.items.findIndex((ex) => canMerge(ex, incoming));
    if (idx >= 0) {
      // Merge into existing line
      const ex = cart.items[idx];
      ex.quantity = toNum(ex.quantity, 0) + toNum(incoming.quantity, 0);

      if (isOfferLine(ex)) {
        // Offer line: totalPrice is a LINE amount; add the new line-price
        ex.totalPrice = toNum(ex.totalPrice, 0) + toNum(incoming.totalPrice, 0);
      } else {
        // Regular: keep unit price; FE may send line price—don't overwrite here
      }
    } else {
      cart.items.push(incoming);
    }
  }
};

/* ------------------------------ controllers ------------------------------ */

// Add item to cart or update quantity
const addToCart = async (req, res) => {
  const { restaurantId, restaurantName, items = [] } = req.body;

  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!restaurantId || !restaurantName)
      return res.status(400).json({ message: "restaurantId and restaurantName are required" });

    // Do not allow mixing restaurants
    const anyCart = await Cart.findOne({ userId });
    if (anyCart && String(anyCart.restaurantId) !== String(restaurantId)) {
      return res.status(409).json({ message: "Cart contains items from another restaurant" });
    }

    // Upsert by (userId, restaurantId)
    let cart = await Cart.findOne({ userId, restaurantId });
    if (!cart) {
      cart = new Cart({
        userId,
        restaurantId,
        restaurantName,
        items: [],
      });
    }

    mergeItemsIntoCart(cart, items);

    // Always sync restaurantName (could change)
    cart.restaurantName = restaurantName;

    await cart.save();

    // Keep original response shape for compatibility
    return res.status(201).json(cart);
  } catch (error) {
    console.error("[cartController.js][addToCart]", error);
    console.trace("[cartController.js][addToCart] Stack trace:");
    return res.status(500).json({ message: "Error adding to cart", error: error.message });
  }
};

// Get all cart items for a user
const getCartItems = async (req, res) => {
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const carts = await Cart.find({ userId })
      .populate({ path: "restaurantId", select: "serviceType" });

    // Transform the response to include serviceType, keep doc otherwise
    const transformedCarts = carts.map((cart) => ({
      ...cart.toObject(),
      serviceType: cart.restaurantId?.serviceType || null,
      // optionally: totals so FE doesn't have to recompute
      totals: computeTotals(cart),
    }));

    return res.json(transformedCarts);
  } catch (error) {
    console.error("[cartController.js][getCartItems]", error);
    console.trace("[cartController.js][getCartItems] Stack trace:");
    return res.status(500).json({ message: "Error fetching cart items", error: error.message });
  }
};

// Update item quantity in cart (atomic). Blocks offer lines.
const updateCartQuantity = async (req, res) => {
  const { itemId } = req.params; // menu itemId (not subdoc _id)
  const { quantity, totalPrice } = req.body; // totalPrice allowed for loose items

  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    if (quantity !== undefined && Number(quantity) < 1) {
      return res.status(400).json({ message: "Quantity cannot be less than 1" });
    }

    // Load first matching line for this itemId
    const found = await Cart.findOne(
      { userId, "items.itemId": itemId },
      { "items.$": 1, restaurantId: 1 }
    );
    if (!found || !found.items?.length) {
      return res.status(404).json({ message: "Cart or item not found" });
    }
    const current = found.items[0];

    if (isOfferLine(current)) {
      return res
        .status(400)
        .json({ message: "Offer items cannot be updated. Remove and re-add the offer." });
    }

    const setObj = {};
    if (quantity !== undefined) setObj["items.$.quantity"] = Number(quantity);
    if (totalPrice !== undefined) setObj["items.$.totalPrice"] = Number(totalPrice);

    const updated = await Cart.findOneAndUpdate(
      { userId, "items.itemId": itemId },
      { $set: setObj },
      { new: true }
    );

    // Keep original response shape
    return res.json(updated);
  } catch (error) {
    console.error("[cartController.js][updateCartQuantity]", error);
    console.trace("[cartController.js][updateCartQuantity] Stack trace:");
    return res.status(500).json({ message: "Error updating cart quantity", error: error.message });
  }
};

// Delete item from cart (atomic pull). Removes all lines matching this menu itemId.
const deleteCartItem = async (req, res) => {
  const { itemId } = req.params; // menu itemId (FE sends this)
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Ensure the item exists
    const exists = await Cart.findOne({ userId, "items.itemId": itemId }).select("_id");
    if (!exists) return res.status(404).json({ message: "Cart or item not found" });

    // Try casting to ObjectId; mongoose will usually cast anyway
    let castId = itemId;
    try {
      castId = new ObjectId(itemId);
    } catch (_) {
      // leave as string if not a valid ObjectId
    }

    const updated = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { itemId: castId } } },
      { new: true }
    );

    // Keep original response shape
    return res.json(updated);
  } catch (error) {
    console.error("[cartController.js][deleteCartItem]", error);
    console.trace("[cartController.js][deleteCartItem] Stack trace:");
    return res.status(500).json({ message: "Error deleting cart item", error: error.message });
  }
};

// Clear all cart items for a user
const clearCart = async (req, res) => {
  try {
    const userId = await getUserIdFromReq(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    await Cart.deleteMany({ userId });
    return res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("[cartController.js][clearCart]", error);
    console.trace("[cartController.js][clearCart] Stack trace:");
    return res.status(500).json({ message: "Error clearing cart", error: error.message });
  }
};

module.exports = {
  addToCart,
  getCartItems,
  updateCartQuantity,
  deleteCartItem,
  clearCart,
};
