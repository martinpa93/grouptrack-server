var express = require('express'),
    routes = express.Router();
    var userController = require('./controller/user-controller');
    var roomController = require('./controller/room-controller');
    var locationController = require('./controller/location-controller');
    var messageController = require('./controller/message-controller');
    var passport = require('passport');

    routes.get('/', (req, res) => {
      return res.send('hello, this is the API')
    })

    routes.post('/register', userController.registerUser);
    routes.post('/login', userController.loginUser);
    routes.get('/image',  passport.authenticate('jwt', { session: false }), (req, res) => {
      userController.getImage(req, res);
    });
    routes.post('/upload',  passport.authenticate('jwt', { session: false }), (req, res) => {
      userController.uploadImageUser(req, res);
    });
    routes.get('/suggestionUsers',  passport.authenticate('jwt', { session: false }), (req, res) => {
      userController.suggestionUsers(req, res);
    });
    routes.post('/room', passport.authenticate('jwt', { session: false }), (req, res) => {
      roomController.createRoom(req, res);
    });
    routes.get('/rooms', passport.authenticate('jwt', { session: false }), (req, res) => {
      roomController.listRooms(req, res);
    });
    routes.get('/room/:roomId', passport.authenticate('jwt', { session: false }), (req, res) => {
      roomController.getRoom(req, res);
    });
    routes.get('/room-avatars/:roomId', passport.authenticate('jwt', { session: false }), (req, res) => {
      roomController.getRoomAvatars(req, res);
    });
    routes.put('/room/:roomId', passport.authenticate('jwt', { session: false }), (req, res) => {
      roomController.editRoom(req, res);
    });
    routes.delete('/room/:roomId', passport.authenticate('jwt', { session: false }), (req, res) => {
      roomController.deleteRoom(req, res);
    });
    routes.get('/userLocations/:roomId', passport.authenticate('jwt', { session: false }), (req, res) => {
      locationController.getUserLocations(req, res);
    }); 
    routes.post('/location/:roomId',  passport.authenticate('jwt', { session: false }), (req, res) => {
      locationController.getLocation(req, res);
    });
    routes.get('/chat/:roomId',  passport.authenticate('jwt', { session: false }), (req, res) => {
      messageController.getMessages(req, res);
    });

    module.exports = routes;