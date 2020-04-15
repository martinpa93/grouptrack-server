var Room = require('../models/room');
const fs = require('fs');

exports.createRoom = (req, res) => {
  if (!req.body) {
    return res.status(400).json({ 'msg': 'No data' });
  }
  if (req.body.joiners && (req.body.joiners.length > 8 || req.body.joiners.find(el => el === req.user.email))) {
    return res.status(400).json({ 'msg': 'The joiners field is invalid' });
  }
  const data = req.body;
  data.admin = req.user.email;
  Room.create(data, (err, query) => {
    if (err) return res.status(400).json({ 'msg': err });
    console.log(query);
    return res.status(200).json(query);
  });
}

exports.listRooms = (req, res) => {
    Room.find({  $or:[{'admin': req.user.email,}, {'joiners': req.user.email}]  }).sort({updatedAt: 'desc'}).exec((err, query) => {
    return res.status(200).json(query);
  });
}

exports.editRoom = (req, res) => {
  if (!req.body) {
    return res.status(400).json({ 'msg': 'No data' });
  }
  if (!req.params.roomId) { return res.status(400).json({ 'msg': 'invalid group' });  }
  if (req.body.joiners && (req.body.joiners.length > 8 || req.body.joiners.find(el => el === req.user.email))) {
    return res.status(400).json({ 'msg': 'The joiners field is invalid' });
  }
  Room.findById(req.params.roomId, (err, query) => {
    if (err) { console.log(err); }
    if ((query && query.admin !== req.user.email)) { return res.status(400).json({ 'msg': 'Unauthorized' }); }
    req.body.arrivals = [];
    Room.findByIdAndUpdate(req.params.roomId, req.body, {new: true}, (err, query) => {
      if (err) console.log(err);
      return res.status(200).json(query);
    });
  });
}

exports.getRoom = (req, res) => {
  if (!req.body) {
    return res.status(400).json({ 'msg': 'No data' });
  }
  if (!req.params.roomId) { return res.status(400).json({ 'msg': 'invalid group' });  }
  Room.findById(req.params.roomId, async(err, query) => {
    if (err) { console.log(err); }
    if (query && query.admin !== req.user.email && query.joiners.findIndex(el => el === req.user.email) === -1) { return res.status(400).json({ 'msg': 'Unauthorized' }); }
    return res.status(200).json(query);
  });
}

exports.deleteRoom = (req, res) => {
  if (!req.params.roomId) { return res.status(400).json({ 'msg': 'invalid group' });  }
  Room.findById(req.params.roomId, async(err, query) => {
    if (err) {  return res.status(403).json({ 'msg': err }); }
    if (!query) { return res.status(403).json({ 'msg': 'Room not found' }); }
    if (query && !query.joiners.find(el => el === req.user.email) && query.admin !== req.user.email) {  return res.status(403).json({ 'msg': 'unauthorized' }); }
    if (query && query.admin !== req.user.email && query.joiners.find(el => el === req.user.email)) {
      Room.findByIdAndUpdate({_id: req.params.roomId}, { $pullAll: {joiners: [req.user.email] }}, {new: true}, (err, query) => {
        if (err) console.log(err);
        return res.status(200).json(query);
      });
    }
    if (query && query.admin === req.user.email) { 
      Room.findByIdAndDelete(req.params.roomId, (err, query) => {
        if (err) return res.status(400).json({ 'msg': err });
        return res.status(200).json({roomId: req.params.roomId});
      });
    }
  });
}


exports.getRoomAvatars = (req, res) => {
  if (!req.params.roomId) { return res.status(400).json({ 'msg': 'invalid group' });  }
  Room.findById(req.params.roomId, async(err, query) => {
    if (err) { res.status(500).json({ msg: err}); }
    if (query && !query.joiners.find(el => el === req.user.email) && query.admin !== req.user.email) {  return res.status(403).json({ 'msg': 'unauthorized' }); }
    return res.status(200).json(buildJoiners(query));
  });
}

function buildJoiners(query) {
  const joiners = [];
  if (query && query.admin) {
    joiners.push({user: query.admin, base64image: assignAvatar(query.admin)});
    if (query.joiners && query.joiners.length > 0) {
      query.joiners.forEach(el => {
        joiners.push({user: el, base64image: assignAvatar(el)});
      });
    }
    return joiners;
  }
}

function assignAvatar(joiner) {
  const path = './files/avatars/' + joiner;
  try {
    if (fs.existsSync(path)) {
      //file exists
      const data = fs.readFileSync(path, 'base64');
      const buffer = new Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'utf8');
      const image = 'data:image/png;base64,' + buffer;
      return image;
    } else { return ''; }
  } catch(err) { return ''; }
}
