const express = require("express");
const User = require("../model/user.model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

// register user
router.post("/register", async (req, res) => {
  try {
    const { email, password  , role} = req.body;
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "user already exists. Try different email ...!" });
    }
    const SALTROUND = parseInt(process.env.SALTROUND);
    const hashedPassword = await bcrypt.hash(password, SALTROUND);

    const newUser = new User({ email, password: hashedPassword , role });
    const savedUser = await newUser.save();
    ;
    res
      .status(201)
      .json({
        message: "Registered succesfully...!",
        user: savedUser,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Registering error....!", error: error.message });
  }
});

// login route
router.post("/login", async (req, res) => {
  try {
    

    const { email , password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found! Please regiter first" });
    }

    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword) {
      return res
        .status(400)
        .json({ message: "Incorrect or invalid password!" });
    }
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: "1d" });

    res
      .status(200)
      .json({ message: "User logged succesffuly", token, userID: user._id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error to logging user!", error: error.message });
  }
});

module.exports = router;
