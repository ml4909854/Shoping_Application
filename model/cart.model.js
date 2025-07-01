const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  products: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1, min: 1 },
    },
  ],
}
,{
    versionKey:false,
    timestamps:true
});


const Cart = mongoose.model("Cart" , cartSchema)
module.exports = Cart