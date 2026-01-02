const mongoose=require("mongoose")

const Bus_Schema=mongoose.Schema({
    name:{type:String,default:''},
    route:{type:String,default:''},
    status:{type:String,default:''},
    image_url:{type:String,default:''},
    stops:[{type:String,default:''}],
    zone:{type:String,default:''}
})

const BUS_SCHEMA = mongoose.model('BUS_SCHEMA', Bus_Schema);

module.exports = BUS_SCHEMA;