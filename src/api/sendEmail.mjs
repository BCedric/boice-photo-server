import express from 'express'
import fetch from 'node-fetch'
import nodemailer from 'nodemailer'

import config from '../utils/config'
import { uploadFiles } from '../shared/upload-files.mjs';

let SendEmailRouter = express.Router();

SendEmailRouter.route('/sendemail')
  .post(async function (req, res) {

    const { fields } = await uploadFiles(req)
    const { lastName, firstName, email, message, object, captchaToken } = fields

    try {
      fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${config.captchaSecretKey}&response=${fields.captchaToken}`, {
        method: 'POST',
        body: {
          secret: config.captchaSecretKey,
          response: captchaToken
        }
      })
        .then(async res => await res.json())
        .then(async json => {
          if (json.success) {
            const transporter = nodemailer.createTransport({
              host: config.mail.smtp,
              secure: false,
              auth: {
                user: config.mail.user,
                pass: config.mail.pass
              }
            });

            let mail = {
              from: `Boice Photo <${config.mail.user}>`,
              to: config.mail.mailTo,
              subject: `Boice Photo -  De ${lastName} ${firstName} - ${object}`,
              text: message,
              html:
                `<p>Message de ${lastName} ${firstName} (${email})</p>`
                + `<p>${message}</p>`
            };

            await transporter.sendMail(mail)
            res.json({ msg: 'envoie du mail avec succès' });
          } else {
            throw json['error-codes']
          }
        })
    } catch (err) {
      res.json({ err: err.toString() })
    }

  });


export default SendEmailRouter
