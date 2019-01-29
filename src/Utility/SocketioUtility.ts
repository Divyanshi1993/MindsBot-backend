
import { createServer, Server } from 'http';
import * as socketIo from 'socket.io';
import * as fs from 'fs';
import  {UserList} from '../Model/userlist'


export class SocketIoUtility {
    private io: socketIo;
    private server: Server;
    public usrlist = new UserList().getUser;
    private userSockets = {};
    public socketIoInit(app) {
        this.server = createServer(app);
        this.io = socketIo(this.server);

        this.io.on('connection', (socket) => {

            socket.on("connect_user", function (username) {

                if (!isConected(username)) {
               this.usrlist.push({
                        soketId: socket.id,
                        name: username
                    });
                }
                this.userSockets[socket.id] = socket;
                this.io.emit('userlist', this.usrlist, socket.id);
                console.log("one user connected " + username + " socket id is " + socket.id);
                console.log(this.usrlist);
            });
            function isConected(username) {
                if (this.usrlist.length > 0) {
                    for (var i in this.usrlist) {
                        if (this.usrlist[i].name === username) {
                            this.usrlist[i].soketId = socket.id;
                            return true;
                        }
                    }
                    return false;
                }
            }
            socket.on('send message', (dataString) => {
                var data = JSON.parse(dataString)
                var messageObject = {
                    message: data.message,
                    from_id: data.from_id
                }
                console.log("message sending");
                this.userSockets[data.to_id].emit('get message', messageObject);
                console.log(data.message + "   msg send to  " + data.to_id + "  from " + data.from_id);
            });
            socket.on('client message', function (msg, name) {
                if (msg === "hi") {
                    fs.readFile('hi.txt', 'utf8', function (err, data) {
                        if (err) throw err;
                        console.log(data);
                        socket.emit('server message', data);
                    });
                } else if (msg === "hello") {
                    fs.readFile('hello.txt', 'utf8', function (err, data) {
                        if (err) throw err;
                        console.log(data);
                        socket.emit('server message', data);
                    });

                } else {
                    this.io.emit('server message', "Sorry, Invalid input!");
                }
            });
        });
        this.io.on('typing', function (socket) {
            socket.on('typing', function (type) {
                this.io.emit('typing', type);
            });
        });
    }
}