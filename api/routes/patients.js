// import {express} from "express";
// const router = express.router();
// import cookieParser from "cookie-parser";
// import {patient} from "../models/patients";

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken");

//Routes for the patients

const patientController = require("../controllers/patients");
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
      console.log(req.id);
    //   console.log(req['authUserId']);
    //   console.log(claims['sub']);
      next()
    }
]

router.post("/signup", patientController.signup); //works

router.post("/login", patientController.login); //works

router.get("/find=:type", patientController.find); //works

router.post("/book", checkauth, patientController.book); //works

router.get("/history", checkauth, web3_controllers.all_history); //works

router.get("/history=:id", checkauth, web3_controllers.history);

router.get("/appointments", checkauth, patientController.my_appointments); //works

router.post("/share=:id", checkauth, web3_controllers.share);

router.post("/test", patientController.test);

module.exports = router;

// {
//     "name" : "Vivek Mehta",
//     "email" : "mehtavivek@gmail.com",
//     "phone" : "1234567890",
//     "password" : "vivekmehta"
// }