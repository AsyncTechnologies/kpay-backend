const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user");

exports.updatePassword = async (req, res, next) => {
    try {
      const _id = req._id;
      const { password, newPassword } = req.body;
  
      if (!password || !newPassword) {
        return res.status(400).json({
          message: "Password and new password are required",
        });
      }
  
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
  
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          message:
            "New password must be at least 8 characters long, with at least one uppercase letter, one lowercase letter, and one special character.",
        });
      }
  
      const user = await User.findById(_id);
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
  
      const hashedPassword = user.password;
      const verifyPassword = await bcrypt.compare(password, hashedPassword);
  
      if (!verifyPassword) {
        return res.status(400).json({
          message: "Incorrect current password",
        });
      }
  
      const salt = await bcrypt.genSalt(12);
      const newHashedPassword = await bcrypt.hash(newPassword, salt);
  
      await User.findByIdAndUpdate(_id, { password: newHashedPassword });
  
      return res.status(200).json({
        message: "Password updated successfully",
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
      });
    }
  };

exports.updatePersonalInfo = async (req, res, next) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    try {
      const _id = req._id; 
      const { username, email, phone } = req.body;
  
      const user = await User.findById(_id);
  
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
  
      let updateFields = {};
  
 
      if (username) {
        const existingUserWithUsername = await User.findOne({ username });
        if (existingUserWithUsername && existingUserWithUsername._id.toString() !== _id) {
          return res.status(400).json({
            message: "Username is already taken",
          });
        }
        updateFields.username = username;
      }
  

      if (phone) {
        if (!phoneRegex.test(phone)) {
          return res.status(400).json({
            message: "Invalid phone number format",
          });
        }
        updateFields.phone = phone;
      }
  
     
      if (email) {
        if (!emailRegex.test(email)) {
          return res.status(400).json({
            message: "Invalid email address format",
          });
        }
        updateFields.email = email;
      }
  
      
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          message: "No valid fields provided for update",
        });
      }
  
     
      const updatedUser = await User.findByIdAndUpdate(_id, updateFields, {
        new: true,
        runValidators: true, 
      });
  
      return res.status(200).json({
        message: "User information updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
    }
  };
