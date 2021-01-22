// first tutorial
const express = require('express');
const app = express(),
      bodyParser = require("body-parser");
      port = 3080;

const users = [];

app.use(bodyParser.json());

app.get('/api/users', (req, res) => {
  res.json(users[users.length - 1]);
  console.log("USERS: ", users);
});

app.post('/api/user', (req, res) => {
  const user = req.body.user;
  users.push(user);
//   res.json("user added");
res.json(users);
  console.log("USER: ", user);
});

app.get('/', (req,res) => {
    res.send('App Works !!!!');
});

app.listen(port, () => {
    console.log(`Server listening on the port::${port}`);
});