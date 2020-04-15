const  mongoose = require('mongoose');
const  Schema = mongoose.Schema;
const  MessageUser = new Schema(
    {
      roomId: {
        type: String,
        required: true
      },
      user: {
        type: String,
        required: true
      },
      message: {
        type: String,
        required: true
      },
      timestamp: {
        type: Number,
        required: true
      },
    }
  );

const  Message = mongoose.model("Message", MessageUser);
module.exports = Message;