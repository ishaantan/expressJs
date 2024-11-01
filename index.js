const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const { base64url } = require("./helpers");
const app = express();
const port = 3000;

app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const jwtSecret =
  "rEmjm11luf9eNrxE2bUZ4zcEd+J3MmFB98kHuokYbU0D/KNif0LnEdGLGgPvzRpPBnl8gCgWx+Yqz5GsoAHVLEgeMMhq6u80kec5YoNvOwa7j4bgY5osw1xK1/nrT3vVNshqytfmjr4Z9Hh8bgRpgar2Zdl1Ri4Nh5Q5ubum5X9mJPmd0UXiKqcb5TKjC6Kr8WBbnu7zn5p0LmgQcMVjAfN3lFTztRVbNQcBh50ZpA2a2dlQBrsN7t3VFZ3W0PeRwtljnYAntiBZVfg+1Y3Sqw54Af9LZcT7xeM22G5StMloJsh1buPG/nOHobky1GY6FwXzOyGL7onuQeMzCHY6ZA==";
//Session
const sessions = {};

//Fake BD
const db = {
  users: [
    {
      id: 1,
      email: "ishaan@gmail.com",
      password: "123456",
      name: "Ishaan Hoang",
    },
  ],
  posts: [
    {
      id: 1,
      title: "title_1",
      description: "description 1",
    },
    {
      id: 2,
      title: "title_2",
      description: "description 2",
    },
    {
      id: 3,
      title: "title_3",
      description: "description 3",
    },
  ],
};

app.get("/", (req, res) => {
  res.render("pages/index");
});

// login
app.get("/login", (req, res) => {
  res.render("pages/login");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(
    (user) => user.email === email && user.password === password,
  );
  if (user) {
    const sessionId = Date.now().toString();
    sessions[sessionId] = {
      userId: user.id,
    };
    res
      .setHeader("Set-Cookie", `sessionId=${sessionId}; max-age-3600; httpOnly`)
      .redirect("/dashboard");
    return;
  }
  res.send("error use, password");
});

// Dashboard
app.get("/dashboard", (req, res) => {
  const session = sessions[req.cookies.sessionId];
  if (!session) {
    return res.redirect("/login");
  }
  const user = db.users.find((user) => user.id === session.userId);
  res.render("pages/dash-board", { user });
});

// logout
app.get("/logout", (req, res) => {
  delete sessions[req.cookies.sessionId];
  res.setHeader("Set-Cookie", "sessionId=; max-age=0").redirect("/login");
});

//get posts
app.get("/api/posts", (req, res) => {
  res.json(db.posts);
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(
    (user) => user.email === email && user.password === password,
  );
  if (!user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const header = {
    alg: "HS256",
    type: "JWT",
  };
  const payload = {
    sub: user.id,
    exp: Date.now() + 3600000,
  };
  const endCodeHeader = btoa(JSON.stringify(header));
  const endCodePayload = btoa(JSON.stringify(payload));
  const tokenData = `${endCodeHeader}.${endCodePayload}`;
  const hmac = crypto.createHmac("sha256", jwtSecret);
  const signature = hmac.update(tokenData).digest("base64url");
  res.json({
    token: `${tokenData}.${signature}`,
  });
});

// [GET] /api/auth/me
app.get("/api/auth/me", (req, res) => {
  const token = req.headers.authorization?.slice(7);
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  const [encodedHeader, encodedPayload, tokenSignature] = token.split(".");
  const tokenData = `${encodedHeader}.${encodedPayload}`;
  const hmac = crypto.createHmac("sha256", jwtSecret);
  const signature = hmac.update(tokenData).digest("base64url");
  if (signature === tokenSignature) {
    const payload = JSON.parse(atob(encodedPayload));
    const user = db.users.find((user) => user.id === payload.sub);
    if (!user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    return res.json(user);
  }
  res.json(null);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
