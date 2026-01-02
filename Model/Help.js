const mongoose=require("mongoose")

const help=mongoose.Schema({
    info:{type:String,default:''},
    url:{type:String,default:''},
})

const Help_Schema = mongoose.model('Help_Schema', help);

module.exports = Help_Schema;