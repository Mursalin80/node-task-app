const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/task", auth, (req, res) => {
  let task = new Task({ ...req.body, owner: req.user._id });
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

router.get("/tasks", auth, async (req, res) => {
  let match = {},
    limit = parseInt(req.query.limit),
    skip = parseInt(req.query.skip);
  if (req.query.completed) {
    match.completed = req.query.completed === "true";
  }
  try {
    //  let task =await Task.find({owner:req.user._id}) use 2nd approce
    await req.user
      .populate({
        path: "tasks",
        match: match,
        options: {
          limit: limit ? limit : 10,
          skip: skip,
          sort: { completed: -1 } // decending order
        }
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (error) {
    res.status(500).send();
  }
});

router.patch("/task/:id", auth, async (req, res) => {
  let updates = Object.keys(req.body),
    allow = ["description", "completed"];
  let checkAllow = updates.every(val => allow.includes(val));
  if (!checkAllow) {
    return res.status(400).send({ error: "Invalid update" });
  }
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!task) {
      res.status(404).send();
    }
    updates.forEach(update => {
      task[update] = req.body[update];
    });
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

//delete

router.delete("/task/:id", auth, async (req, res) => {
  let _id = req.params.id;
  try {
    let task = await User.findByIdAndDelete({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.get("/task/:id", auth, async (req, res) => {
  let _id = req.params.id;
  try {
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(400).send();
    }
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
