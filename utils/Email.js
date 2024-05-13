const nodemailer = require('nodemailer');

const sendEmail = async(Option) => {
    // CREATE A TRANSPORTER
    const transporter = nodemailer.createTransport({
        host : process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    })
    const emailOptions = {
        from: 'Cinefix support<support@cinefix.com>',
        to: Option.email,
        subject:Option.subject,
        text: Option.message
    }
     await transporter.sendMail(emailOptions);
}
module.exports = sendEmail;