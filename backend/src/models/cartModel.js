// models/cartModel.js
const mongoose = require("mongoose");

const { Schema } = mongoose;
const ObjectId = Schema.Types.ObjectId;

const cartItemSchema = new Schema(
  {
    itemId: { type: ObjectId, ref: "Menu", required: true, index: true },
    name: { type: String, required: true },

    
    quantity: { type: Number, required: true, default: 1, min: 1 },

   
    totalPrice: { type: Number, required: true, min: 0 },

   
    quantityLabel: { type: String },     
    unit: { type: String },              
    unitValue: { type: Number, default: 1 },
    loose: { type: Boolean, default: false },

    foodType: { type: String },
    photos: { type: [String], default: [] },

    // Offer persistence
    pricingType: {
      type: String,
      enum: ["regular", "bulk-price", "buy-x-get-y-free"],
      default: "regular",
      index: true,
    },
    offerId: { type: ObjectId, ref: "Offer" },

    // Backend hint: treat this line as fixed-price in totals when true
    lineIsFixedPrice: { type: Boolean, default: false },

    // Optional offer metadata (handy for UI/debug; not required to compute totals)
    packSize: { type: Number },          // bulk
    discountedPrice: { type: Number },   // bulk
    buyQuantity: { type: Number },       // bxgy
    freeQuantity: { type: Number },      // bxgy
    deliveredUnits: { type: Number },    // bxgy
    chargedUnits: { type: Number },      // bxgy
    unitPrice: { type: Number },         // snapshot of menu unit price (bxgy)
  },
  { _id: false } 
);

const cartSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User", required: true, index: true },
    restaurantId: { type: ObjectId, ref: "Business", required: true, index: true },
    restaurantName: { type: String, required: true },
    items: { type: [cartItemSchema], required: true, default: [] },
  },
  { timestamps: true }
);


cartSchema.index({ userId: 1, restaurantId: 1 }, { unique: true });

module.exports = mongoose.model("Cart", cartSchema);
