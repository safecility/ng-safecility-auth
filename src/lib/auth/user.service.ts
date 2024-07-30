import {Injectable} from '@angular/core';
import {BehaviorSubject, from, map, Observable} from "rxjs";
import {HttpClient, HttpErrorResponse} from "@angular/common/http";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  GuardResult,
  MaybeAsync,
  Router,
  RouterStateSnapshot
} from "@angular/router";

export interface Group {
  GroupUID: string
  GroupName?: string
  GroupType: string
  SubGroups?: Array<Group>
  Roles?: Array<string>
}

export interface View {
  ViewUID: string
  ViewName?: string
  Roles?: Array<string>
  Groups?: Array<Group>
  App: string
  Active?: boolean
}

export interface Company {
  CompanyUID: string
  Views: Array<View>
}

export interface User {
  FirstName: string
  LastName: string
  Email: string
  CompanyName: string
  Roles?: Array<string>
  Views?: Array<string>
  AuthViews?: Array<View>

  expires?: string | undefined;
}

@Injectable({
  providedIn: 'root'
})
export class UserService  implements CanActivate {
  private userSubject: BehaviorSubject<User | undefined>;
  private readonly localUser: Observable<User | undefined>;

  private remote: Observable<User | undefined> | undefined;

  constructor(
    private router: Router,
    private httpClient: HttpClient,
  ) {
    this.userSubject = new BehaviorSubject<User | undefined>(undefined);
    this.localUser = this.userSubject.asObservable();
  }

  isLoggedIn(returnUrl?: string): Observable<boolean> {
    if (this.remote) {
      console.log("checking user is logged in from remote");
      return this.remote.pipe(map(() => {
        return !!this.userSubject.value
      }))
    }
    return this.user(returnUrl).pipe(map((u: User | undefined, i: number) => {
      return !!u
    }))
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): MaybeAsync<GuardResult> {
    console.log("can activate?");
    return this.isLoggedIn()
  }

  user(returnUrl?: string): Observable<User | undefined> {
    if (this.userSubject.value == undefined && !this.remote) {
      this.remote = this.remoteUser(returnUrl)
      this.remote.pipe(map((u: User | undefined, i: number) => {
        this.userSubject.next(u);
        return u;
      })).subscribe({
        next: () => {
          this.remote = undefined
        },
        error: (err: HttpErrorResponse) => {
          console.debug("no user: ", err);
        }
      }
      )
    }
    return this.localUser
  }

  private remoteUser(returnUrl?: string): Observable<User | undefined> {
    const apiUrl = "http://localhost:4000/auth/user"
    return this.httpClient.get<User | undefined>(apiUrl)
  }

  //maybe restrict this only to mock - not super bad here but probably unnecessary
  updateUser(user: User | undefined) {
    this.userSubject.next(user);
  }

  logout(returnUrl?: string): Observable<boolean> {
    this.userSubject.next(undefined);
    const extras = returnUrl? { queryParams: { returnUrl }}: undefined
    return from(this.router.navigate(['/login'], extras));
  }

}
