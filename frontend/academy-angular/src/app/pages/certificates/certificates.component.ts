import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificatesComponent implements OnInit {
  loading = false;
  error: string | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadCertificatesData();
  }

  loadCertificatesData(): void {
    this.loading = true;
    this.error = null;
    
    // Mock data loading - replace with actual API call
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}
