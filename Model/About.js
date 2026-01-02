const mongoose=require("mongoose")

const about=mongoose.Schema({
    about:{type:String,default:''},
    version:{type:String,default:''},
})

const About_Schema = mongoose.model('About_Schema', about);

module.exports = About_Schema;