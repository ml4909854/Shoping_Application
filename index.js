
require("dotenv").config()
const express = require("express")
const connectDB = require("./config/db")
const userRouter = require("./controller/user.controller.js")
const productRouter = require("./controller/product.controller.js")
const cartRouter = require("./controller/cart.controller.js")
const orderRouter = require("./controller/order.controller.js")
const reviewRouter = require("./controller/review.controller.js")
const adminRouter = require("./controller/admin.controller.js")
const app  = express()
app.use(express.json())

const PORT  = process.env.PORT
 

// routes 
app.use("/user" , userRouter)
app.use("/product" , productRouter)
app.use("/cart" , cartRouter)
app.use("/order" , orderRouter)
app.use("/review" , reviewRouter)
app.use("/admin" , adminRouter)


//health
app.get("/" , (req , res)=>{
    res.send("connected!")
})

// for path not found!
app.use((req , res)=>{
    res.send("path not found!")
})

app.listen(PORT ,async ()=>{
    await connectDB()
    console.log(`server is running on PORT:${PORT}`)
})