import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { map, tap, take, exhaustMap } from "rxjs/operators";

import { Recipe } from "../recipes/recipe.model";
import { RecipeService } from "../recipes/recipe.service";
import { AuthService } from "../auth/auth.service";

@Injectable({ providedIn: "root" })
export class DataStorageService {
   constructor(
      private http: HttpClient,
      private recipeService: RecipeService,
      private authService: AuthService
   ) {}

   storeRecipes() {
      const recipes = this.recipeService.getRecipes();
      this.http
         .put("https://ng-http-tut-api.firebaseio.com/recipes.json", recipes)
         .subscribe(response => {
            console.log(response);
         });
   }

   fetchRecipes() {
      // with the take operator we get the value from the BehaviorSubject once and automatically unsubscribe.
      // Sice we cannot return form inside the first subscription to the next subscripton, we have to return
      // from the top level of the function.
      // So we use exhaustMap. this takes the value "the user" form the 1 observable into the next.
      // For that we move the previously returned http.get observable into the function bod of the exhaustMap.
      // but only the get request, not the pipe.
      return this.authService.user.pipe(
         take(1),
         exhaustMap(user => {
            return this.http.get<Recipe[]>("https://ng-http-tut-api.firebaseio.com/recipes.json", {
               params: new HttpParams().set("auth", user.token)
            });
         }),
         map(recipes => {
            return recipes.map(recipe => {
               return {
                  ...recipe,
                  ingredients: recipe.ingredients ? recipe.ingredients : []
               };
            });
         }),
         tap(recipes => {
            this.recipeService.setRecipes(recipes);
         })
      );
   }

   /* Old Fetch Function */
   // fetchRecipes() {
   //    return this.http
   //      .get<Recipe[]>(
   //        'https://ng-http-tut-api.firebaseio.com/recipes.json'
   //      )
   //      .pipe(
   //        map(recipes => {
   //          return recipes.map(recipe => {
   //            return {
   //              ...recipe,
   //              ingredients: recipe.ingredients ? recipe.ingredients : []
   //            };
   //          });
   //        }),
   //        tap(recipes => {
   //          this.recipeService.setRecipes(recipes);
   //        })
   //      );
   //  }
}
