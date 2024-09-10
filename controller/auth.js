const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();

exports.signUp = async (req, res, next) => {
  try {
    const { username, email, phone, password } = req.body;
    const updatedEmail = email?.toLowerCase();

    if (!username) {
      return res.status(400).json({ message: "Username is required" });
    }

    if (!email && !phone) {
      return res.status(400).json({
        message: "Either email or phone number is required",
      });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

    // Password must be exactly 8 characters long, including at least one lowercase letter, one uppercase letter, and one special character.
    //   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z@$!%*?&]{8}$/;

    if (email && !emailRegex.test(updatedEmail)) {
      return res.status(400).json({
        message:
          "Invalid email format. Ensure it contains '@' and '.' symbols.",
      });
    }

    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({
        message:
          "Invalid phone number format. Ensure it follows international format.",
      });
    }

    console.log(`Testing password: ${password}`); // Log the password
    //   if (!passwordRegex.test(password)) {
    //     return res.status(400).json({
    //       message:
    //         "Password must be exactly 8 characters long, including at least one lowercase letter, one uppercase letter, and one special character.",
    //     });
    //   }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const existingUser = await User.findOne({
      $or: [{ email: updatedEmail }, { phone }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email or phone number already exists",
      });
    }

    const newUser = await User.create({
      username,
      email: updatedEmail || null,
      phone: phone || null,
      password: hashedPassword,
      balance: 0,
    });

    const obj = {
      _id: newUser._id,
      email: newUser.email || newUser.phone,
    };
    const jwtSecret = process.env.JWT_SECRET;
    const token = jwt.sign(obj, jwtSecret); 

    return res.status(201).json({
      message: "Account created successfully",
      newUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

exports.signIn = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res
        .status(400)
        .json({ message: "Either email or phone number is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    let query = {};
    if (email) {
      const updatedEmail = email.toLowerCase();
      query = { email: updatedEmail };
    } else if (phone) {
      query = { phone };
    }

    const existingUser = await User.findOne(query);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = existingUser.password;
    const verifyPassword = await bcrypt.compare(password, hashedPassword);
    if (!verifyPassword) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    const obj = {
      email: existingUser.email,
      phone: existingUser.phone,
      _id: existingUser._id,
    };

    const jwtSecret = process.env.JWT_SECRET;
    const token = await jwt.sign(obj, jwtSecret);

    return res.status(200).json({
      message: "Login successfully",
      user: existingUser,
      token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
