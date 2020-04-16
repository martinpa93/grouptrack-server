
var Room = require('./models/room');
var Location  = require('./models/Location');
var Message  = require('./models/message');
var mongoose = require('mongoose');
var config = require('./config/config');
var express = require("express");
var app = express();
var server = require("http").Server(app);
var io = require("socket.io")(server);
var ioJwt   = require("socketio-jwt");
var config = require('./config/config');
var usersRooms = [];

mongoose.connect(config.db, {useNewUrlParser: true, useCreateIndex: true});
const connection = mongoose.connection;
connection.once('open', ()=> {
  console.log('Connected to Mongo DB'); 
});

server.listen('3000');

console.log('Init Socket');

io.sockets
  .on('connection', ioJwt.authorize({
    secret: `${config.jwtSecret}`,
    timeout: 15000 // 15 seconds to send the authentication message
  })).on('authenticated', (socket) => {
    let user = socket.decoded_token;
    let order = 0;

    socket.on('join room', (room) => {
      if (!room || !room.roomId) { return; } 
      Room.findById(room.roomId, (err, query) => {
        if (err) { console.log(err); }
        if (query) {
          const isJoiner = query.joiners.findIndex(el => el === user.email) > -1 ? true: false;
          const isJoinerOrAdmin = isJoiner || query.admin === user.email;
          if (!isJoinerOrAdmin) {
            socket.emit('socket unavailable');
            return;
          }
          socket.room = room.roomId;
          socket.join(socket.room, () => {
            onJoin(socket, query);
            controlUsersCon(socket, user);
            order = 1
            Location.find({roomId: socket.room, user: user.email}).sort({order:-1}).limit(1).exec((err, query) => {
              if (err) { console.log(err); }
              if (query && query[0] && query[0].order) { order = query[0].order + 1; }
            });
            console.log(user.email,'connected to room', socket.room);
          });
        }
      });
    });
    
    socket.on('leave room', () => {
      socket.leave(socket.room);
      console.log(user.email,'leave from room', socket.room);
    });

    socket.once('disconnect', () => {
      controlUsersDes(socket, user);
      console.log(user.email, 'disconnects');
    });
  
    socket.on('location', (location) => {
      if (!order) { return; }
      const loc  = new Location(location);
      loc.user = user.email;
      loc.order = order;
      loc.save();
      order++;
      io.sockets.in(socket.room).emit('location', loc);
      console.log('LOCATION', loc);
    });
  
    socket.on('message', (message) => {
      const msg = new Message(message);
      msg.user = user.email;
      msg.timestamp = Date.now();
      msg.save();
      io.sockets.in(socket.room).emit('message', msg);
      console.log('MESSAGE', msg);
    });

    socket.on('route', (route) => {
      const rte = route;
      rte.user = user.email;
      io.sockets.in(socket.room).emit('route', rte);
    });
  
    socket.on('destiny', (destiny) => {
      if (!destiny || !destiny.destiny) { }
      Room.findByIdAndUpdate(destiny.roomId, {destiny: destiny.destiny, destLng: destiny.destLng, destLat: destiny.destLat, arrivals: []}, {new: true}, (err, query) => {
        if (err) { console.log(err); }
        if (query) {
          io.sockets.in(socket.room).emit('destiny', destiny);
          console.log('DESTINY', query);
        }
      })
    });

    socket.on('arrival', (arrival) => {
      arrival.user = user.email;
      hasArrivedFn(socket, arrival);
    });
  }); 

  function controlUsersCon(socket, user) {
    if (usersRooms.length > 0 && usersRooms.findIndex((el) => el.roomId === socket.room) > -1) {
      idxRoom = usersRooms.findIndex((el) => el.roomId === socket.room);
      if (usersRooms[idxRoom].users && usersRooms[idxRoom].users.length > 0 && usersRooms[idxRoom].users.findIndex((el) => el === user.email === -1) ) {
        let idxUser = usersRooms[idxRoom].users.findIndex((el) => el === user.email);
        if (idxUser === -1) { usersRooms[idxRoom].users.push(user.email); }
        io.sockets.in(socket.room).emit('joiners', usersRooms[idxRoom].users);
      } 
    } else {
      usersRooms.push({roomId: socket.room, users: [user.email]}); 
      io.sockets.in(socket.room).emit('joiners', usersRooms[usersRooms.length-1].users);
    }
  }

  function controlUsersDes(socket, user) {
    let idxRoom = usersRooms.findIndex((el) => el.roomId === socket.room);
    if (idxRoom === -1) { return; }
    let idxUser = usersRooms[idxRoom].users.findIndex((el) => el === user.email);
    if (usersRooms[idxRoom].users.length === 1 && idxUser === 0) {
      usersRooms.splice(idxRoom, 1);
      io.sockets.in(socket.room).emit('joiners', []);
      console.log(usersRooms);
    } else {
      usersRooms[idxRoom].users.splice(idxUser, 1);
      io.sockets.in(socket.room).emit('joiners', usersRooms[idxRoom].users);
      console.log(usersRooms[idxRoom].users);
    }
  }

  function onJoin(socket, query) {
    //Emit locations, destiny and arrivals each time to connect or reconnect
    socket.emit('destiny', query);
    socket.emit('arrival', query.arrivals);
    Location.find({roomId: socket.room}, (err, r) => {
      if (err) socket.emit('socket unavailable');
      socket.emit('locations', r);
    });
  }

  function hasArrivedFn(socket, arrival) {
    let hasArrived = false;
    Room.findById(socket.room, (err, query) => {
      if (err) { console.log(err); }
      if (query) {
        hasArrived = query.arrivals.find(el => el === arrival.user) ? true: false;
        if (hasArrived) {
          console.log(`${arrival.user} has arrived already`);
          return;
        }
        Room.findByIdAndUpdate(arrival.roomId, { $push: { arrivals: arrival.user}}, {new: true}, (err, query) => {
          if (err) { console.log(err); }
          if (query) {
            io.sockets.in(socket.room).emit('arrival', query.arrivals)
            console.log('Arrival', query.arrivals);
          }
        });
      }
    });
  }