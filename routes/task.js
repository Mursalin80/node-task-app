const express = require("express");
const Task = require("../models/task");

const router = express.Router();

router.post("/task", (req, res) => {
  let task = new Task(req.body);
  task
    .save()
    .then(() => {
      res.send(task);
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

router.get("/tasks", (req, res) => {
  Task.find({})
    .then(tasks => {
      res.send(tasks);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.patch("/task/:id", async (req, res) => {
  let update = Object.keys(req.body),
    allow = ["description", "completed"];
  let checkAllow = update.every(val => allow.includes(val));
  if (!checkAllow) {
    return res.status(400).send({ error: "Invalid update" });
  }
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!task) {
      res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//delete

router.delete("/task/:id", async (req, res) => {
  let _id = req.params.id;
  try {
    let task = await User.findByIdAndDelete(_id);
    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/task/:id", (req, res) => {
  let _id = req.params.id;
  Task.findById(_id)
    .then(task => {
      if (!task) {
        res.send("No user found");
      } else {
        res.send(task);
      }
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

module.exports = router;
