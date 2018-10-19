const express = require('express');
const router = express.Router();
const fs = require('fs');
const Font = require('../models/Fonts');
const User = require('../models/Users');
const Tryout = require('../models/Tryouts');
const async = require('async');
const shortUrl = require('node-url-shortener');
const {
  ServerError,
  NotExistEmailError,
  DuplicateEmailError,
  InvalidEmailError,
  InvalidPasswordError,
  InvalidParameterError,
  NotCorrectPasswordError,
  FontNotFoundError,
  FontAlreadyExistError
} = require('../lib/errors');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const multer = require('multer');
const upload = multer();
const multerS3 = require('multer-s3');

AWS.config.update({
  accessKeyId: process.env.AWS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
AWS.config.region = 'us-east-2';
const s3 = new AWS.S3();

router.get('/fonts', (req, res, next) => {
  if (req.query.page && isNaN(Number(req.query.page))) {
    next(new InvalidParameterError('page'));
    return;
  }

  if (req.query.limit && isNaN(Number(req.query.limit))) {
    next(new InvalidParameterError('limit'));
    return;
  }

  let queryOption = {};

  if (req.query.q) {
    queryOption = {
      $or: [{ display_name: { $regex: req.query.q } }, { family: { $regex: req.query.q } }]
    };
  }

  Font.find(queryOption).then(doc => {
    const responseData = {
      page: req.query.page || 0
    };
    responseData.fonts = doc.slice(0, req.query.limit || 10).map(font => font.toObject());
    res.status(200).json(responseData);
  }).catch(err => {
    next(new ServerError());
  });
});

router.get('/font/:font_name', (req, res, next) => {
  let fontQuery = req.params.font_name.split('+').join(' ');
  Font.findOne({ family: fontQuery }).then(font => {
    if (!font) {
      next(new FontNotFoundError());
    } else {
      res.status(200).json(font);
    }
  }).catch(err => {
    next(new ServerError());
  });
});

router.post('/login', (req, res, next) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      next(new NotExistEmailError());
    } else {

      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          next(new ServerError());
        } else if (result) {
          const token = jwt.sign({
            email: user.email,
            name: user.name
          }, process.env.JWT_SECRET, {
              expiresIn: '5h'
            });
          res.status(200).json({
            message: 'Successful Login',
            token
          });
        } else {
          next(new NotCorrectPasswordError());
        }
      });

    }
  }).catch();
});

router.post('/signup', (req, res, next) => {
  User.findOne({ email: req.body.email }).then((user, err) => {
    if (err) {
      next(new ServerError());
    } else if (user) {
      next(new DuplicateEmailError());
    } else {

      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          next(new ServerError());
        } else {
          const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hash
          });

          user.save().then(newUser => {
            res.status(201).json(newUser);
          }).catch(err => {
            if (err.errors.email && err.errors.email.name === 'ValidatorError') {
              next(new InvalidEmailError());
            } else if (err.errors.password && err.errors.password.name === 'ValidatorError') {
              next(new InvalidPasswordError());
            } else {
              next(new ServerError());
            }
          });

        }
      });

    }
  });
});

router.put('/user/:user_id', (req, res, next) => {
  User.findById(req.params.user_id).then((user, err) => {
    if (err) {
      next(new ServerError());
    } else {
      const like = user.like.slice();
      like.indexOf(req.query.like) < 1 ? like.push(req.query.like) : null;
      user.like = like;
      user.save(err, result => {
        if (err) {
          next(new ServerError());
        } else {
          res.status(200).json(result);
        }
      });
    }
  }).catch();
});

router.post('/upload', upload.any(), (req, res, next) => {
  let fileName = req.files[0].originalname;
  let fontName = fileName.slice(0, fileName.lastIndexOf('.'));

  async.waterfall([
    cb => {
      s3.upload({
        ACL: 'public-read',
        Bucket: 'project-hangeul',
        Key: `${fontName}/${fileName}`,
        Body: req.files[0].buffer
      }, (err, data) => {
        if (err) {
          cb(err);
        } else {
          cb(null, data);
        }
      });
    },
    (data, cb) => {
      let fontStyleContext = `@font-face {
        font-family: "${fontName}";
        src: url("${data.Location}");
      }`;
      fs.writeFile(`./cssTemp/${fontName}.css`, fontStyleContext, err => {
        if (err) {
          cb(err);
        } else {
          cb(null);
        }
      });
    },
    (cb) => {
      fs.readFile(`./cssTemp/${fontName}.css`, (err, cssData) => {
        if (err) {
          cb(err);
        } else {
          cb(null, cssData);
        }
      });
    },
    (data, cb) => {
      s3.upload({
        ACL: 'public-read',
        Bucket: 'project-hangeul',
        Key: `${fontName}/${fontName}.css`,
        Body: data
      }, (err, fileData) => {
        if (err) {
          cb(err);
        } else {
          cb(null, fileData);
        }
      });
    },
    (data, cb) => {
      let newFont = {
        display_name: req.body.displayName,
        designer: req.body.designer,
        description: req.body.description,
        monospaced: req.body.monospaced === 'on',
        family: fontName,
        url: data.Location,
      };
      Font.findOne({ family: fontName }, (err, font) => {
        if (font) {
          //new Error => cb(Error)
          cb({
            message: 'Font Alreay Exist'
          });
        } else {
          new Font(newFont).save().then(result => {
            cb(null, result);
          });
        }
      });
    }
  ], (err, result) => {
    fs.unlinkSync(`./cssTemp/${fontName}.css`);
    if (err.message === 'Font Alreay Exist') {
      next(new FontAlreadyExistError(err.message));
    } else if (err) {
      next(new ServerError());
    } else {
      res.status(200).json(result);
    }
  });
});

router.post('/tryout/:tryout_id', (req, res, next) => {
  shortUrl.short(`https://www.naver.com`, (err, url) => {
    if (err) {
      next(new ServerError());
    } else {
      const tryout = new Tryout({
        shortend_url: url,
        html: req.body.html
      });
      
      tryout.save().then(newTryout => {
        res.status(201).json({message: 'done'});
        //db 등록 -> id -> url
      }).catch(err => {
        if (err) {
          next(new ServerError());
        }
      });
    }
  });
})

module.exports = router;
