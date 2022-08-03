import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { Router } from '@angular/router';
import { DatabaseService } from '../database.service';

@Component({
  selector: 'app-mobile-join',
  templateUrl: './mobile-join.component.html',
  styleUrls: ['./mobile-join.component.css']
})
export class MobileJoinComponent implements OnInit {

  joinGameForm: FormGroup;

  constructor(
    private bottomSheetRef: MatBottomSheetRef<MobileJoinComponent>,
    private dbService: DatabaseService,
    private formBuilder: FormBuilder,
    private router: Router,
  ) { 
    this.createForm();
  }

  ngOnInit(): void {
  }

  createForm(): void {
    this.joinGameForm = this.formBuilder.group({
      id: ['', [Validators.required, Validators.minLength(5)]],
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  joinGame(joinFormData) {
    if (this.joinGameForm.invalid) {
      return;
    } else {
      this.dbService.addPlayer(joinFormData.id, joinFormData.name);
      sessionStorage.setItem('user', joinFormData.name);
      sessionStorage.setItem('host', 'false');
      this.bottomSheetRef.dismiss();
      this.router.navigateByUrl(`/lobby/${joinFormData.id}`);
    }
  }

}
