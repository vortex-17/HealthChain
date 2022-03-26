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

router.post("/signup", doctorController.signup); //works

router.post("/login", doctorController.login); //works

router.get("/mypatients", checkauth, doctorController.mypatients);

router.get("/appointments", checkauth, doctorController.my_appointments); //works

router.post("/prescribe=:id", checkauth, web3_controllers.prescribe); //works

module.exports = router;

// {
//     "name" : "Akshat Kashyap",
//     "email" : "kashyapakshat@gmail.com",
//     "phone" : "1234567890",
//     "password" : "akshatkashyap",
//     "type" : "Dermatologist"
// }