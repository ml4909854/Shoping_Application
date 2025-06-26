


const mongoose = require("mongoose")
const reviewSchema  = new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId , ref:"User" , required:true},
    productId:{type:mongoose.Schema.Types.ObjectId , ref:"Product" , required:true},
    rating:{type:Number , min:1 , max:5 , required:true},
    comment:{type:String}
})

const Review  = mongoose.model("Review" , reviewSchema)
module.exports = Review