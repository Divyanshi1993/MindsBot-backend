import {Request, Response} from "express";
import { ChatController } from "../Controller/ChatController";


export class Routes {       
    public chatController: ChatController = new ChatController() 
    
    public routes(app): void {          
        app.route('/')
        .get((req: Request, res: Response) => {            
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            })
        }) 

        app.route('/signin')
        app.post(this.chatController.signIn);

         app.route('/signup')
        app.post(this.chatController.signup);
            
        app.route('/signout')
        app.post(this.chatController.signOut);        
    }
}