const mongoose = require("mongoose");


const twitterSchema= new mongoose.Schema(
    {
        username: { type: String, required: true, trim: true },
        type: { type: Number, required: true, trim: true },
        url: { type: String, required: true, trim: true, unique: true },
        tweetID: { type: String, required: true, trim: true },                                                                                                                                                                           
    }, { timestamps: true });


module.exports = mongoose.model('twitter', twitterSchema)

// username = elonmusk
// type = 1 = tweet, 2 = retweet
// url = https://twitter.com/elonmusk/status/1668013122567786501
// tweetID = 1668013122567786501
// unique urls only allowed
// load tweetID highest to lowest in batch of 10