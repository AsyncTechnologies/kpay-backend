const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res
      .status(401)
      .json({ success: false, message: "*Not authenticated." });
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    const jwtSecret = process.env.JWT_SECRET;
    decodedToken = jwt.verify(token, jwtSecret);
  } catch (error) {
    console.log(error);
  }
  if (!decodedToken) {
    return res
      .status(401)
      .json({ success: false, message: "*Not authenticated." });
  }
  req._id = decodedToken._id;

  next();
};