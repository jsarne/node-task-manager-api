const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM,
    subject: 'Thanks for joining!',
    text: `Welcome to the Task App ${name}!`
  }).then(() => {console.log('welcome email sent')}, error => {
    console.error(error);
    if (error.response) {
      console.error(error.response.body)
    }
  });
};

const sendGoodbyeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.SENDGRID_FROM,
    subject: 'Sorry to see you go',
    text: `So long, ${name}. Reply to tell us what we could have done to keep you.`
  }).then(() => {console.log('goodbye email sent')}, error => {
    console.error(error);
    if (error.response) {
      console.error(error.response.body)
    }
  });
};

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeEmail
};
