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

router.post("/signup", patientController.signup);

router.post("/login", patientController.login);

router.post("/find=:type", patientController.find);

router.post("/book", patientController.book);

router.get("/history", patientController.history);

router.get("/appointments", patientController.my_appointments);

router.post("/share=:id", patientController.share);

module.exports = router;

// {
//     "name" : "Vivek Mehta",
//     "email" : "mehtavivek@gmail.com",
//     "phone" : "1234567890",
//     "password" : "vivekmehta"
// }