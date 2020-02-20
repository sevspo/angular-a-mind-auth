import { Component } from "@angular/core";
import { Form, NgForm } from "@angular/forms";
import { AuthService } from "./auth.service";

@Component({
  selector: "app-auth",
  templateUrl: "./auth.component.html"
})
export class AuthComponent {
  isLoginMode = true;
  isLoading = false;
  // another example why null: if you had an empty string, that would be the error!
  error: string = null;

  constructor(private authService: AuthService) {}

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

    if (this.isLoginMode) {
      // do stuff
    } else {
      this.authService.signUp(email, password).subscribe(
        resData => {
          console.log(resData);
          this.isLoading = false;
        },
        errorMessage => {
          this.isLoading = false;
          this.error = errorMessage;
        }
      );
    }

    // the reason we passed the whole form form the template and not just the value: we can call
    // reset from within this function
    form.reset();
  }
}
