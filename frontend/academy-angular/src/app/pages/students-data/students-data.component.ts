import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-students-data',
  templateUrl: './students-data.component.html',
  styleUrls: ['./students-data.component.css']
})
export class StudentsDataComponent implements OnInit {
  studentId: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.studentId = params.id || null;
      if (this.studentId) {
        this.loadStudentData();
      }
    });
  }

  loadStudentData(): void {
    this.loading = true;
    this.error = null;
    
    // Mock data loading - replace with actual API call
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}
