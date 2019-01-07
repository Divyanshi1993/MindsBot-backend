var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
const PGclient = require('pg').Client;
var bodyParser = require('body-parser');
var dbconfig = require('./DBConfig.json');
POSTGRES_URI = dbconfig ? dbconfig.POSTGRES_URI : process.env.DATABASE_URL;
// parse JSON inputs
app.use(bodyParser.json());

// Also, parse URL encoded inputs and 
//extended is a required option in latest versions of body parser 
//otherwise there will be a warning
app.use(bodyParser.urlencoded({ extended: true }));

var users = [];
var userSockets = {};
var dbclient = new PGclient({
  connectionString: POSTGRES_URI,
  ssl: true,
});

dbclient.connect();

app.get('/app', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.post('/signup', function (req, res) {
  dbclient.query("SELECT name ,password FROM registration where name ='" + req.body.name + "' and password = '" + req.body.password + "'",
    function (err, result) {
      if (err) throw err;
      if(result.rows.length > 0) {
        console.log("user already exists.")
       // dbclient.end();
        return res.status(200).send({
          message: "User already Exist."
        });
      } else {
        const sql = 'INSERT INTO registration(name, password) VALUES($1, $2) ';
        const values = ['divya', 'divya'];
        dbclient.query(sql, values, function (err, result) {
          if (err) {
            console.log("error creating user"+err)
           // dbclient.end();
            return res.status(400).send({
              message: "failed to create user."
            });
          }
          if (result.rowCount > 0) {
            console.log("Number of records inserted: " + result.rowCount);
           // dbclient.end();
            return res.status(201).send({
              message: "User Created."
            });
          }
        });
      }
    });
  //dbclient.end();
});

app.post('/signin', function (req, res) {
  console.log(dbclient)
 // dbclient.connect();
  dbclient.query("SELECT name ,password FROM registration where name ='" + req.body.name + "' and password = '" + req.body.password + "'",
    function (err, rows) {
      if (err) console.log("user does not exist" + err);//throw err;
      if (rows.length > 0)
        return res.status(200).send({
          message: "Authorized"
        });
    });
   // dbclient.end();
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
