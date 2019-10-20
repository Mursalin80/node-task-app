const express = require("express");
const app = express();
require("./db/mongoose");
const userRouter = require("./routes/user");
const taskRouter = require("./routes/task");
const router404 = require("./routes/404");

const port = process.env.PORT;

// JSON body parser
app.use(express.json());

// Routers
app.use(userRouter);
app.use(taskRouter);

// Router 404
app.use(router404);

const multer = require("multer");

let upload = multer({ dest: "images" });

app.post("/upload", upload.single("upload"), (req, res) => {
  res.send();
});

app.listen(port, () => {
  console.log("App is running in port ", port);
});
