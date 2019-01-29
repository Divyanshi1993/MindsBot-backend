
import { Request, Response } from 'express';
import {Client} from 'pg';
var dbconfig = require('./DBConfig.json');
import  {UserList} from '../Model/userlist'

export class ChatController{
    public dbclient: any;
    public users = new UserList().getUser;
    private POSTGRES_URI = dbconfig ? dbconfig.POSTGRES_URI : process.env.DATABASE_URL;
    private setupDbClient(): void {
        this.dbclient = new Client({
            connectionString: this.POSTGRES_URI,
            ssl: true,
        });
        this.dbclient.connect();
    }
    public signup(req: Request, res: Response) {
        this.dbclient.query("SELECT * FROM registration where name ='" + req.body.name + "'",
          function (err, result) {
            if (err) throw err;
            if(result.rows.length > 0) {
              console.log("user already exists.")
             // dbclient.end();
              return res.status(400 ).send({
                message: "User already Exist."
              });
            } else {
              const sql = 'INSERT INTO registration(name, password, loggedin) VALUES($1, $2,$3) ';
              const values = [req.body.name , req.body.password,false];
              this.dbclient.query(sql, values, function (err, result) {
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
      }
      public signOut(req: Request, res: Response) {
        const sql= "UPDATE registration SET loggedin = 'false' WHERE name ='" + req.body.name + "'";
              //const sql = 'INSERT INTO registration(name, password, loggedin) VALUES($1, $2,$3) ';
             // const values = [req.body.name ,true];
              this.dbclient.query(sql, function (err, result) {
                if (err) {
                 
                 // dbclient.end();
                  return res.status(400).send({
                    message: "failed update."
                  });
                }
                if (result.rowCount > 0) {
                  console.log("sign out")
                  for (var i in this.users) {
                    if(this.users[i].name === req.body.name){
                       this.users.splice(i,1);
                    }
                   }
                  return res.status(201).send({
                    message: "logged out."
                  });
                }
         });
      }
      public signIn(req: Request, res: Response) {
       console.log(this.dbclient)
       // dbclient.connect();
        this.dbclient.query("SELECT name , password, loggedin FROM registration where name ='" + req.body.name + "' and password = '" + req.body.password + "'",
          function (err, result) {
            if (err) console.log("user does not exist" + err);//throw err;
            if (result.rowCount > 0){
              if(result.rows[0].loggedin === false){
              const sql= "UPDATE registration SET loggedin = 'true' WHERE name ='" + req.body.name + "'";
              this.dbclient.query(sql, function (err, row) {
                if (err) { console.log("error creating user"+err) }
                if (row.rowCount > 0) {
                  console.log("sign in")
                  return res.status(200).send({
                    message: "Authorized"
                  });
                }
                else{
                  return res.status(404).send({
                    message: "User Already Loggedin"
                  });
                }
              }); 
             
            }
            else{
              console.log("already loggedin")
              return res.status(201).send({
                message: " already loggedin"
                });
               }
               
           }else {
              return res.status(404).send({
                message: "UnAuthorized"
              });
            }
          });
         // dbclient.end();
      
}
}