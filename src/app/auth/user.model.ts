export class User {
   constructor(
      public email: string,
      public userId: string,
      private _token: string,
      private _tokenExpriationDate: Date
   ) {}

   // since the token is a private field, we define a getter method to access it only if there is a date (a token exists)
   // and it has not already expired.
   get token() {
      if (!this._tokenExpriationDate || new Date() > this._tokenExpriationDate) {
         return null;
      }
      return this._token;
   }
}
