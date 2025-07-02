const express = require("express");
const User = require("../model/user.model.js");
const auth  = require("../middleware/auth.middleware.js")
const checkRole = require("../middleware/checkRole.middleware.js")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();




// ✅ Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists. Try a different email!",
      });
    }

    // 2. Hash password
    const SALTROUND = parseInt(process.env.SALTROUND || "10");
    const hashedPassword = await bcrypt.hash(password, SALTROUND);

    // 3. Save new user
    const newUser = new User({ name, email, password: hashedPassword, role });
    const savedUser = await newUser.save();

    // 4. Send response
    res.status(201).json({
      message: `${savedUser.name} registered successfully!`,
      user: savedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error registering user!",
      error: error.message,
    });
  }
});

// ✅ Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "No user found. Please register first.",
      });
    }

    // 2. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect password!",
      });
    }

    // 3. Generate token
    const token = jwt.sign(
      { _id: user._id, role: user.role , name:user.name },
      process.env.SECRET_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: `${user.name} logged in successfully.`,
      token,
      userID: user._id,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error logging in!",
      error: error.message,
    });
  }
});

// Get user only admin get the all users.

router.get("/" ,auth , checkRole("admin") , async(req , res)=>{

  try {
      const user =await User.find()
      if(!user){
        res.status(404).json({message:"No user find."})
      }
      res.status(200).json({message:"Get all users!" , user:user})
  } catch (error) {
    res.status(500).json({message:"Error to get all users!"})
  }
})

// Delete user only admin can do that.

router.delete("/delete/:id" , auth , checkRole("admin") , async(req , res)=>{
  try {
        const userId = req.params.id
        const deleteUser = await User.findByIdAndDelete(userId)
        if(!deleteUser){
          res.status(404).json({message:"User not found!"})
        }
        res.status(200).json({message:"user delete successfully!" , deleteUser:deleteUser})
  } catch (error) {
    res.status(500).json({message:"Error to delelte a user" , error:error.message})
  }
})

module.exports = router;
