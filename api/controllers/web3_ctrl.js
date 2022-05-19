const Web3 = require('web3');
const contract = require('truffle-contract');
const artifacts = require('../../build/Inbox.json');
const { lms } = require('../../web3_utils');
const IPFS = require("ipfs-http-client");
// const { doesNotMatch } = require("assert");
// const ipfs = IPFS.create();
const ipfs = IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'https'});
const shortid = require('short-id');
const fetch = require('node-fetch');
const PDFDocument = require("pdfkit");
const fs = require('fs');
const path = require('path');
const nodemailer = require("nodemailer");

const doctorSchema = require("../models/doctors");
const patientSchema = require("../models/patients");
const clinicSchema = require("../models/clinic");
const { response } = require('express');

const credentials = require("../../config");

if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider)
} else {
  var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'))
}

const LMS = contract(artifacts)
LMS.setProvider(web3.currentProvider)

let deploy = async () => {
    const accounts =  await web3.eth.getAccounts();
    const lms =  await LMS.deployed();
    return lms, accounts
}

function createPDF(filename, data) {
    let pdfDoc = new PDFDocument({ margin: 30, size: 'A4' });
    pdfDoc.pipe(fs.createWriteStream(filename));
    pdfDoc.fontSize(18);

    pdfDoc.font('Times-BoldItalic').text("HealthChain Prescription", { align: 'center', height : '100px'}).moveDown(2); 
    
    // pdfDoc.font('Times-Roman').text("ID:", {underline : true}).moveDown(0.5);
    // pdfDoc.font('Times-Roman').text(data.id).moveDown(1);

    pdfDoc.font('Times-Roman').text("Date and Time:", {underline : true}).moveDown(0.5);
    pdfDoc.font('Times-Roman').text(data.date + " , " + data.time).moveDown(1);

    pdfDoc.font('Times-Roman').text("Doctor Name:", {underline : true}).moveDown(0.5);
    pdfDoc.font('Times-Roman').text(data.doctor).moveDown(1);

    pdfDoc.font('Times-Roman').text("Patient Name:", {underline : true}).moveDown(0.5);
    pdfDoc.font('Times-Roman').text(data.patient).moveDown(1);

    pdfDoc.font('Times-Roman').text("Symptoms:", {underline : true}).moveDown(0.5);
    pdfDoc.font('Times-Roman').text(data.symptoms).moveDown(1);

    pdfDoc.font('Times-Roman').text("Disease:", {underline : true}).moveDown(0.5);
    pdfDoc.font('Times-Roman').text(data.disease).moveDown(1);

    pdfDoc.font('Times-Roman').text("Medicines:", {underline : true}).moveDown(0.5);
    pdfDoc.font('Times-Roman').text(data.medicines).moveDown(1);

    pdfDoc.font('Times-Roman').text("Tests:", {underline : true}).moveDown(0.5);
    pdfDoc.font('Times-Roman').text(data.tests).moveDown(1);

    pdfDoc.end();
}

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
        console.log("Vivek Mehta", buffer);
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
        // let lms;
        // let accounts;
        // try {
        //     lms, accounts = await deploy();
        // } catch (err) {
        //     res.status(404).json({message : err});
        // }
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

exports.prescribe = async (req,res,next) => {
    let history;
    try {
        history = await clinicSchema.find({id : req.params.id}).exec();
    } catch (err) {
        res.status(200).json({message : err});
    }

    if (history.length < 1) {
        return res.status(400).json({message : "No history with this ID"});
    }

    let date = history[0].date;
    let time = history[0].time;
    console.log("Prescribing medicines");
    let presciption = req.body;
    let transaction_id = req.params.id;
    presciption["doctor"] = req.user;
    presciption["date"] = date;
    presciption["time"] = time;
    console.log(presciption, transaction_id);
    const arr = [];
    if(presciption){
        
        console.log("pushing into IPFS");
        for await (const item of ipfs.add(Buffer.from(JSON.stringify(presciption)))) {
            console.log('item', item)
            arr.push(item);
            break;
        } 
    }
    console.log("Pushed to the IPFS");
    let hash = arr[0].path;
    // let lms;
    // let accounts;
    let id = shortid.generate() + shortid.generate()
    // try {
    //     lms, accounts = await deploy();
    // } catch (err) {
    //     res.status(404).json({message : err});
    // }

    const accounts =  await web3.eth.getAccounts();
    const lms =  await LMS.deployed();

    //update the clinic collection
    let result;
    try {
        result = await clinicSchema.updateOne({transactionID : transaction_id}, {$set : {patient_bch : id}}, {upsert : true});
    }catch(err) {
        res.status(400).json({message : "Could not update"});
    }

    console.log("Result: ", result);

    lms.sendIPFS(id, hash, {from: accounts[0]})
    .then((_hash, _address)=>{
        // try {
        //     await clinicSchema.updateOne({transactionID : transaction_id}, {$set : {patient_bch : id}});
        // } catch(err){
        //     res.status(400).json({message : "Error with Updating DB", err : err});
        // }
        
        return res.json({"status":"success", "generated_id" : id,"ipfs hash" : hash, "blockchain hash": _hash, "address": _address})
    })
    .catch(err=>{
        res.status(500).json({"status":"Failed", "reason":"Upload error occured"})
    });


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
        // let lms;
        // let accounts;
        // try {
        //     lms, accounts = await deploy();
        // } catch (err) {
        //     res.status(404).json({message : err});
        // }
        const accounts =  await web3.eth.getAccounts();
        const lms =  await LMS.deployed();
        let patient_blockchain = appointment[0].patient_bch;

        console.log("blockchain ID: " + patient_blockchain);

        //decrypt patient_blockchain and then access the IPFS hash

        let shared_link = "https://ipfs.infura.io:5001/api/v0/block/get?arg=";
        lms.getHash(patient_blockchain, {from: accounts[0]})
        .then(async (hash) => {
            
            //we got the hash
            shared_link += hash;

            //email the link
            let emailID = req.body.email;
            const url = "https://ipfs.infura.io:5001/api/v0/block/get?arg=" + hash
            const d = fetch(url, { method : 'POST'}).then(data => data.text()).then(data => {
                console.log(data);
                first_bracket = data.indexOf("{");
                second_bracket = data.indexOf("}");
                if (second_bracket < first_bracket) {
                    second_bracket = data.indexOf("}", first_bracket);
                } 
                data = data.substring(first_bracket, second_bracket) + "}"
                data = data.replace("\\", "");
                data = JSON.parse(data.toString());
                console.log(data);
                
                //data is an object

                data["patient"] = req.user;
                data["date"] = appointment[0].date;
                data["time"] = appointment[0].time;
                const filename = appointment[0].transactionID + ".pdf"
                const pdf = createPDF(filename, data);

                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                      user: credentials.EMAIL,
                      pass: credentials.EMAIL_PASS,
                    },
                });

                const mailOptions = {
                    from: credentials.EMAIL, // sender address
                    to: [emailID],
                    subject: "A Healthchain presciption has been shared with you! ", // Subject line
                    text: "A Healthchain presciption has been shared with You. Please check the attached file for more details.",
                    attachments: [
                        {
                            filename: filename,       
                            path: path.join(__dirname, filename),                                  
                            contentType: 'application/pdf'
                        }]
                };

                return res.status(200).json({message : "Created PDF"});

                // transporter.sendMail(mailOptions); 
            });

        })
        .catch(err => {
            res.status(404).json({message : err});
        });
    }
}

