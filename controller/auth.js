const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const sendEmail = require("../helper/handleNodeMailer");
const path = require("path");
const handleVerifyEmail = require("../helper/handleVerifyEmail");

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
        message: "Email or phone number is required",
      });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, and one special character.",
      });
    }
    let existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        message: "Username is already taken",
      });
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;

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

    if (email) {
      // Verify the email before proceeding
      const isEmailValid = await handleVerifyEmail(updatedEmail);
      if (!isEmailValid) {
        return res.status(400).json({
          message: "Email does not exist or is invalid.",
        });
      }
      existingUser = await User.findOne({ email: updatedEmail });
      if (existingUser) {
        return res.status(400).json({
          message: "Email already exists.",
        });
      }
    }

    if (email) {
    } else if (phone) {
      existingUser = await User.findOne({ phone });
    }

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email or phone number already exists",
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // const newUser = await User.create({
    //   username,
    //   email: updatedEmail || null,
    //   phone: phone || null,
    //   password: hashedPassword,
    //   isVerified: false,
    //   balance: 0,
    // });

    const otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      specialChars: false,
      upperCaseAlphabets: false,
    });

    if (email) {
      const htmlFilePath = path.join(__dirname, "../html/emailTemplate.html");
      const subject = "Account Verification Request";

      await sendEmail(updatedEmail, subject, htmlFilePath, otp);
    }

    const token = jwt.sign(
      { username, email: updatedEmail, phone, password, otp },
      process.env.JWT_SECRET
    );

    return res.status(201).json({
      message: "OTP sent successfully.",
      token,
      otp,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
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

exports.verifyOtpAndCreateUser = async (req, res) => {
  try {
    const { otp, token } = req.body;

    if (!otp || !token) {
      return res.status(400).json({ message: "OTP and token are required." });
    }

    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret);

    if (decoded.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(decoded.password, salt);

    const newUser = await User.create({
      username: decoded.username,
      email: decoded.email || null,
      phone: decoded.phone || null,
      password: hashedPassword,
      isVerified: true,
      balance: 0,
    });
    const payload = {
      email: newUser.email,
      phone: newUser.phone,
      _id: newUser._id,
    };

    const newToken = jwt.sign(payload, jwtSecret);

    return res.status(201).json({
      message: "User created successfully.",
      user: newUser,
      token: newToken,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
