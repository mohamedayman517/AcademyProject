import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-trainers',
  templateUrl: './trainers.component.html',
  styleUrls: ['./trainers.component.css']
})
export class TrainersComponent implements OnInit {
  loading = false;
  error: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadTrainersData();
  }

  loadTrainersData(): void {
    this.loading = true;
    this.error = null;
    
    // Mock data loading - replace with actual API call
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}
