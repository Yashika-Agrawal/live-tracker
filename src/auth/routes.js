import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state:false
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login.html",
    session: false, 
    state:false,
  }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        photo: req.user.photo,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.redirect(`/?token=${token}`);
  }
);


export default router;