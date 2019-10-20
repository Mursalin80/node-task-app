const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
  .then()
  .catch(e => {
    console.log("Mongodb Connection Error.");
    console.log("Error Details: ", e);
  });
