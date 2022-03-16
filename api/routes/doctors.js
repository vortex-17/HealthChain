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

router.post("signup", doctorController.signup);

router.post("login", doctorController.login);

router.get("mypatients", doctorController.mypatients);

router.get("appointments", doctorController.my_appointments);

router.post("prescribe=:id", web3_controllers.prescribe);

module.exports = router;