const mongoose = require("mongoose");

const doctorSchema = mongoose.Schema({
    _id : {type : String, required : true, unique : true},
    name : {type : String, required : true},
    email : {type : String, required : true, unique : true},
    phone : {type : Number, required : true},
    type : {type : String, required : true}, //displays the type of doctor
    password : {type : String, required : true}
});

module.exports = mongoose.model("doctor", doctorSchema);