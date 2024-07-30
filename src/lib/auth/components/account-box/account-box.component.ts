import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {User, UserService} from "../../user.service";
import {DateTime} from "luxon";
import {NgIf} from "@angular/common";
import {MatButtonModule} from "@angular/material/button";
import {MatMenuModule} from "@angular/material/menu";
import {MatIcon} from "@angular/material/icon";
import {timer} from "rxjs";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'lib-account-box',
  standalone: true,
  imports: [
    NgIf,
    MatMenuModule,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './account-box.component.html',
  styleUrl: './account-box.component.css'
})
export class AccountBoxComponent implements OnInit {

  user: User | undefined;

  @Output() userChange: EventEmitter<User> = new EventEmitter();

  constructor(
    public userService: UserService,
    public snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.userService.user().subscribe({
      next: user => {
        this.userChange.emit(user);
        this.user = user;
        if (this.user?.expires) {
          timer(DateTime.fromISO(this.user.expires).toJSDate()).subscribe({
            next: user => {
              //WE could prompt to stay logged in etc...
              this.snackBar.open("session ending", "logging out").afterOpened().subscribe(
                {
                  next: () => {
                    this.userService.logout().subscribe({
                      next: () => this.userService.logout().subscribe({
                        next: () => {console.log("logged out")}
                      }),
                      error: err => {
                        console.error(err);
                      }
                    })
                  }
                }
              )

            }
          })
        }
      },
      error: err => {
        console.error("could not get user", err);
      }
    })
  }

  logout() {
    this.userService.logout();
  }

}
