// Importing Web3 libraries
const Web3 = require('web3');
const contract = require('truffle-contract');
const artifacts = require('./build/Inbox.json');

if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider)
} else {
  var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'))
}

const LMS = contract(artifacts)
LMS.setProvider(web3.currentProvider)

const accounts =  web3.eth.getAccounts();
const lms =  LMS.deployed();

console.log("contracts deployed");

async function insert_into_blockchain(id, hash) {
    lms.sendIPFS(id, hash, {from : accounts[0]})
    .then()
    .catch()
}

module.exports = {
    lms : lms,
    accounts : accounts
}