//Controller for the patients

// import {hash, compare} from "bcrypt";
// import {jwt} from "jsonwebtoken";
// import {mongoose} from "mongoose";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const doctorSchema = require("../models/doctors");
const patientSchema = require("../models/patients");
const clinic = require("../models/clinic");

exports.signup = async (req,res,next) => {
    let patient;
    try {
        patient = await patientSchema.find({email : req.body.email}).exec();
    } catch (err){
        res.status(404).json({
            message : err
        });
    }
    console.log(patient);
    if(patient.length >= 1){
        res.status(403).json({message : "User already exists"});
    } else {
        let hash;
        try {
            hash = await bcrypt.hash(req.body.password,10);
        } catch (err) {
            res.status(404).json({message:err});
        }

        const Patient = new patientSchema(
            {
                _id: new mongoose.Types.ObjectId().toString(),
                name: req.body.name,
                email: req.body.email,
                phone : req.body.phone,
                password: hash,
                public_key : "vivek",
                coin : 0
              }
        );

        try {
            await Patient.save();
        } catch (err) {
            res.status(401).json({message : err});
        }

        res.status(200).json({message : "Welcome ! Thank you for registering"});
    }
}

exports.login = async (req,res,next) => {
    let patient;
    try {
        patient = await patientSchema.find({email: req.body.email}).exec();
    } catch (err) {
        res.status(404).json({message : err});
    }

    if(patient.length < 1) {
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
                _id : patient[0].id,
                name : patient[0].name,
                email : patient[0].email
            }, "healthchain", { expiresIn : "30m"});

            res.cookie('jwt', token);

            res.status(200).json({token : token});
        }
    }
}

exports.find = async (req,res,next) => {
    let doctors;
    try {
        doctors = await doctorSchema.find({type : req.params.type}).exec();
    } catch (err) {
        res.status(404).json({message : err});
    }

    if(doctors.length < 1) {
        res.status(404).json({message : "Could not find any doctors"});
    } else {
        res.status(200).json({doctor_list : doctors});
    }

}

exports.book = async (req,res,next) => {

}

exports.history = async (req,res,next) => {

}