const bcrypt = require("bcrypt");

module.exports = [
  {
    username: "butter_bridge",
    name: "jonny",
    avatar_url:
      "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
    email: "butter_bridge@example.com",
    password_hash: bcrypt.hashSync("password1", 10),
    role: "user",
    verified: true,
  },
  {
    username: "icellusedkars",
    name: "sam",
    avatar_url: "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
    email: "icellusedkars@example.com",
    password_hash: bcrypt.hashSync("password2", 10),
    role: "user",
    verified: true,
  },
  {
    username: "rogersop",
    name: "paul",
    avatar_url: "https://avatars2.githubusercontent.com/u/24394918?s=400&v=4",
    email: "rogersop@example.com",
    password_hash: bcrypt.hashSync("password3", 10),
    role: "admin",
    verified: true,
  },
  {
    username: "lurker",
    name: "do_nothing",
    avatar_url:
      "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
    email: "lurker@example.com",
    password_hash: bcrypt.hashSync("password4", 10),
    role: "user",
    verified: false,
  },
];
