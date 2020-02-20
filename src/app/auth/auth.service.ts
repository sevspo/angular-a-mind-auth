import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

interface AuthResData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
}

@Injectable({
  providedIn: "root"
})
export class AuthService {
  constructor(private http: HttpClient) {}

  signUp(email: string, password: string) {
    return this.http.post<AuthResData>(
      "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDvhiosZKblp1GnMp8ap4V1cNoHc0313gI",
      {
        email,
        password,
        returnSecureToken: true
      }
    );
  }
}
