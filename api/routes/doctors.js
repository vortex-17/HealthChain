// import {express} from "express";
// const router = express.router();
// import cookieParser from "cookie-parser";
// import {patient} from "../models/patients";

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken");

const doctorController = require("../controllers/doctors");
const web3_controllers = require("../controllers/web3_ctrl");
const checkauth = require("../middlewares/checkauth");

const withAuthUserId = [
    cookieParser(),
    (req, res, next) => {
      const claims = jwt.verify(req.cookies['jwt'], "healthchain")
      req['authUserId'] = claims['sub'];
      req["expiry"] = claims["exp"];
      console.log(claims);
      req.id = claims["_id"];
      req.user = claims["name"];
      console.log(req.id);
    //   console.log(req['authUserId']);
    //   console.log(claims['sub']);
      next()
    }
]

router.post("/signup", doctorController.signup); //works

router.post("/login", doctorController.login); //works

router.get("/mypatients", ...withAuthUserId, doctorController.mypatients);

router.get("/appointments", ...withAuthUserId, doctorController.my_appointments); //works

router.post("/prescribe=:id", ...withAuthUserId, web3_controllers.prescribe); //works

router.get("/prescribtion=:Id",...withAuthUserId, (req,res,next) => {
    console.log("TransactionID: ", req.params.Id);
    res.render("prescribe", {id : req.params.Id});
  });
  

module.exports = router;

// {
//     "name" : "Akshat Kashyap",
//     "email" : "kashyapakshat@gmail.com",
//     "phone" : "1234567890",
//     "password" : "akshatkashyap",
//     "type" : "Dermatologist"
// }