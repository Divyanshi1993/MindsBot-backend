import { createServer, Server } from 'http';
import * as express from 'express';
import * as socketIo from 'socket.io';
import {Client} from 'pg';
import * as bodyParser from 'body-parser'
import { Routes } from "./Routes/routes";
var dbconfig = require('./DBConfig.json');



export class App {
    public static readonly PORT: number = 8080;
    public app: express.Application;
    private server: Server;
    private io: socketIo;
    private port: string | number;
    private Pgclient: any;
    private POSTGRES_URI = dbconfig ? dbconfig.POSTGRES_URI : process.env.DATABASE_URL;
    private routePrv: Routes = new Routes();

    constructor() {
        this.createApp();
        this.config();
        this.createServer();
        this.setupDbClient();
        this.sockets();
        this.listen();
        this.routePrv.routes(this.app);    

    }

    private createApp(): void {
        this.app = express();
    }
    private setupDbClient(): void {
        this.Pgclient = new Client({
            connectionString: this.POSTGRES_URI,
            ssl: true,
        });
        this.Pgclient.connect();
    }

    private createServer(): void {
        this.server = createServer(this.app);
    }

    private config(): void {
        this.port = process.env.PORT || App.PORT;
        this.app.use(bodyParser);
        this.app.use(bodyParser.urlencoded({ extended: true }));
    }

    private sockets(): void {
        this.io = socketIo(this.server);
    }
    private listen(): void {
        this.server.listen(this.port, () => {
            console.log('Running server on port %s', this.port);
        });
    }

    public getApp(): express.Application {
        return this.app;
    }
}export default new App().app;