
import * as model from '../Model/User'
export class UserList {
 private users: model.User[] = [];
 public getUser ():model.User[]{
   return this.users;
 }
}
