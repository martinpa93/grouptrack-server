const  mongoose  = require('mongoose');
var Location = require('../models/Location');
var Message = require('../models/message');
const  Schema  =  mongoose.Schema;
const  RoomSchema  =  new Schema(
    {
      admin: {
        type: String,
        required:true,
      },
      title: {
        type: String,
        required:true,
      },
      description: {
        type: String,
        required:true,
      },
      joiners: {
        type: [ {type: String} ]
      },
      destiny: {
        type: String
      },
      destLng: {
        type: Number
      },
      destLat: {
        type: Number
      },
      arrivals: {
        type: [{type: String}]
      }
    },
    { timestamps: true }
  );

  RoomSchema.post("findOneAndDelete", async(room) => {
    if (room) {
      const deleteResult = await Location.deleteMany({
        roomId: room._id
      });
      const deleteResult2 = await Message.deleteMany({
        roomId: room._id
      });
    }
  });

const  Room  =  mongoose.model("Room", RoomSchema);
module.exports  =  Room;

