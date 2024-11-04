class NewController {
  // [GET] /news
  index(req, res) {
    res.render("news");
  }

  show(req, res) {
    res.render("detail");
  }
}

module.exports = new NewController();
