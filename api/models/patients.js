const mongoose = require("mongoose");

const patientSchema = mongoose.Schema({
    _id : {type : String, required : true, unique : true},
    name : {type : String, required : true},
    email : {type : String, required : true, unique : true},
    phone : {type : Number, required : true},
    password : {type : String, required : true},
    public_key : {type: String, required:true},
    coin : {type : Number}
});

module.exports = mongoose.model("patient", patientSchema);