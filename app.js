var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var mysql = require('mysql');
app.get('/app', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
http.listen(9900, function(){
    console.log('listening on *:9900');
  });