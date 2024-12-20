const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { default: mongoose } = require("mongoose");
const authRoutes = require("./router/auth");
const userRoutes = require("./router/user");
const mainRoutes = require("./router/main");
const stripeRoutes = require("./router/stripe");
require("dotenv").config();
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;

const app = express();


app.use(bodyParser.json());
app.use(cors());
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/main", mainRoutes);
app.use("/stripe", stripeRoutes);



mongoose.connect(MONGO_URL).then(() => {
    console.log("database connected", PORT);
  }).catch((error)=>{
      console.log("Error==>",error)
  })

app.get("/", (req, res) => {
  return res.status(200).json({ message: "API works...!" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("server started");
});
