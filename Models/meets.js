
const mongoose = require('mongoose');
const meetSchema = new mongoose.Schema({
  meetingId: {
    type: String, // Can be a string or an ObjectId (choose based on your needs)
    required: true,
  },
  adminName:{
    type:String,
    required: true,
  },
  createdAt: {
    type: Date,
    default:  Date.now,
  },
});

meetSchema.index({ meetingId: 1 }); // Index on chatId for faster retrieval
module.exports = mongoose.model('Meet', meetSchema);
