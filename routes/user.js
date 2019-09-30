const express = require("express");
const User = require("../models/user");

const router = express.Router();

router.post("/user", (req, res) => {
  let user = new User(req.body);
  user
    .save()
    .then(() => {
      res.send(user);
    })
    .catch(error => {
      console.log(error);
      res.status(400).send(error);
    });
});

router.get("/users", (req, res) => {
  User.find({})
    .then(users => {
      res.send(users);
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

router.get("/user/:id", (req, res) => {
  let _id = req.params.id;
  User.findById(_id)
    .then(user => {
      if (!user) {
        res.send("No user found");
      } else {
        res.send(user);
      }
    })
    .catch(e => {
      res.status(400).send(e);
    });
});

//delete
router.delete("/user/:id", async (req, res) => {
  let _id = req.params.id;
  try {
    let user = await User.findByIdAndDelete(_id);
    if (!user) {
      return res.status(404).send();
    }

    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

// update

router.patch("/user/:id", async (req, res) => {
  let update = Object.keys(req.body),
    allow = ["name", "password", "age", "email"];
  let checkAllow = update.every(val => allow.includes(val));
  if (!checkAllow) {
    return res.status(400).send({ error: "Invalid update" });
  }
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!user) {
      res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
