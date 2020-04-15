var Message = require('../models/message');

exports.getMessages = (req, res) => {
  Message.find({roomId: req.params.roomId}, (err, r) => {
    if (err) return res.status(400).json({ 'msg': err });
    return res.status(200).json(r);
  });
}

