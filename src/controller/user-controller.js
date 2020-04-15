var User = require('../models/User');
var jwt = require('jsonwebtoken');
var config = require('../config/config');
const fs = require('fs');

function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret, {
    expiresIn: '5h'
  })
}

exports.registerUser = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ 'msg': 'You need to send email and password' })
  }

  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(400).json({ 'msg': err });
    if (user) return res.status(400).json({ 'msg': 'The user already exists'});
    let newUser = User(req.body);
    newUser.save((err, user) => {
      if (err) return res.status(400).json({ 'msg': err })
      console.log('User created', user);
      return res.status(201).json(user);
    })
  })
}

exports.loginUser = (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).json({ 'msg': 'You need to send email and password' })
  }

  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(400).json({ 'msg': err });
    if (!user) return res.status(400).json({ 'msg': 'The user does not exist'});
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (isMatch && !err) {
        return res.status(200).json({
          token: createToken(user)
        });
      } else {
        return res.status(400).json({
          msg: 'The email and password does not match'
        });
      }
    });
  });
}

exports.suggestionUsers = (req, res) => {
  User.find({email: {$regex : `.*${req.query.email}.*`}}, ['email'], ( err, users) => {
    if (err) return res.status(400).json({ msg: 'No query param' });
    return res.status(200).json(users);
  })
}

exports.uploadImageUser = (req, res) => {
  if (!req || !req.body.base64image) { return res.status(400).json({msg: 'File not found'}) }
  var matches = req.body.base64image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
  response = {};
  
  if (!matches || matches.length !== 3) {
    return res.status(400).json({error: 'Error with the image format'});
  }
  
  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');
  let decodedImg = response;
  let imageBuffer = decodedImg.data;
  try {
    fs.writeFileSync('./files/avatars/' + req.user.email, imageBuffer, 'base64');
    return res.send({status: 'success'});
  } catch (e) {
    return res.status(400).json({status: 'failed'});
  }
}

exports.getImage = (req, res) => {
  const path = './files/avatars/' + req.user.email;
  try {
    if (fs.existsSync(path)) {
      //file exists
      const data = fs.readFileSync(path, 'base64');
      const buffer = new Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'utf8');
      const image = 'data:image/png;base64,' + buffer;
      return res.status(200).json({base64image: image});
    } else { return res.status(200).json(); }
  } catch(err) {
    return res.status(500);
  }
}