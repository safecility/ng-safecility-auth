import { BehaviorSubject, from, map, Observable, timer } from "rxjs";
import { Company, User, View } from "./user.service";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot
} from "@angular/router";
import { Injectable } from "@angular/core";
import { DateTime, Duration } from "luxon";

const mockUsers: Array<User> = [
  {FirstName: "John", LastName: "Smith", Email: "smith@example.com", CompanyName: "small-corp"},
  {
    Email: "tim@theconvexlens.co",
    CompanyName:"Safecility",
    FirstName:"Tim",
    LastName:"Hawkins",
    Roles: ["shared-role-dali"],
    Views: ["basicCorp-view-dali-0001"]
  }
]

const mockCompany = {
  "CompanyUID": "companies-basic-sw5sd4-safecility",
  "CompanyName": "Safecility",
  "Views": [
    {
      "ViewUID": "safecility-view-dali-0001",
      "ViewType": "dali",
      "Active": true,
      "Roles": ["shared-role-dali"],
      "App": "dali"
    },
    {"ViewUID": "safecility-view-power-0001", "ViewType": "power", "Active": true, "Roles": null, "App": "power"},
    {"ViewUID": "safecility-view-power-0002", "ViewType": "power", "Active": false, "Roles": null, "App": "power"}]
};

@Injectable({
  providedIn: 'root'
})
export class UserServiceMock implements CanActivate {

  private userSubject: BehaviorSubject<User | undefined>;
  private readonly localUser: Observable<User | undefined>;

  constructor(
    private router: Router,
  ) {
    this.userSubject = new BehaviorSubject<User | undefined>(undefined);
    this.localUser = this.userSubject.asObservable();
  }

  isLoggedIn(returnUrl?: string): Observable<boolean> {
    console.log("checking user is logged in");
    return timer(800).pipe(map(() => {
      return !!this.userSubject.value
    }));
  }

  logout(returnUrl?: string): Observable<boolean> {
    this.userSubject.next(undefined);
    const extras = returnUrl? { queryParams: { returnUrl }}: undefined
    return from(this.router.navigate(['/login'], extras));
  }

  private remoteUser(): Observable<User | undefined> {
    return timer(500).pipe(map((value, index) => {
      const user = mockUsers[0];
      user.AuthViews = UserViews(user, mockCompany as Company);

      user.expires = DateTime.now().plus(Duration.fromObject({hours: 4})).toISO()
      this.userSubject.next( user );
      return mockUsers[0]
    }))
  }

  user(returnUrl?: string): Observable<User | undefined> {
    if (this.userSubject.value === undefined) {
      this.remoteUser().subscribe()
    }
    return this.localUser;
  }

  updateUser(user: User) {
    console.log("user", user);
    this.userSubject.next(user);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return this.isLoggedIn()
  }

}

//duplicate the node implementation
export function UserViews(user: User, company: Company): View[] {
  if (!user.Views) {
    user.Views = company.Views.map( v => v.ViewUID);
  }

  return company.Views.reduce( (p, cv): Array<View> => {
    if (!cv.Active)
      return p;
    if (!cv.Roles) {
      user.Views?.forEach( uv => {
        if (uv === cv.ViewUID) {
          p.push(sanitizeView(cv));
          return;
        }
      })
      return p;
    }

    cv.Roles.forEach( cr => {
      user.Roles?.forEach( ur => {
        if (ur === cr) {
          user.Views?.forEach( uv => {
            if (uv === cv.ViewUID) {
              p.push(sanitizeView(cv));
              return p;
            }
            return p;
          })
        }
        return p;
      })
    })
    return p
  }, new Array<View>);
}


function sanitizeView(view: View): View {
  return {
      ViewUID: view.ViewUID,
      App: view.App,
  }
}
