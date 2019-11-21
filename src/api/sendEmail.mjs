import express from 'express'
import nodemailer from 'nodemailer'
import request from 'request'

import config from '../utils/config'

let SendEmailRouter = express.Router();

const secretKey = '6LfNfjoUAAAAAP8XWyo1-lyspeqsa1AyyydzT2-P'

SendEmailRouter.route('/sendemail')
  .post(function (req, res) {
    const { nom, prenom, email, message, sujet } = req.body

    var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
    request(verificationUrl, function (error, response, body) {
      body = JSON.parse(body);
      console.log(req.connection.remoteAddress);
      // Success will be true or false depending upon captcha validation.
      if (body.success !== undefined && !body.success) {
        let transporter = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: config.addressMail,
            pass: config.passMail
          }
        });
        let mail = {
          from: `Boice Photo <${config.addressMail}>`, // sender address
          to: 'bois.cedric2303@gmail.com', // list of receivers
          subject: `Boice Photo -  De ${nom} ${prenom} - ${sujet}`, // Subject line
          text: message, // plain text body
          html:
            `<p>Message de ${nom} ${prenom} (${email})</p>`
            + `<p>${message}</p>` // html body
        };

        transporter.sendMail(mail, function (error, response) {
          if (error) {
            console.log("Erreur lors de l'envoie du mail!");
            return res.send(error);
          } else {
            return res.json({ "responseCode": 1, "responseDesc": "Failed captcha verification" });
          }
          transporter.close();
        })
      }
      res.json({ "responseCode": 0, "responseDesc": "Sucess" });
    });
  });


export default SendEmailRouter
