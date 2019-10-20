const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");
const brycpt = require("bcryptjs");

const router = express.Router();

router.post("/user", async (req, res) => {
  // let { email, password, age, name } = req.body;
  // let passHash = await brycpt.hash(password, 8);
  // let user = new User({ email, age, name, password: passHash });
  let user = new User(req.body);
  try {
    await user.save();
    sendWelcomeEmail(user.email, user.name);

    const token = await user.genAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/login", async (req, res) => {
  try {
    let user = await User.findByCredential(req.body.email, req.body.password);
    let token = await user.genAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send({ error: e });
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      token.token !== req.token;
    });

    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.post("/users/alllogout", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/users/me", auth, (req, res) => {
  res.send(req.user);
});

//delete
router.delete("/user/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    sendCancelationEmail(req.user.email, req.user.name);

    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

// update

router.patch("/user/me", auth, async (req, res) => {
  let updates = Object.keys(req.body),
    allow = ["name", "password", "age", "email"];
  let checkAllow = updates.every(val => allow.includes(val));
  if (!checkAllow) {
    return res.status(400).send({ error: "Invalid update" });
  }
  try {
    updates.forEach(update => {
      return (req.user[update] = req.body[update]);
    });

    await req.user.save();

    res.send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// file upload

let upload = multer({
  limits: {
    fileSize: 2000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }

    cb(undefined, true);
  }
});

router.post(
  "/user/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    let buffer = await sharp(req.file.buffer)
      .resize({ width: 450, height: 600 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(400).send({ error });
  }
);

router.delete("/user/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send({ e });
  }
});

module.exports = router;
