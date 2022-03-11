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
const clinicSchema = require("../models/clinic");

const shortid = require('short-id')
const IPFS = require("ipfs-http-client");
// const ipfs = IPFS.create();
const ipfs = IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})
const lms = require("../../app").lms;
const accounts = require("../../app").accounts; 

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
    let appointment;
    try {
        appointment = await clinicSchema.find({}).exec()
    } catch (err) {
        res.status(404).json({message : err});
    }

    if(appointment.length >= 1){
        res.status(404).json({
            message : "An appointment already exists at this time. Please try for another time"
        });
    } else {
        const new_appointment = new clinicSchema({
            transactionID : new mongoose.Types.ObjectId().toString(),
            patientId : req.id,
            doctorId : req.body.doctorId,
            date : req.body.date,
            time : req.body.time
        });

        try {
            await new_appointment.save();
        } catch (err) {
            res.status(404).json({message : err});
        }

        //insert the new patientt in doctor's patient list

        res.status(200).json({message : "Your Appointment has been booked"});
    }
}

exports.history = async (req,res,next) => {
    let history;
    try {
        history = await clinicSchema.find({patientId : req.id}).exec();
    } catch (err) {
        res.status(404).json({message : err});
    }

    if(history.length < 1) {
        res.status(200).json({message : "Book your first appointment today !"});
    } else {

        // The patient has got history
        // Need to parse through the blockchain and get the IPFS hash and access it.
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

exports.share = async (req, res, next) => {
    let appointment;
    try {
        appointment = await clinicSchema.find({transactionID : req.params.id}).exec();
    } catch (err) {
        res.status(404).json({message : err});
    }

    if(appointment.length < 1) {
        res.status(404).json({message : "No appointment with this transactionID"});
    } else {
        const patient_blockchain = appointment[0].patient_bch;

        //decrypt patient_blockchain and then access the IPFS hash

        let shared_link = "https://ipfs.infure.io./arg?<hash>";

        //email the shared_link
    }
}

exports.test = async (req, res, next) => {
    // this is used to test IPFS and blockchain
    let buffer = req.body.buffer;
    let id = shortid.generate() + shortid.generate()
    if(buffer) {
        let ipfsHash;
        try {
            ipfsHash = await ipfs.add(Buffer.from(JSON.stringify(buffer)));
        } catch (err) {
            res.status(404).json({error: err});
        }
        console.log(ipfsHash);
        for await (const item of ipfsHash) {
            console.log('item', item)
        } 
        console.log("hello world");
        let hash = ipfsHash[0];
        console.log(hash);
        lms.sendIPFS(id, hash, {from: accounts[0]})
        .then((_hash, _address)=>{
            res.json({"status":"success", "generated_id" : id,"ipfs hash" : hash, "blockchain hash": _hash, "address": _address})
        })
        .catch(err=>{
            res.status(500).json({"status":"Failed", "reason":"Upload error occured"})
        });
    }
}