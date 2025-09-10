import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-students-evaluations',
  templateUrl: './students-evaluations.component.html',
  styleUrls: ['./students-evaluations.component.css']
})
export class StudentsEvaluationsComponent implements OnInit {
  loading = false;
  error: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadEvaluationsData();
  }

  loadEvaluationsData(): void {
    this.loading = true;
    this.error = null;
    
    // Mock data loading - replace with actual API call
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}
