import { Component } from '@angular/core';
import {MatCard, MatCardContent, MatCardTitle} from "@angular/material/card";
import {MatAnchor} from "@angular/material/button";
import {User, UserService} from "../../user.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {NgIf} from "@angular/common";

@Component({
  selector: 'lib-login',
  standalone: true,
  imports: [
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatAnchor,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor(
    public userService: UserService,
    public snackBar: MatSnackBar,
  ) {
  }

  user: User | undefined;

  ngOnInit() {
    this.userService.user().subscribe({
      next: user => {
        this.user = user;
      }
    });
  }
}
