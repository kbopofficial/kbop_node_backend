const mongoose=require("mongoose")

const News_Schema=mongoose.Schema({
    image_url:String,
    url:String,
    news:String,
    order:Number
})

const NEWS_SCHEMA = mongoose.model('NEWS_SCHEMA', News_Schema);

module.exports = NEWS_SCHEMA;