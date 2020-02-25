import { Component } from "@angular/core";
import { Form, NgForm } from "@angular/forms";
import { AuthService, AuthResData } from "./auth.service";
import { Observable } from "rxjs";
import { Router } from "@angular/router";

@Component({
   selector: "app-auth",
   templateUrl: "./auth.component.html"
})
export class AuthComponent {
   isLoginMode = true;
   isLoading = false;
   // another example why null: if you had an empty string, that would be the error!
   error: string = null;

   constructor(private route: Router, private authService: AuthService) {}

   onSwitchMode() {
      this.isLoginMode = !this.isLoginMode;
   }

   onSubmit(form: NgForm) {
      // Double check if form is valid, if someone tampered with it
      if (!form.valid) {
         return;
      }

      // could we also use destructing here?
      const email = form.value.email;
      const password = form.value.password;

      this.isLoading = true;

      // we refactored this section to be shorter. we subscribe to the login or the sign-
      // up ovservable after the if statement by signing up to the authObs variable. It will have a
      // value after the if statement has run.
      let authObs: Observable<AuthResData>;

      if (this.isLoginMode) {
         authObs = this.authService.login(email, password);
      } else {
         authObs = this.authService.signUp(email, password);
      }

      authObs.subscribe(
         resData => {
            console.log(resData);
            this.isLoading = false;
            // on succesfull login, or subscription, we navigate away to recipes
            this.route.navigate(["/recipes"]);
         },
         errorMessage => {
            this.isLoading = false;
            this.error = errorMessage;
         }
      );

      // the reason we passed the whole form form the template and not just the value: we can call
      // reset from within this function
      form.reset();
   }
}
