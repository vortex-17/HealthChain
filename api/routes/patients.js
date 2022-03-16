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

router.post("/signup", patientController.signup);

router.post("/login", patientController.login);

router.post("/find=:type", patientController.find);

router.post("/book", patientController.book);

router.get("/history", web3_controllers.all_history);

router.get("/history=:id", web3_controllers.history);

router.get("/appointments", patientController.my_appointments);

router.post("/share=:id", web3_controllers.share);

router.post("/test", patientController.test);

module.exports = router;

// {
//     "name" : "Vivek Mehta",
//     "email" : "mehtavivek@gmail.com",
//     "phone" : "1234567890",
//     "password" : "vivekmehta"
// }