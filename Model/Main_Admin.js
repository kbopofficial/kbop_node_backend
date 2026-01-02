const mongoose=require("mongoose")

const MainAdmin=mongoose.Schema({
  name:String,
  designation:String,
  image_path:String,
  email_id:String,
  phone:Number,
})

const MAIN_ADMIN_SCHEMA = mongoose.model('MAIN_ADMIN_SCHEMA', MainAdmin);

module.exports = MAIN_ADMIN_SCHEMA;