import { Router } from "express";

import * as configFns from "../helpers/configFns";

import * as usersDB from "../helpers/usersDB";

const router = Router();


const getSafeRedirectURL = (possibleRedirectURL: string = "") => {

  if (possibleRedirectURL.startsWith("/")) {
    return possibleRedirectURL;
  } else {
    return "/dashboard";
  }
};


router.route("/")
  .get((req, res) => {

    const sessionCookieName = configFns.getProperty("session.cookieName");

    if (req.session.user && req.cookies[sessionCookieName]) {

      const redirectURL = getSafeRedirectURL((req.query.redirect || "") as string);

      res.redirect(redirectURL);

    } else {

      res.render("login", {
        userName: "",
        message: "",
        redirect: req.query.redirect
      });
    }
  })
  .post((req, res) => {

    const userName = req.body.userName;
    const passwordPlain = req.body.password;

    const redirectURL = getSafeRedirectURL(req.body.redirect);

    const userObj = usersDB.getUser(userName, passwordPlain);

    if (userObj) {

      req.session.user = userObj;

      res.redirect(redirectURL);

    } else {

      res.render("login", {
        userName,
        message: "Login Failed",
        redirect: redirectURL
      });
    }
  });


export = router;
