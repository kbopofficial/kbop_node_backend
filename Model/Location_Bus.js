const mongoose=require("mongoose")

const Location_Bus_Schema=mongoose.Schema({
    name:{type:String,default:''},
    route:{type:String,default:''},
    status:{type:String,default:''},
    image_url:{type:String,default:''},
    enable:{type:Boolean, default:true},
    firstservice:{type:Number,default:null},
    lastservice:{type:Number,default:null},
    stops: [
        {
          stop: { type: String, default:''},
          coordinate: {
            type: [Number],
            validate: {
              validator: function (val) {
                return val === null || (Array.isArray(val) && val.length === 2);
              },
              message: "Coordinates must be null or an array of two numbers [lat, lng]"
            },
            default: null
          }
        }
      ],
    zone:{type:String,default:''}
})

const Location_BUS_SCHEMA = mongoose.model('Location_BUS_SCHEMA', Location_Bus_Schema);

module.exports = Location_BUS_SCHEMA;