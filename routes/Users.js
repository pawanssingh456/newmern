var crypto = require("crypto");
const express = require("express");
const users = express.Router();
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const nodemailer = require('nodemailer');
const BCRYPT_SALT_ROUNDS = 12;
require('dotenv').config();

const User = require("../models/User")
users.use(cors())
process.env.SECRET_KEY = 'secret'

users.post('/register', (req,res) => {
    const today = new Date()
    const userData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        confirmed: req.body.confirmed,
        created: today
    }

    const token = crypto.randomBytes(20).toString('hex');

    const output = `
    <p>You have a SignUp Request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Email: ${req.body.email}</li>
    </ul>
    <h3>Message</h3>
    <p>Click <a href="http://localhost:3000/register/${token}">here</a> to activate.</p>
  `;

  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    },
    tls:{
        rejectUnauthorized:false
  }
});

let mailOptions = {
    from: '"MERN Demo" <pawanssingh456@gmail.com>',
    to: req.body.email,
    subject: 'Confirmation Email!',
    text: 'This is confirmation Email.',
    html: output
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log(error);
    }
    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
});

    User.findOne({
        email: req.body.email
    })
    .then(user => {
        if(!user) {
            bcrypt.hash(req.body.password, 10, (err,hash) =>{
                userData.password = hash
                User.create(userData)
                .then(user => {
                    res.json({status: user.email + 'registered.'})
                })
                .catch(err => {
                    res.send('error: ' + err)
                })
            })
        }
        else{
            res.json({error: 'user exists'})
        }
    })
    .catch(err => {
        res.send('error: ' + err)
    })
})

users.post('/login', (req,res) => {
    User.findOne({
        email: req.body.email
    })
    .then(user => {
        if(!user.confirmed)
        {
            res.json('confirm your email'); 
        }
        else{
        if(user) {
            if(bcrypt.compareSync(req.body.password, user.password)) {
                const payload = {
                    _id: user._id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email
                }
                const token = jwt.sign(payload, process.env.SECRET_KEY, {
                    expiresIn : 1440
                })
                res.send(token)
            }
            else{
                res.json('passwords do not match');
            }
        }
        else{
            res.json('bad username');
        }
    }
    })
    .catch(err => {
        res.send('error: ' + err)
    })
})

users.get('/profile', (req, res) => {
    var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)

    User.findIne({
        _id: decoded._id
    })
    .then(user => {
        if(user){
            res.json(user)
        }
        else
        {
            res.send("user does not exist")
        }
    })
    .catch(err => {
        res.send('error: ' + err)
    })
})

users.post('/forgotpassword', (req, res) => {
    if (req.body.email === '') {
      res.json('email required');
    }
    console.log(req.body.email);
    User.findOne({
        email: req.body.email
    })
    .then(user => {
      if (user === null) {
        console.log('email not in database');
        res.json('email not in db');
      } 
      else {
        const token = crypto.randomBytes(20).toString('hex');

        user.update({
            resetPasswordToken: token,
            resetPasswordExpires: Date.now() + 360000,
          });

                const output = `
                <p>Click <a href="http://localhost:3000/reset/${token}">here</a> to reset password.</p>
            `;

            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GMAIL_PASS
                },
                tls:{
                    rejectUnauthorized:false
            }
            });

            let mailOptions = {
                from: '"MERN Demo" <pawanssingh456@gmail.com>',
                to: req.body.email,
                subject: 'Reset Email!',
                text: 'This is Reset Email.',
                html: output
            };

            transporter.sendMail(mailOptions, function(err, response) {
                if (err) {
                  console.error('there was an error: ', err);
                } else {
                  console.log('here is the res: ', response);
                  res.status(200).json('recovery email sent');
                }
              });
      }
    })
    .catch(err => {
        res.send('error: ' + err)
    })
  });

//forgot password ends

//reset password

users.get('/reset', (req, res, next) => {
    User.findOne({
        resetPasswordToken: req.body.resetPasswordToken,
        resetPasswordExpires: {
          [Op.gt]: Date.now(),
        }
    }).then(user => {
      if (user == null) {
        console.log('password reset link is invalid or has expired');
        res.json('password reset link is invalid or has expired');
      } else {
        res.status(200).send({
          username: user.username,
          message: 'password reset link a-ok',
        });
      }
    });
} );

//reset password ends

//update password

users.put('/updatePassword', (req, res, next) => {
    User.findOne({
        email: req.body.email,
    }).then(user => {
      if (user != null) {
        console.log('user exists in db');
        bcrypt
          .hash(req.body.password, BCRYPT_SALT_ROUNDS)
          .then(hashedPassword => {
            user.update({
              password: hashedPassword,
              resetPasswordToken: null,
              resetPasswordExpires: null,
            });
          })
          .then(() => {
            console.log('password updated');
            res.status(200).send({ message: 'password updated' });
          });
      } else {
        console.log('no user exists in db to update');
        res.status(404).json('no user exists in db to update');
      }
    });
  });

//update password ends

module.exports = users