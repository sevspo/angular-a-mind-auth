import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError, tap } from "rxjs/operators";
import { throwError, Subject } from "rxjs";
import { User } from "./user.model";

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
   user = new Subject<User>();
   constructor(private http: HttpClient) {}

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

   private handleUserAuth(email: string, userId: string, token: string, expiresIn: number) {
      const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
      const user = new User(email, userId, token, expirationDate);
      this.user.next(user);
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
}
