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
      req.user = claims["name"];
      console.log(req.id);
    //   console.log(req['authUserId']);
    //   console.log(claims['sub']);
      next()
    }
]

router.post("/signup", patientController.signup); //works / Front End

router.post("/login", patientController.login); //works / Front End

router.post("/find", patientController.find); //works

router.get("/find_all", patientController.find_all); //works

router.post("/book=:doctorId", ...withAuthUserId, patientController.book); //works

router.get("/history", ...withAuthUserId, web3_controllers.all_history); //works

router.get("/history=:id", ...withAuthUserId, web3_controllers.history);

router.get("/appointments", ...withAuthUserId, patientController.my_appointments); //works

router.post("/share=:id", ...withAuthUserId, web3_controllers.share);

router.post("/test", web3_controllers.test);

router.get("/booking_form/:doctorId",...withAuthUserId, (req,res,next) => {
  console.log("DoctorID: ", req.params.doctorId);
  res.render("book_app", {docid : req.params.doctorId});
});

router.get("/history_report=:id", ...withAuthUserId, (req,res,next) => {
  console.log("TransactionID: ", req.params.id);
});

router.get("/home",...withAuthUserId, (req,res,next) => {
  return res.render('home', {name : req.user});
});

module.exports = router;

// {
//     "name" : "Vivek Mehta",
//     "email" : "mehtavivek@gmail.com",
//     "phone" : "1234567890",
//     "password" : "vivekmehta"
// }