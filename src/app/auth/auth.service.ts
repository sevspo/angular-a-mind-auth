import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { throwError, Subject, BehaviorSubject } from "rxjs";
import { User } from "./user.model";
import { Router } from "@angular/router";

export interface AuthResData {
   kind: string;
   idToken: string;
   email: string;
   refreshToken: string;
   expiresIn: string;
   localId: string;
   registrered?: boolean;
}

@Injectable({
   providedIn: "root"
})
export class AuthService {
   // we also need to update if the user expires
   // we change from Subject to BehaviorSubject.
   user = new BehaviorSubject<User>(null);

   constructor(private http: HttpClient, private router: Router) {}

   signUp(email: string, password: string) {
      return this.http
         .post<AuthResData>(
            "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDvhiosZKblp1GnMp8ap4V1cNoHc0313gI",
            {
               email,
               password,
               returnSecureToken: true
            }
         )
         .pipe(
            catchError(this.handleError),
            tap(resData => {
               this.handleUserAuth(
                  resData.email,
                  resData.localId,
                  resData.idToken,
                  +resData.expiresIn
               );
            })
         );
   }

   login(email: string, password: string) {
      return this.http
         .post<AuthResData>(
            "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDvhiosZKblp1GnMp8ap4V1cNoHc0313gI",
            {
               email,
               password,
               returnSecureToken: true
            }
         )
         .pipe(
            catchError(this.handleError),
            tap(resData => {
               this.handleUserAuth(
                  resData.email,
                  resData.localId,
                  resData.idToken,
                  +resData.expiresIn
               );
            })
         );
   }

   // here again, since sign in and login share the same hangling of errors and the response, we outsourced the code form the
   // requests in separate methods.
   private handleUserAuth(email: string, userId: string, token: string, expiresIn: number) {
      // TODO: look up this section again! why creating two date objects?
      const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
      const user = new User(email, userId, token, expirationDate);
      // we call next on the subject and pass it the newly created user. it has to be an async action because it depends on the request.
      this.user.next(user);
      // store the user in case we reload the app.
      localStorage.setItem("userData", JSON.stringify(user));
   }

   // shared hadle error function
   private handleError(errorRes: HttpErrorResponse) {
      let errorMessage = "An unknown error occurred";
      if (!errorRes.error || !errorRes.error.error) {
         return throwError(errorMessage);
      }
      switch (errorRes.error.error.message) {
         case "EMAIL_EXISTS":
            errorMessage = "This email already exists";
            break;
         case "EMAIL_NOT_FOUND":
            errorMessage = "This email does not exist";
            break;
         case "INVALID_PASSWORD":
            errorMessage = "Password Wrong";
            break;
      }
      return throwError(errorMessage);
   }

   logout() {
      this.user.next(null);
      this.router.navigate(["/auth"]);
   }

   // this method will check if a user was stored in localStorage and was authenticated.

   autoLogin() {
      const userData: {
         email: string;
         userId: string;
         _token: string;
         // unlike in the class, we here only get a string, because localstorage holds strings or Json and not methods,
         // therefore it cannot hold a getter method. so we have string instead of a date object here.
         _tokenExpriationDate: string;
      } = JSON.parse(localStorage.getItem("userData"));
      if (!userData) {
         return;
      }
      // create the new user form the data
      const loadedUser = new User(
         userData.email,
         userData.userId,
         userData._token,
         new Date(userData._tokenExpriationDate)
      );

      // check the token using the getter mehtod of the user class
      // then on app componen, which is loaded early, call the method from onInit
      if (loadedUser.token) {
         this.user.next(loadedUser);
      }
   }
}
