const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // const token = req.body.token;
    const token = req.headers.authorization.split(' ')[1];// headers.authorization === 'Bearer ejwkqlelj~~'
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = decode;
    next();
  } catch (error) {
    res.status(401).json({
      message: '인증에 실패하였습니다.'
    })
  }
  next();
};
