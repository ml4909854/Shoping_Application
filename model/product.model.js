

const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    image:{type:String , required:true },
    title:{type:String , required:true , trim:true},
    brand:{type:String , required:true , trim:true},
    category:{type:String , required:true},
    subCategory:{type:String , required:true},
    color:{type:String , required:true},
    price:{type:String , required:true},
    userId:{type:mongoose.Schema.Types.ObjectId , ref:"User" , required:true}
} , {
    versionKey:false,
    timestamps:true
})

const Product = mongoose.model("Product" , productSchema)
module.exports = Product