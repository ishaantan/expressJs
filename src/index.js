const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const { engine } = require("express-handlebars");
const path = require("path");
const app = express();
const route = require("./routes");
const port = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("combined"));
app.engine("hbs", engine({ extname: ".hbs" }));
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources/views"));
route(app);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
