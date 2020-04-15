const  mongoose  = require('mongoose');
const  Schema  =  mongoose.Schema;
const  LocationUser  =  new Schema(
    {
      roomId: {
        type: String,
        required: true
      },
      user: {
        type: String,
        required: true
      },
      order: {
        type: Number,
      },
      lng: {
        type: Number,
        required: true
      },
      lat: {
        type: Number,
        required: true
      },
      heading: {
        type: Number
      },
      speed: {
        type: Number
      },
      maxSpeed: {
        type: Number
      },
      battery: {
        type: Number
      },
      model: {
        type: String
      },
      address: {
        type: String
      },
      distance: {
        type: Number
      },
      accuracy: {
        type: Number,
        required: true
      },
      timestamp: {
        type: Number,
        required: true
      }
    } 
  );

const  Location  =  mongoose.model("Location", LocationUser);
module.exports  =  Location;