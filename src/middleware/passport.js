var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var config = require('../config/config');
var User = require('../models/User');

var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('JWT'),
  secretOrKey: config.jwtSecret
}

module.exports = new JwtStrategy(opts,  (jwt_payload, done) => {
  User.findOne({email:jwt_payload.email}, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  });
});