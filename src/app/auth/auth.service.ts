import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { catchError } from "rxjs/operators";
import { throwError } from "rxjs";

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
         .pipe(catchError(this.handleError));
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
         .pipe(catchError(this.handleError));
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
