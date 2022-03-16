const Web3 = require('web3');
const contract = require('truffle-contract');
const artifacts = require('../../build/Inbox.json');
const { lms } = require('../../web3_utils');

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
        // const accounts =  await web3.eth.getAccounts();
        // const lms =  await LMS.deployed();
        let lms;
        let accounts;
        try {
            lms, accounts = await deploy();
        } catch (err) {
            res.status(404).json({message : err});
        }
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
    if(presciption){
        const arr = [];
        for await (const item of ipfs.add(Buffer.from(JSON.stringify(presciption)))) {
            // console.log('item', item)
            arr.push(item);
            break;
        } 
    }

    let hash = arr[0].path;
    let lms;
    let accounts;
    let id = shortid.generate() + shortid.generate()
    try {
        lms, accounts = await deploy();
    } catch (err) {
        res.status(404).json({message : err});
    }

    //update the clinic collection
    try {
        await clinicSchema.updateOne({transactionID : transaction_id}, {$set : {patient_bch : id}});
    }catch(err) {
        res.status(400).json({message : "Could not update"});
    }

    lms.sendIPFS(id, hash, {from: accounts[0]})
    .then((_hash, _address)=>{
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
    try {
        history = await clinicSchema.find({patientId : req.id}).exec();
    } catch (err) {
        res.status(404).json({message : err});
    }
    if(history.length > 0) {
        let arr = []
        for(let h in history){
            arr.push(h.transactionID);
        }

        res.status(200).json({
            history : arr
        });
    } else {
        res.status(404).json({message : "You got no history"});
    }
}

exports.history = async (req,res,next) => {
    let history;
    try {
        history = await clinicSchema.find({transactionID : req.body.transactionID}).exec();
    } catch (err) {
        res.status(404).json({message : err});
    }

    if(history.length > 0) {
        let lms;
        let accounts;
        try {
            lms, accounts = await deploy();
        } catch (err) {
            res.status(404).json({message : err});
        }
        let id = history[0].patient_bch;
        lms.getHash(id, {from: accounts[0]})
        .then(async (hash) => {
            let data = await ipfs.files.get(hash);
            res.json({"status":"success", data: JSON.parse(data[0].content.toString())})

        })
        .catch(err => {
            res.status(404).json({message : err});
        });
    } else {
        res.status(200).json({message : "You have got no history"});
    }
}