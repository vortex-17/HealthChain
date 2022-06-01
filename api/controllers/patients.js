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
// const { doesNotMatch } = require("assert");
// const ipfs = IPFS.create();
const ipfs = IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https'})
// const lms = require("../../web3_utils").lms;
// const accounts = require("../../web3_utils").accounts; 

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
            return res.render("misc",{message : "Couldn't Signup. Try again later"});
            // res.status(401).json({message : err});
        }

        return res.render("misc",{message : "Thank You for Registering!"});
        // res.status(200).json({message : "Welcome ! Thank you for registering"});
    }
}

exports.login = async (req,res,next) => {
    console.log(req.body);
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
            return res.render("misc",{message : "Wrong Password"});
            // res.status(404).json({message : "Wrong password"});
        }

        if(user){
            const token = jwt.sign({
                _id : patient[0].id,
                name : patient[0].name,
                email : patient[0].email
            }, "healthchain", { expiresIn : "60m"});

            res.cookie('jwt', token);
            console.log("Will Log you in");
            return res.render('home', {name : patient[0].name});
            // res.status(200).json({token : token});
        }
    }
}

exports.find_all = async (req,res,next) => {
    let doctors;
    try {
        doctors = await doctorSchema.find({}).exec(); //type : req.params.type
    } catch (err) {
        res.status(404).json({message : err});
    }

    if(doctors.length < 1) {
        res.status(404).json({message : "Could not find any doctors"});
    } else {
        return res.render("show_doc", {result : doctors});
        // res.status(200).json({doctor_list : doctors});
    }

}

exports.find = async (req,res,next) => {
    console.log(req.body);
    let type = req.body.type;
    let doctors;
    if (type) {
        try {
            doctors = await doctorSchema.find({type : type}).exec();
        } catch (err) {
            console.log(err);
            res.status(400).json({"error":  err});
        }

        if(doctors.length < 1){
            res.status(200).json({message : "Could not find any doctors for this type"});
        } else {
            return res.render("show_doc", {result : doctors});
        }
    }
}

exports.book = async (req,res,next) => {
    console.log(req.body);
    let appointment;
    try {
        appointment = await clinicSchema.find({date :req.body.date, doctorId : req.params.doctorId, time : req.body.time }).exec()
    } catch (err) {
        res.status(404).json({message : err});
    }

    if(appointment.length >= 1){
        res.status(404).json({
            message : "An appointment already exists at this time. Please try for another time"
        });
    } else {
        let doctor;
        try {
            doctor = await doctorSchema.find({_id : req.params.doctorId}).exec();
        } catch (err) {
            res.status(400).json({message : err});
        }
        const new_appointment = new clinicSchema({
            transactionID : new mongoose.Types.ObjectId().toString(),
            patientId : req.id,
            doctorId : req.params.doctorId,
            patientName : req.user,
            doctorName : doctor[0].name,
            date : req.body.date,
            time : req.body.time
        });

        try {
            await new_appointment.save();
        } catch (err) {
            res.status(404).json({message : err});
        }

        //insert the new patientt in doctor's patient list
        return res.render("misc",{message : "Your appointment has been booked"});
        // res.status(200).json({message : "Your Appointment has been booked"});
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
    d = "3/06/2022"; //Just for testing
    console.log("Date: " + d);
    let appointments;
    try {
        appointments = await clinicSchema.find({patientId : req.id, date : d}).exec();
    } catch (err) {
        res.status(404).json({message: err});
    }
    console.log(appointments);
    if(appointments.length < 1) {
        return res.render("misc", {message : "You do not have any appointments for today"});
        // res.status(400).json({message : "You do not have any appointments for today"});
    } else {
        return res.render("appointments", {result : appointments})
        // res.status(200).json({appointments : appointments});
    }
}



const Web3 = require('web3');
const contract = require('truffle-contract');
const artifacts = require('../../build/Inbox.json');

if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider)
} else {
  var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'))
}

const LMS = contract(artifacts)
LMS.setProvider(web3.currentProvider)


exports.test = async (req, res, next) => {
    // this is used to test IPFS and blockchain
    let buffer = req.body.buffer;
    let id = shortid.generate() + shortid.generate()
    if(buffer) {
        let ipfsHash;
        // try {
        //     ipfsHash = await ipfs.add(Buffer.from(JSON.stringify(buffer)));
        // } catch (err) {
        //     res.status(404).json({error: err});
        // }
        // console.log(ipfsHash.next());
        const arr = [];
        console.log("VV", buffer);
        for await (const item of ipfs.add(Buffer.from(JSON.stringify(buffer)))) {
            console.log('item', item)
            arr.push(item);
            break;
        } 
        // let value;
        // let done;
        // while (true) {
        //     done, value = await ipfsHash.next();
        //     if (done) break;
        // }
        const accounts =  await web3.eth.getAccounts();
        const lms =  await LMS.deployed();
        console.log(accounts[0])
        console.log("Hello World");
        let hash = arr[0].path;
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