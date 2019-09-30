const express = require("express");
const app = express();
require("./db/mongoose");
const userRouter = require("./routes/user");
const taskRouter = require("./routes/task");

const port = process.env.PORT || 3000;

// JSON body parser
app.use(express.json());

// Routers
app.use(userRouter);
app.use(taskRouter);

// Router 404
app.get("*", (req, res) => {
  res.status(404).send("No Page Found!");
});

app.listen(port, () => {
  console.log("App is running in port ", port);
});
