const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 7777;
const VideoRequestData = require('./data/video-requests.data');
const UserData = require('./data/user.data');
const cors = require('cors');
const mongoose = require('./models/mongo.config');
const UsersModel = require('./models/user.model');

if (!Object.keys(mongoose).length) return;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());

app.get('/', (req, res) =>
  res.send('Welcome to semicolon academy APIs, use /video-request to get data')
);

app.post('/video-request', async (req, res, next) => {
  const { user_id } = req.query;
  const user = await UsersModel.findOne({_id: user_id});
  req.body.author_name = user.author_name;
  req.body.author_email = user.author_email;
  const response = await VideoRequestData.createRequest(req.body);
  res.send(response);
  next();
});

app.get('/video-request', async (req, res, next) => {
  const { sortBy, searchTerm, filterBy } = req.query;
  let data;
  if (searchTerm) {
    data = await VideoRequestData.searchRequests(searchTerm, filterBy);
  } else {
    data = await VideoRequestData.getAllVideoRequests(filterBy);
  }
  if (sortBy && sortBy === 'topVotedFirst') {
    data.sort((prev, next) => {
      const vote1 = prev.votes.ups.length - prev.votes.downs.length;
      const vote2 = next.votes.ups.length - next.votes.downs.length;
      if (vote1 > vote2) {
        return -1;
      } else {
        return 1;
      }
    });
  }
  res.send(data);
  next();
});

app.use(express.json());

app.get('/users', async (req, res, next) => {
  const response = await UserData.getAllUsers(req.body);
  res.send(response);
  next();

});

app.post('/users/login', async (req, res, next) => {
  console.log()
  const response = await UserData.createUser(req.body);
  res.redirect(`http://localhost:5500?id=${response._id}`);
  next();
});

app.use(express.json());

app.put('/video-request/vote', async (req, res, next) => {
  const { id, vote_type, user_id } = req.body;
  const response = await VideoRequestData.updateVoteForRequest(id, vote_type, user_id);
  res.send(response);
  next();
});

app.put('/video-request', async (req, res, next) => {
  const { id, status, resVideo } = req.body;

  const response = await VideoRequestData.updateRequest(id, status, resVideo);
  res.send(response);
  next();
});

app.delete('/video-request', async (req, res, next) => {
  const response = await VideoRequestData.deleteRequest(req.body.id);
  res.send(response);
  next();
});

app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
