const mongoose=require("mongoose")

const EventSchema=mongoose.Schema({
    name:{type:String,default:''},
    image_url:{type:String,default:''},
    url:{type:String,default:''},
    order: Number,
    expiresAt: { type: Date,default:null}
})
EventSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const EVENT_SCHEMA = mongoose.model('EVENT_SCHEMA', EventSchema);

module.exports = EVENT_SCHEMA;