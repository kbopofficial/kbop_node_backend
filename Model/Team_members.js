const mongoose=require("mongoose")

const Team=mongoose.Schema({
  name:String,
  designation:String,
  image_path:String,
  insta:String,
  facebook:String,
  others:String,
  order:Number
})

const TEAM_SCHEMA = mongoose.model('TEAM_SCHEMA', Team);

module.exports = TEAM_SCHEMA;