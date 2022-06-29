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
const clinicSchema = require("../models/clinic");

exports.signup = async (req,res,next) => {
    console.log("Doctor signing");
    let doctor;
    try {
        doctor = await doctorSchema.find({email : req.body.email}).exec();
    } catch (err){
        res.status(404).json({
            message : err
        });
    }
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
    console.log(req.body);
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
            user = await bcrypt.compare(req.body.password, doctor[0].password);
        } catch (err) {
            res.status(404).json({message : "Wrong password"});
        }

        if(user){
            const token = jwt.sign({
                _id : doctor[0].id,
                name : doctor[0].name,
                email : doctor[0].email
            }, "healthchain", { expiresIn : "60m"});

            res.cookie('jwt', token);
            console.log("found doctor");
            return res.render('doc_dashboard', {name : doctor[0].name});
            // res.status(200).json({token : token});
        }
    }
}

exports.my_appointments = async (req, res, next) => {
    let date = new Date();
    let d = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDay();
    d = date.getDay() + "/" + (date.getMonth()+1) + "/" + date.getFullYear();
    d = "3/06/2022"; //For testing
    let appointments;
    try {
        appointments = await clinicSchema.find({doctorId : req.id, date : d}).exec();
    } catch (err) {
        res.status(404).json({message: err});
    }

    if(appointments.length < 1) {
        return res.render("misc_doc", {message : "You do not have any appointments for today"});
        // res.status(400).json({message : "You do not have any appointments for today"});
    } else {
        console.log(appointments);
        res.render("doc_app", {result: appointments});
        // res.status(200).json({appointments : appointments});
    }
}

exports.mypatients = async (req, res, next) => {

}

exports.prescribe = async (req, res, next) => {
    
}