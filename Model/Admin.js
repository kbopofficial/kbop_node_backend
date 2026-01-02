const mongoose=require("mongoose")

const Admin=mongoose.Schema({
  name:String,
  designation:String,
  image_path:String,
  email_id:String,
  phone:Number,
  main:Boolean
})

const ADMIN_SCHEMA = mongoose.model('ADMIN_SCHEMA', Admin);

module.exports = ADMIN_SCHEMA;