import {Component, Input, OnInit} from '@angular/core';
import {MatCard, MatCardContent, MatCardTitle} from "@angular/material/card";
import {MatAnchor} from "@angular/material/button";
import {User, UserService} from "../../user.service";
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
export class LoginComponent implements OnInit {

  @Input() authPath = "/auth/google"

  constructor(
    public userService: UserService,
  ) {}

  user: User | undefined;

  ngOnInit() {
    this.userService.user().subscribe({
      next: user => {
        this.user = user;
      }
    });
  }
}
