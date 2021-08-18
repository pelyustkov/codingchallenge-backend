var express = require("express");
var router = express.Router();
var routes = require("../services");

/* GET home page. */
// router.get("/", function (req, res, next) {
//   res.render("index", { title: "Express" });
// });
router.get("/get-words", getWords);

function getWords(req, res, next) {
  routes.words
    .getWords(req)
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      return next(err);
    });
}

module.exports = router;
