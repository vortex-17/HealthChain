const mongoose = require("mongoose");


const clinicSchema = mongoose.Schema({
    transactionID : {type: String, required: true, unique : true},
    patientId : {type : String, required : true},
    doctorId : {type  : String, required : true},
    doctorName : {type : String},
    patientName: {type: String},
    date : {type : String, required : true},
    time : {type : Number, required : true},
    patient_bch : {type: String}, //Can allow users to access data from blockchain -> IPFS
});

module.exports = mongoose.model("clinic", clinicSchema);