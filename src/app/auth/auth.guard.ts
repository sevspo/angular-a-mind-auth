import { Injectable } from "@angular/core";
import {
   ActivatedRouteSnapshot,
   CanActivate,
   RouterStateSnapshot,
   UrlTree,
   Router
} from "@angular/router";
import { Observable } from "rxjs/internal/Observable";
import { AuthService } from "./auth.service";
import { map, take } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
   constructor(private authService: AuthService, private router: Router) {}

   canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
   ): boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
      // this one is tough. We need to return the login state, so if there is am authenticated user or not.
      // We therefore subscribe to the BehaviourSubject that returns a user object and not a boolean.
      // We fix that with a pipe and the map operator and the !! operator in the end.
      // it converts the object to ture or false.

      // by adding the new URL Tree we can also redirect the user form whithin the auth guard.

      // take one has to be here because we only whant the value once! otherwise this can lead to sideeffects.
      return this.authService.user.pipe(
         take(1),
         map(user => {
            const isUserAuth = !!user;
            if (isUserAuth) {
               return true;
            }
            return this.router.createUrlTree(["/auth"]);
         })
      );
   }
}
