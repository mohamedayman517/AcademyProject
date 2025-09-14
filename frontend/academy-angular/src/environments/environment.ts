export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8000',
  // Optional: paste a temporary JWT here for local testing only.
  // Leave empty to require real login/token via localStorage.
  devToken: '',
  // Optional: set a specific AcademyData Id to fetch by-id endpoints
  // Default academy ID - replace with actual academy ID from your system
  academyId: '00000000-0000-0000-0000-000000000001'
};