exports.all_history = async (req,res,next) => {
    let history;
    console.log("I got some history: " + req.id);
    try {
        history = await clinicSchema.find({patientId : req.id}).exec(); //should be changed to req.id
    } catch (err) {
        return res.status(404).json({message : err});
    }
    // console.log(history);
    if(history && history.length > 0) {
        console.log("I got some history !!!");
        const arr = []
        for(let h in history){
            // console.log(h);
            arr.push(history[h].transactionID);
        }
        // console.log(arr);
        return res.render("all_history", {message : "Showing Results",result : history});
        res.status(200).json({
            history : arr
        });
    } else {
        return res.status(404).json({message : "You got no history"});
    }
}

exports.history = async (req,res,next) => {
    let history;
    try {
        history = await clinicSchema.find({transactionID : req.params.id}).exec();
    } catch (err) {
        res.status(404).json({message : err});
    }
    console.log(history);
    if(history.length > 0) {
        // let lms;
        // let accounts;
        // try {
        //     lms, accounts = await deploy();
        // } catch (err) {
        //     res.status(404).json({message : err});
        // }
        console.log("Hello world");
        const accounts =  await web3.eth.getAccounts();
        const lms =  await LMS.deployed();
        // let id = history[0].patient_bch;
        let id = history[0].patient_bch;
        // let id = "3412a1e4e030";
        lms.getHash(id, {from: accounts[0]})
        .then(async (hash) => {
            // hash = "QmW7DQPyPxzVHZdCgRBLkTNvUtC1vJsxXe2QprQjaPwink";
            console.log("Getting file: " + hash);
            
            // let data;
            // try {
            //     data = await ipfs.files.get(hash);
            // } catch (err) {
            //     return res.status(400).json({error : err});
            // }
            // data = await ipfs.files.get(hash);
            // const url = "https://ipfs.infura.io:5001/api/v0/block/get?arg=QmW7DQPyPxzVHZdCgRBLkTNvUtC1vJsxXe2QprQjaPwink";
            const url = "https://ipfs.infura.io:5001/api/v0/block/get?arg=" + hash
            const d = fetch(url, { method : 'POST'}).then(data => data.text()).then(data => {
                console.log(data);
                first_bracket = data.indexOf("{");
                second_bracket = data.indexOf("}");
                if (second_bracket < first_bracket) {
                    second_bracket = data.indexOf("}", first_bracket);
                } 
                data = data.substring(first_bracket, second_bracket) + "}"
                data = data.replace("\\", "");
                data = JSON.parse(data.toString());
                console.log(data);
                return res.render("history", {message : "Showing Results", result : data, ID : req.params.id});
                // return res.status(200).json({status : "successs", data : data});
            });

            // return res.status(200).json({message : "found data"});
            // const d = fetch(url, { method : 'POST'})
            // .then(data => {
            //     // console.log(data);
            //     // console.log("data from IPFS", data.text());
            //     // return data.text();
            //     data.text();
            // })
            // .then(data => {
            //     console.log("data: ", data);
            //     data = data.substring(data.indexOf("{"), data.indexOf("}")) + "}"
            //     data = data.replace("\\", "");
            //     data = JSON.parse(data.toString());
            //     console.log(data);
            //     // return res.render("history", {message : "Showing Results",result : data});
            //     return res.status(200).json({status : "successs", data : data});
            // })
            // .catch(err => {
            //     return res.status(400).json({"error" : "reading data", "message": err});
            // });
            // const content = await data.json();
            // res.status(200).json({status : "success"});
            // res.json({"status":"success", data: JSON.parse(data[0].content.toString())})

        })
        .catch(err => {
            res.status(404).json({message : "Cannot get the file"});
        });
    } else {
        res.status(200).json({message : "You have got no history"});
    }
}