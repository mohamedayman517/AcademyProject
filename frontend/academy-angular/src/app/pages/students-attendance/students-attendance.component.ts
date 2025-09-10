import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-students-attendance',
  templateUrl: './students-attendance.component.html',
  styleUrls: ['./students-attendance.component.css']
})
export class StudentsAttendanceComponent implements OnInit {
  loading = false;
  error: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadAttendanceData();
  }

  loadAttendanceData(): void {
    this.loading = true;
    this.error = null;
    
    // Mock data loading - replace with actual API call
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}
