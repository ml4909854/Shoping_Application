


const mongoose = require("mongoose")
const mongoUrl = process.env.MONGO_URL

const connectDB = async(req , res)=>{
    try {
         await mongoose.connect(mongoUrl)
         console.log("db connected!")
    } catch (error) {
        console.log("db error!")
    }
}



module.exports = connectDB