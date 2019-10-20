const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const msg = {
//   to: "m.mursalin80@gmail.com",
//   from: "mursalin80@hotmail.com",
//   subject: "Sending with Twilio SendGrid is Fun",
//   text: "and easy to do anywhere, even with Node.js",
//   html: "<strong>and easy to do anywhere, even with Node.js</strong>"
// };

// sgMail.send(msg);

const sendWelcomeEmail = async (email, name) => {
  sgMail.send({
    to: email,
    from: "m.mursalin80@gmail.com",
    subject: "Thanks for joining in!",
    text: `Welcome to the app, ${name}. Let me know how you get along with the app.`
  });
};

const sendCancelationEmail = async (email, name) => {
  sgMail.send({
    to: email,
    from: "m.mursalin80@gmail.com",
    subject: "Sorry to see you go!",
    text: `Goodbye, ${name}. I hope to see you back sometime soon.`
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelationEmail
};
