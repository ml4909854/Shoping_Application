const express = require("express");
const auth = require("../middleware/auth.middleware");
const Cart = require("../model/cart.model");
const router = express.Router();

// now i creating our router. so cart only people get who
// is authenticated

// get cart and get cart data

router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ userId }).populate("products.productId");

    if (!cart && cart.products.length===0) {
      return res.status(404).json({ message: "cart is empty!" });
    }

    res.status(200).json({ message: "Get the cart data", cart: cart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error to get cart data", error: error.message });
  }
});

// add to product to the cart
router.post("/add", auth, async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  try {
    // Step 1: Find if the cart already exists for the user
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Step 2: If not, create a new cart with this product
      cart = new Cart({
        userId: userId,
        products: [{ productId, quantity: 1 }],
      });
    } else {
      // Step 3: If cart exists, check if product already in cart
      const existingProduct = cart.products.find(
        (product) => product.productId.toString() === productId
      );

      if (existingProduct) {
        existingProduct.quantity += 1; // increase quantity
      } else {
        cart.products.push({ productId, quantity: 1 }); // add new product
      }
    }

    // Step 4: Save the updated or new cart
    const savedCart = await cart.save();

    res.status(200).json({ message: "Product added to cart", cart: savedCart });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: error.message });
  }
});

// update cart

router.patch("/update", auth, async (req, res) => {
  const { productId, action } = req.body;
  const userId = req.user._id;
  try {
    // first step to find the cart
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status.json({ message: "cart not found!" });
    }

    // find product
    const product = cart.products.find((product)=>product.productId.toString() === productId)
    if(!product){
        return res.status(404).json({message:"Product not found!"})
    }

    if(action === "inc"){
        product.quantity+=1
    }
    if(action === "dec" && product.quantity>1){
         product.quantity-=1
    }
    await cart.save()

   res.status(200).json({message:"cart updated successfully" , cart})
  } catch (error) {
    res.status(500).json({message:"Error to update cart" , error:error.message})
  }
});

// delete a item in a cart

router.delete("/remove/:id" , auth , async(req , res)=>{
    const productId = req.params.id

    try {
        const cart  = await Cart.findOne({userId:req.user._id})
        if(!cart ){
            return res.status(404).json({message:"cart not found!"})
        }

        cart.products = cart.products.filter((product)=>product.productId.toString() !== productId)

     await cart.save()
     res.status(200).json({message:"product remove successfylly!"})
    } catch (error) {
        
    }
})

module.exports = router;
