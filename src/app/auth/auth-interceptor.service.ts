import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpHandler, HttpRequest, HttpParams } from "@angular/common/http";
import { AuthService } from "./auth.service";
import { take, exhaustMap } from "rxjs/operators";

@Injectable({
   providedIn: "root"
})
export class AuthInterceptorService implements HttpInterceptor {
   constructor(private authService: AuthService) {}

   intercept(req: HttpRequest<any>, next: HttpHandler) {
      return this.authService.user.pipe(
         take(1),
         exhaustMap(user => {
            // since we need to get through with the auth request that does not neet a header yet, we have
            // to check here if the user even exists or is null.
            if (!user) {
               return next.handle(req);
            }
            const modRequest = req.clone({ params: new HttpParams().set("auth", user.token) });
            return next.handle(modRequest);
         })
      );
   }
}
