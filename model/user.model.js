


const mongoose = require("mongoose")
const roles = require("../constants/roles")

const userSchema = new mongoose.Schema({
    email:{type:String , required:true , unique:true, trim:true},
    password:{type:String , required:true, trim:true},
    role:{type:String , enum:[roles.admin , roles.user] , default:roles.user}
},{
    versionKey:false,
    timestamps:true
})

const User = mongoose.model("User" , userSchema)
module.exports = User
