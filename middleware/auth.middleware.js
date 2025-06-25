


const jwt = require("jsonwebtoken")
const User = require("../model/user.model.js")
const auth = async(req , res , next) =>{
    try {
        const token = req.headers?.authorization?.split(" ")[1]
        console.log(token)
        if(!token){
            return res.status(404).json({message:"Token not found!"})
        }
        
        const decoded = jwt.verify(token ,process.env.SECRET_KEY)
        req.user = await User.findById(decoded._id)
        console.log(req.user)
        next()
        } catch (error) {
        res.status(400).json({message:"Invalid or expired token!"})
    } 
}

module.exports = auth