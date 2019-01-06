var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
const PGpool = require('pg').Pool;
var bodyParser = require('body-parser');
var dbconfig = require('./DBConfig.json');
POSTGRES_URI=dbconfig?dbconfig.POSTGRES_URI:process.env.DATABASE_URL;
// parse JSON inputs
app.use(bodyParser.json());

// Also, parse URL encoded inputs and 
//extended is a required option in latest versions of body parser 
//otherwise there will be a warning
app.use(bodyParser.urlencoded({ extended: true }));

var users = [];
var userSockets = {};
var con = new PGpool({
  connectionString: POSTGRES_URI,
  ssl:true,
});
app.get('/app', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.post('/signup', function (req, res) {
  con.query('SELECT name ,password FROM registration where name ="' + req.body.name + '" and password = "' + req.body.password + '"',
    function (err, rows) {
      if (err) console.log("user does not exist");//throw err;
      if (rows != undefined && rows.length > 0) {
        console.log("user already exists.")
        return res.status(200).send({
          message: "User already Exist."
        });
      } else {
        var sql = 'INSERT INTO registration(name, password) VALUES ? ';
        var values = [
          [req.body.name, req.body.password]
        ];
        con.query(sql, [values], function (err, result) {
          if (err) {
            //throw err;
            console.log("error creating user")
            return res.status(400).send({
              message: "failed to create user."
            });
          }
          console.log("Number of records inserted: " + result.affectedRows);
          return res.status(201).send({
            message: "User Created."
          });
        });
      }
    });
});

app.post('/signin', function (req, res) {
  con.query('SELECT name ,password FROM registration where name ="' + req.body.name + '" and password = "' + req.body.password + '"',
    function (err, rows) {
      if (err) console.log("user does not exist");//throw err;
      if (rows.length > 0)
        return res.status(200).send({
          message: "Authorized"
        });
    });
});


io.on('connection', function (socket) {
  socket.on("connect_user", function (username) {
    users.push({
      soketId: socket.id,
      name: username
    });
    console.log(users);
    userSockets[socket.id] = socket;
    io.emit('userlist', users, socket.id);
    console.log("one user connected" + username);
  });
  socket.on('send message', (dataString) => {
    var data = JSON.parse(dataString)
    var messageObject = {
      message: data.message,
      from_id: data.from_id
    }
    userSockets[data.to_id].emit('get message', messageObject);
    console.log(data.message);
  });
  socket.on('client message', function (msg, name) {
    if (msg === "hi") {
      fs.readFile('hi.txt', 'utf8', function (err, data) {
        if (err) throw err;
        console.log(data);
        io.emit('server message', data);
      });
    } else if (msg === "hello") {
      fs.readFile('hello.txt', 'utf8', function (err, data) {
        if (err) throw err;
        console.log(data);
        io.emit('server message', data);
      });

    } else {
      io.emit('server message', "Sorry, Invalid input!");
    }
  });
});
io.on('typing', function (socket) {
  socket.on('typing', function (type) {
    io.emit('typing', type);
  });
});
http.listen(process.env.PORT || 3000);