const Web3 = require('web3');
const contract = require('truffle-contract');
const artifacts = require('../../build/Inbox.json');
const { lms } = require('../../web3_utils');
const IPFS = require("ipfs-http-client");
// const { doesNotMatch } = require("assert");
// const ipfs = IPFS.create();
const ipfs = IPFS({host: 'ipfs.infura.io', port: 5001, protocol: 'http'});
const shortid = require('short-id');
const fetch = require('node-fetch');

const doctorSchema = require("../models/doctors");
const patientSchema = require("../models/patients");
const clinicSchema = require("../models/clinic");
const { response } = require('express');

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
        console.log("Hello");
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

    let presciption = req.body.presciption;
    let transaction_id = req.params.transaction_id;
    const arr = [];
    if(presciption){
        for await (const item of ipfs.add(Buffer.from(JSON.stringify(presciption)))) {
            // console.log('item', item)
            arr.push(item);
            break;
        } 
    }

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
    try {
        await clinicSchema.updateOne({transactionID : transaction_id}, {$set : {patient_bch : id}});
    }catch(err) {
        res.status(400).json({message : "Could not update"});
    }

    lms.sendIPFS(id, hash, {from: accounts[0]})
    .then((_hash, _address)=>{
        clinicSchema.updateOne({transactionID : transaction_id}, {$set : {patient_bch : id}});
        res.json({"status":"success", "generated_id" : id,"ipfs hash" : hash, "blockchain hash": _hash, "address": _address})
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
        let lms;
        let accounts;
        try {
            lms, accounts = await deploy();
        } catch (err) {
            res.status(404).json({message : err});
        }
        const patient_blockchain = appointment[0].patient_bch;

        //decrypt patient_blockchain and then access the IPFS hash

        let shared_link = "https://ipfs.infure.io./arg?<hash>";
        lms.getHash(id, {from: accounts[0]})
        .then(async (hash) => {
            
            //we got the hash
            shared_link += hash;

            //email the link
            let emailID = req.body.email;

        })
        .catch(err => {
            res.status(404).json({message : err});
        });
    }
}

exports.all_history = async (req,res,next) => {
    let history;
    console.log("I got some historyc: " + req.id);
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
        let id = "c266d08a1303";
        // let id = "3412a1e4e030";
        lms.getHash(id, {from: accounts[0]})
        .then(async (hash) => {
            console.log("Getting file: " + hash);
            // let data;
            // try {
            //     data = await ipfs.files.get(hash);
            // } catch (err) {
            //     return res.status(400).json({error : err});
            // }
            // data = await ipfs.files.get(hash);
            const url = "https://ipfs.infura.io:5001/api/v0/block/get?arg=" + hash;
            const data = fetch(url, { method : 'POST'})
            .then(response => {
                return response.text();
            })
            .then(data => {
                
                data = data.replace("/", "")
                data = data.replace("\\", "");
                data = data.replace("\nL\b", "");
                data = data.slice(3, data.length -2);
                console.log(JSON.parse(data.toString()));
                res.status(200).json({status : "successs", data : JSON.parse(data.toString())});
            })
            .catch(err => {
                return res.status(400).json({"error" : err});
            });
            // const content = await data.json();
            console.log("Data: " + JSON.stringify(data));
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