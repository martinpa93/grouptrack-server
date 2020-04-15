var Location = require('../models/Location');

exports.getLocations = (req, res) => {
  Location.find({roomId: req.params.roomId}, (err, r) => {
    if (err) return res.status(400).json({ 'msg': err });
    return res.status(200).json(r);
  });
}

exports.getUserLocations = (req, res) => {
  Location.find({roomId: req.params.roomId, user: req.query.user}, (err, r) => {
    if (err) return res.status(400).json({ 'msg': err });
    return res.status(200).json(r);
  });
}

exports.getLocation = (req, res) => {
  Location.findById(req.body.id, (err, r) => {
    if (err) return res.status(400).json({ 'msg': err });
    return res.status(200).json(r);
  });
}
