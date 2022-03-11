const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const shortid = require('short-id')
const IPFS = require("ipfs-http-client")
const ipfs = new IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})

const doctorSchema = require("../models/doctors");
const patientSchema = require("../models/patients");
const clinic = require("../models/clinic");

exports.signup = async (req,res,next) => {
    let doctor;
    try {
        doctor = await doctorSchema.find({email : req.body.email}).exec();
    } catch (err){
        res.status(404).json({
            message : err
        });
    }
    console.log(patient);
    if(doctor.length >= 1){
        res.status(403).json({message : "User already exists"});
    } else {
        let hash;
        try {
            hash = await bcrypt.hash(req.body.password,10);
        } catch (err) {
            res.status(404).json({message:err});
        }

        const Doctor = new doctorSchema(
            {
                _id: new mongoose.Types.ObjectId().toString(),
                name: req.body.name,
                email: req.body.email,
                phone : req.body.phone,
                password: hash,
                type : req.body.type,
                public_key : "vivek",
              }
        );

        try {
            await Doctor.save();
        } catch (err) {
            res.status(401).json({message : err});
        }

        res.status(200).json({message : "Welcome ! Thank you for registering"});
    }
}

exports.login = async (req,res,next) => {
    let doctor;
    try {
        doctor = await doctorSchema.find({email: req.body.email}).exec();
    } catch (err) {
        res.status(404).json({message : err});
    }

    if(doctor.length < 1) {
        res.status(404).json({message : "username does not exist"});
    } else {
        let user;
        try {
            user = await bcrypt.compare(req.body.password, patient[0].password);
        } catch (err) {
            res.status(404).json({message : "Wrong password"});
        }

        if(user){
            const token = jwt.sign({
                _id : doctor[0].id,
                name : doctor[0].name,
                email : doctor[0].email
            }, "healthchain", { expiresIn : "30m"});

            res.cookie('jwt', token);

            res.status(200).json({token : token});
        }
    }
}

exports.my_appointments = async (req, res, next) => {
    let date = new Date();
    let d = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDay();
    d = date.getDay() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
    let appointments;
    try {
        appointments = await clinicSchema.find({date : date}).exec();
    } catch (err) {
        res.status(404).json({message: err});
    }

    if(appointments.length < 1) {
        res.status(400).json({message : "You do not have any appointments for today"});
    } else {
        res.status(200).json({appointments : appointments});
    }
}

exports.mypatients = async (req, res, next) => {

}

exports.prescribe = async (req, res, next) => {
    
}