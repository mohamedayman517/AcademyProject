import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ===== Authentication APIs =====
  login(loginData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/login`, loginData);
  }

  register(registerData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/register`, registerData);
  }

  refreshToken(refreshData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/refresh-token`, refreshData);
  }

  confirmEmail(confirmData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/confirmEmail`, confirmData);
  }

  resendEmailConfirmation(emailData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/resendEmailConfirmation`, emailData);
  }

  forgotPassword(emailData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/forgotPassword`, emailData);
  }

  resetPassword(resetData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/resetPassword`, resetData);
  }

  sendPhoneCode(phoneData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/sendPhoneCode`, phoneData);
  }

  confirmPhoneNumber(confirmData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/confirmPhoneNumber`, confirmData);
  }

  // ===== Academy Data APIs =====
  getAcademyData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyData`);
  }

  getAcademyDataById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyData/${id}`);
  }

  createAcademyData(academyData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/AcademyData`, academyData);
  }

  updateAcademyData(id: string, academyData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/AcademyData/${id}`, academyData);
  }

  deleteAcademyData(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/AcademyData/${id}`);
  }

  getAcademyDataImage(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyData/${id}/image`);
  }

  // ===== Academy Courses APIs (mapped to AcademyClaseDetail in external API) =====
  getAcademyCourses(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseDetail`);
  }

  getAcademyCourseById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseDetail/${id}`);
  }

  createAcademyCourse(courseData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/AcademyClaseDetail`, courseData);
  }

  updateAcademyCourse(id: string, courseData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/AcademyClaseDetail/${id}`, courseData);
  }

  deleteAcademyCourse(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/AcademyClaseDetail/${id}`);
  }

  getAcademyCoursesByAcademy(academyId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseDetail/academy/${academyId}`);
  }

  getAcademyCoursesByBranch(branchId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseDetail/branch/${branchId}`);
  }

  getAcademyCoursesCount(academyId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseDetail/count/academy/${academyId}`);
  }

  getAcademyCoursesRange(skip: number, take: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseDetail/range?skip=${skip}&take=${take}`);
  }

  getAcademyCourseImage(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseDetail/${id}/image`);
  }

  // ===== Academy Clase Master/Detail/Type APIs =====
  // Master
  getAcademyClaseMaster(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseMaster`);
  }

  getAcademyClaseMasterById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseMaster/${id}`);
  }

  createAcademyClaseMaster(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/AcademyClaseMaster`, payload);
  }

  updateAcademyClaseMaster(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/AcademyClaseMaster/${id}`, payload);
  }

  deleteAcademyClaseMaster(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/AcademyClaseMaster/${id}`);
  }

  // Detail
  getAcademyClaseDetail(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseDetail`);
  }

  getAcademyClaseDetailById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseDetail/${id}`);
  }

  createAcademyClaseDetail(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/AcademyClaseDetail`, payload);
  }

  updateAcademyClaseDetail(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/AcademyClaseDetail/${id}`, payload);
  }

  deleteAcademyClaseDetail(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/AcademyClaseDetail/${id}`);
  }

  getAcademyClaseDetailImage(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseDetail/${id}/image`);
  }

  // Type
  getAcademyClaseType(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseType`);
  }

  getAcademyClaseTypeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyClaseType/${id}`);
  }

  // ===== Branches Data APIs =====
  getBranchesData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/BranchData`);
  }

  getBranchesDataById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/BranchData/${id}`);
  }

  createBranchesData(branchData: any): Observable<any> {
    // API expects multipart/form-data for BranchData
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.keys(branchData).forEach(key => {
      const value = branchData[key];
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    return this.http.post<any>(`${this.baseUrl}/api/BranchData`, formData);
  }

  updateBranchesData(id: string, branchData: any): Observable<any> {
    // API expects multipart/form-data for BranchData
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.keys(branchData).forEach(key => {
      const value = branchData[key];
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    return this.http.put<any>(`${this.baseUrl}/api/BranchData/${id}`, formData);
  }

  deleteBranchesData(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/BranchData/${id}`);
  }

  getBranchesDataByAcademy(academyId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/BranchData/by-academy/${academyId}`);
  }

  getBranchesDataByCity(cityId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/BranchData/by-city/${cityId}`);
  }

  getBranchesDataByGovernorate(governorateId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/BranchData/by-governorate/${governorateId}`);
  }

  getBranchesDataImage(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/BranchData/${id}/image`);
  }

  // ===== City Code APIs =====
  getCityCodes(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/CityCode`);
  }

  getCityCodeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/CityCode/${id}`);
  }

  createCityCode(cityData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/CityCode`, cityData);
  }

  updateCityCode(id: string, cityData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/CityCode/${id}`, cityData);
  }

  deleteCityCode(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/CityCode/${id}`);
  }

  // ===== Complaints Status APIs =====
  getComplaintsStatus(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsStatus`);
  }

  getComplaintsStatusById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsStatus/${id}`);
  }

  createComplaintsStatus(statusData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/ComplaintsStatus`, statusData);
  }

  updateComplaintsStatus(id: string, statusData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/ComplaintsStatus/${id}`, statusData);
  }

  deleteComplaintsStatus(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/ComplaintsStatus/${id}`);
  }

  getComplaintsStatusByBranch(branchId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsStatus/branch/${branchId}`);
  }

  getComplaintsStatusByCompany(companyId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsStatus/company/${companyId}`);
  }

  checkComplaintsStatusExists(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/ComplaintsStatus/exists`, data);
  }

  // ===== Complaints Type APIs =====
  getComplaintsType(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsType`);
  }

  getComplaintsTypeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsType/${id}`);
  }

  createComplaintsType(typeData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/ComplaintsType`, typeData);
  }

  updateComplaintsType(id: string, typeData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/ComplaintsType/${id}`, typeData);
  }

  deleteComplaintsType(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/ComplaintsType/${id}`);
  }

  getComplaintsTypeByBranch(branchId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsType/branch/${branchId}`);
  }

  getComplaintsTypeByCompany(companyId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsType/company/${companyId}`);
  }

  checkComplaintsTypeExists(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/ComplaintsType/exists`, data);
  }

  // Swagger: GET /api/ComplaintsType/exists?name=...
  checkComplaintsTypeExistsByName(name: string): Observable<any> {
    const q = name ? `?name=${encodeURIComponent(name)}` : '';
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsType/exists${q}`);
  }

  // ===== Country Code APIs =====
  getCountryCodes(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/CountryCode`);
  }

  getCountryCodeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/CountryCode/${id}`);
  }

  createCountryCode(countryData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/CountryCode`, countryData);
  }

  updateCountryCode(id: string, countryData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/CountryCode/${id}`, countryData);
  }

  deleteCountryCode(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/CountryCode/${id}`);
  }

  // ===== Educational Contact Result APIs =====
  getEduContactResults(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/EduContactResult`);
  }

  getEduContactResultById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/EduContactResult/${id}`);
  }

  createEduContactResult(resultData: any): Observable<any> {
    // If Attachment is a File, use FormData
    if (resultData && resultData.Attachment instanceof File) {
      const form = new FormData();
      Object.keys(resultData).forEach(k => {
        const v = (resultData as any)[k];
        if (v === undefined || v === null) return;
        if (k === 'Attachment' && v instanceof File) {
          form.append('Attachment', v);
        } else {
          form.append(k, String(v));
        }
      });
      return this.http.post<any>(`${this.baseUrl}/api/EduContactResult`, form);
    }
    return this.http.post<any>(`${this.baseUrl}/api/EduContactResult`, resultData);
  }

  updateEduContactResult(id: string, resultData: any): Observable<any> {
    if (resultData && resultData.Attachment instanceof File) {
      const form = new FormData();
      Object.keys(resultData).forEach(k => {
        const v = (resultData as any)[k];
        if (v === undefined || v === null) return;
        if (k === 'Attachment' && v instanceof File) {
          form.append('Attachment', v);
        } else {
          form.append(k, String(v));
        }
      });
      return this.http.put<any>(`${this.baseUrl}/api/EduContactResult/${id}`, form);
    }
    return this.http.put<any>(`${this.baseUrl}/api/EduContactResult/${id}`, resultData);
  }

  deleteEduContactResult(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/EduContactResult/${id}`);
  }

  getEduContactResultsRange(skip: number, take: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/EduContactResult/range?skip=${skip}&take=${take}`);
  }

  // Date-based range per Swagger (from/to date-time)
  getEduContactResultsRangeByDate(from?: string, to?: string): Observable<any> {
    const params: string[] = [];
    if (from) params.push(`from=${encodeURIComponent(from)}`);
    if (to) params.push(`to=${encodeURIComponent(to)}`);
    const q = params.length ? `?${params.join('&')}` : '';
    return this.http.get<any>(`${this.baseUrl}/api/EduContactResult/range${q}`);
  }

  getEduContactResultsByStudent(studentId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/EduContactResult/student/${studentId}`);
  }

  getEduContactResultFile(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/EduContactResult/${id}/file`, { responseType: 'blob' as 'blob' });
  }

  // ===== Governorate Code APIs =====
  getGovernorateCodes(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/GovernorateCode`);
  }

  getGovernorateCodeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/GovernorateCode/${id}`);
  }

  createGovernorateCode(governorateData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/GovernorateCode`, governorateData);
  }

  updateGovernorateCode(id: string, governorateData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/GovernorateCode/${id}`, governorateData);
  }

  deleteGovernorateCode(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/GovernorateCode/${id}`);
  }

  // ===== Programs Content Detail APIs =====
  getProgramsContentDetail(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProgramsContentDetail`);
  }

  getProgramsContentDetailById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProgramsContentDetail/${id}`);
  }

  createProgramsContentDetail(contentData: any): Observable<any> {
    // Spec requires multipart/form-data even without files
    const form = new FormData();
    Object.keys(contentData || {}).forEach(k => {
      const v = contentData[k];
      if (v === undefined || v === null) return;
      if (v instanceof File || v instanceof Blob) {
        form.append(k, v);
      } else {
        form.append(k, String(v));
      }
    });
    return this.http.post<any>(`${this.baseUrl}/api/ProgramsContentDetail`, form);
  }

  updateProgramsContentDetail(id: string, contentData: any): Observable<any> {
    // Spec requires multipart/form-data even without files
    const form = new FormData();
    Object.keys(contentData || {}).forEach(k => {
      const v = contentData[k];
      if (v === undefined || v === null) return;
      if (v instanceof File || v instanceof Blob) {
        form.append(k, v);
      } else {
        form.append(k, String(v));
      }
    });
    return this.http.put<any>(`${this.baseUrl}/api/ProgramsContentDetail/${id}`, form);
  }

  deleteProgramsContentDetail(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/ProgramsContentDetail/${id}`);
  }

  getProgramsContentDetailMaterial(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/ProgramsContentDetail/${id}/material`, { responseType: 'blob' as 'blob' });
  }

  getProgramsContentDetailProject(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/ProgramsContentDetail/${id}/project`, { responseType: 'blob' as 'blob' });
  }

  getProgramsContentDetailQuiz(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/ProgramsContentDetail/${id}/quiz`, { responseType: 'blob' as 'blob' });
  }

  getProgramsContentDetailTasks(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/ProgramsContentDetail/${id}/tasks`, { responseType: 'blob' as 'blob' });
  }

  // ===== Programs Content Master APIs =====
  getProgramsContentMaster(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProgramsContentMaster`);
  }

  getProgramsContentMasterById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProgramsContentMaster/${id}`);
  }

  createProgramsContentMaster(masterData: any): Observable<any> {
    // Always send multipart/form-data per API spec
    const form = new FormData();
    Object.keys(masterData || {}).forEach(k => {
      const v = masterData[k];
      if (v === undefined || v === null) return;
      if (v instanceof File || v instanceof Blob) {
        form.append(k, v);
      } else {
        form.append(k, String(v));
      }
    });
    return this.http.post<any>(`${this.baseUrl}/api/ProgramsContentMaster`, form);
  }

  updateProgramsContentMaster(id: string, masterData: any): Observable<any> {
    // Always send multipart/form-data per API spec
    const form = new FormData();
    Object.keys(masterData || {}).forEach(k => {
      const v = masterData[k];
      if (v === undefined || v === null) return;
      if (v instanceof File || v instanceof Blob) {
        form.append(k, v);
      } else {
        form.append(k, String(v));
      }
    });
    return this.http.put<any>(`${this.baseUrl}/api/ProgramsContentMaster/${id}`, form);
  }

  deleteProgramsContentMaster(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/ProgramsContentMaster/${id}`);
  }

  getProgramsContentMasterMaterial(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/ProgramsContentMaster/${id}/material`, { responseType: 'blob' as 'blob' });
  }

  // ===== Programs Detail APIs =====
  getProgramsDetail(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProgramsDetail`);
  }

  getProgramsDetailById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProgramsDetail/${id}`);
  }

  createProgramsDetail(programData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/ProgramsDetail`, programData);
  }

  updateProgramsDetail(id: string, programData: any): Observable<any> {
    // Send JSON payload; server expects application/json for ProgramsDetail
    return this.http.put<any>(`${this.baseUrl}/api/ProgramsDetail/${id}`, programData);
  }

  deleteProgramsDetail(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/ProgramsDetail/${id}`);
  }

  // ===== Projects Detail APIs =====
  getProjectsDetail(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProjectsDetail`);
  }

  getProjectsDetailById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProjectsDetail/${id}`);
  }

  createProjectsDetail(projectData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/ProjectsDetail`, projectData);
  }

  updateProjectsDetail(id: string, projectData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/ProjectsDetail/${id}`, projectData);
  }

  deleteProjectsDetail(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/ProjectsDetail/${id}`);
  }


  // ===== Projects Master APIs =====
  getProjectsMaster(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProjectsMaster`);
  }

  getProjectsMasterById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProjectsMaster/${id}`);
  }

  createProjectsMaster(masterData: any): Observable<any> {
    // API expects multipart/form-data for ProjectsMaster
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.keys(masterData).forEach(key => {
      const value = masterData[key];
      if (value !== null && value !== undefined) {
        if (key === 'ProjectResources' || key === 'ProjectFile') {
          // Handle file uploads
          if (value instanceof File) {
            formData.append(key, value);
          }
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    return this.http.post<any>(`${this.baseUrl}/api/ProjectsMaster`, formData);
  }

  updateProjectsMaster(id: string, masterData: any): Observable<any> {
    // API expects multipart/form-data for ProjectsMaster
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.keys(masterData).forEach(key => {
      const value = masterData[key];
      if (value !== null && value !== undefined) {
        if (key === 'ProjectResources' || key === 'ProjectFile') {
          // Handle file uploads
          if (value instanceof File) {
            formData.append(key, value);
          }
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    return this.http.put<any>(`${this.baseUrl}/api/ProjectsMaster/${id}`, formData);
  }

  deleteProjectsMaster(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/ProjectsMaster/${id}`);
  }

  getProjectsMasterFile(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/ProjectsMaster/${id}/file`, { responseType: 'blob' as 'blob' });
  }

  getProjectsMasterResource(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/ProjectsMaster/${id}/resource`, { responseType: 'blob' as 'blob' });
  }

  getProjectsMasterByAcademy(academyId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProjectsMaster/academy/${academyId}`);
  }

  getProjectsMasterByBranch(branchId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProjectsMaster/branch/${branchId}`);
  }

  getProjectsMasterCountByAcademy(academyId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ProjectsMaster/count/academy/${academyId}`);
  }

  getProjectsMasterRangeByDate(start: string, end: string): Observable<any> {
    const params = new HttpParams({ fromObject: { start, end } });
    return this.http.get<any>(`${this.baseUrl}/api/ProjectsMaster/range`, { params });
  }

  // ===== Question Bank Master APIs =====
  getQuestionBankMaster(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/QuestionBankMaster`);
  }

  getQuestionBankMasterById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/QuestionBankMaster/${id}`);
  }

  createQuestionBankMaster(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/QuestionBankMaster`, payload);
  }

  updateQuestionBankMaster(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/QuestionBankMaster/${id}`, payload);
  }

  deleteQuestionBankMaster(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/QuestionBankMaster/${id}`);
  }

  getQuestionBankMasterByProgram(programId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/QuestionBankMaster/by-program/${programId}`);
  }

  // ===== Skill Development APIs =====
  getSkillDevelopment(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/SkillDevelopment`);
  }

  getSkillDevelopmentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/SkillDevelopment/${id}`);
  }

  createSkillDevelopment(payload: any): Observable<any> {
    // Handle AttachedFiles upload via FormData when it's a File
    if (payload && payload.AttachedFiles instanceof File) {
      const form = new FormData();
      Object.keys(payload).forEach(k => {
        const v = (payload as any)[k];
        if (v === undefined || v === null) return;
        if (k === 'AttachedFiles' && v instanceof File) {
          form.append('AttachedFiles', v);
        } else {
          form.append(k, String(v));
        }
      });
      return this.http.post<any>(`${this.baseUrl}/api/SkillDevelopment`, form);
    }
    return this.http.post<any>(`${this.baseUrl}/api/SkillDevelopment`, payload);
  }

  updateSkillDevelopment(id: string, payload: any): Observable<any> {
    if (payload && payload.AttachedFiles instanceof File) {
      const form = new FormData();
      Object.keys(payload).forEach(k => {
        const v = (payload as any)[k];
        if (v === undefined || v === null) return;
        if (k === 'AttachedFiles' && v instanceof File) {
          form.append('AttachedFiles', v);
        } else {
          form.append(k, String(v));
        }
      });
      return this.http.put<any>(`${this.baseUrl}/api/SkillDevelopment/${id}`, form);
    }
    return this.http.put<any>(`${this.baseUrl}/api/SkillDevelopment/${id}`, payload);
  }

  deleteSkillDevelopment(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/SkillDevelopment/${id}`);
  }

  getSkillDevelopmentAttachment(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/SkillDevelopment/${id}/attachment`, { responseType: 'blob' as 'blob' });
  }

  // ===== Student Attend APIs =====
  getStudentAttend(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentAttend`);
  }

  getStudentAttendById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentAttend/${id}`);
  }

  createStudentAttend(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/StudentAttend`, payload);
  }

  updateStudentAttend(id: string, attendData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/StudentAttend/${id}`, attendData);
  }

  deleteStudentAttend(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/StudentAttend/${id}`);
  }

  // ===== Student Content Detail APIs =====
  getStudentContentDetail(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentContentDetail`);
  }

  getStudentContentDetailById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentContentDetail/${id}`);
  }

  createStudentContentDetail(contentData: any): Observable<any> {
    // Handle file uploads via FormData for SessionTasks, SessionProject, SessionQuiz
    const fileKeys = ['SessionTasks', 'SessionProject', 'SessionQuiz'];
    const hasFile = fileKeys.some(k => contentData && contentData[k] instanceof File);
    if (hasFile) {
      const form = new FormData();
      Object.keys(contentData || {}).forEach(k => {
        const v = contentData[k];
        if (v === undefined || v === null) return;
        if (fileKeys.includes(k) && v instanceof File) {
          form.append(k, v);
        } else {
          form.append(k, String(v));
        }
      });
      return this.http.post<any>(`${this.baseUrl}/api/StudentContentDetail`, form);
    }
    return this.http.post<any>(`${this.baseUrl}/api/StudentContentDetail`, contentData);
  }

  updateStudentContentDetail(id: string, contentData: any): Observable<any> {
    const fileKeys = ['SessionTasks', 'SessionProject', 'SessionQuiz'];
    const hasFile = fileKeys.some(k => contentData && contentData[k] instanceof File);
    if (hasFile) {
      const form = new FormData();
      Object.keys(contentData || {}).forEach(k => {
        const v = contentData[k];
        if (v === undefined || v === null) return;
        if (fileKeys.includes(k) && v instanceof File) {
          form.append(k, v);
        } else {
          form.append(k, String(v));
        }
      });
      return this.http.put<any>(`${this.baseUrl}/api/StudentContentDetail/${id}`, form);
    }
    return this.http.put<any>(`${this.baseUrl}/api/StudentContentDetail/${id}`, contentData);
  }

  deleteStudentContentDetail(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/StudentContentDetail/${id}`);
  }

  getStudentContentDetailProject(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/StudentContentDetail/project/${id}`, { responseType: 'blob' as 'blob' });
  }

  getStudentContentDetailQuiz(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/StudentContentDetail/quiz/${id}`, { responseType: 'blob' as 'blob' });
  }

  getStudentContentDetailTask(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/StudentContentDetail/task/${id}`, { responseType: 'blob' as 'blob' });
  }

  // ===== Student Data APIs =====
  getStudentData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentData`);
  }

  getStudentDataById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentData/${id}`);
  }

  createStudentData(studentData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/StudentData`, studentData);
  }

  updateStudentData(id: string, studentData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/StudentData/${id}`, studentData);
  }

  deleteStudentData(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/StudentData/${id}`);
  }

  getStudentDataByEmail(email: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentData/by-email/${email}`);
  }

  getStudentDataByGroup(groupId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentData/by-group/${groupId}`);
  }

  getGraduatedStudentData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentData/graduated`);
  }

  // ===== Student Evaluation APIs =====
  getStudentEvaluation(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentEvaluation`);
  }

  getStudentEvaluationById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentEvaluation/${id}`);
  }

  createStudentEvaluation(evaluationData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/StudentEvaluation`, evaluationData);
  }

  updateStudentEvaluation(id: string, evaluationData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/StudentEvaluation/${id}`, evaluationData);
  }

  deleteStudentEvaluation(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/StudentEvaluation/${id}`);
  }

  // ===== Student Group APIs =====
  getStudentGroup(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentGroup`);
  }

  getStudentGroupById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/StudentGroup/${id}`);
  }

  createStudentGroup(groupData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/StudentGroup`, groupData);
  }

  updateStudentGroup(id: string, groupData: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/StudentGroup/${id}`, groupData);
  }

  deleteStudentGroup(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/StudentGroup/${id}`);
  }

  // ===== Teacher Data APIs =====
  getTeacherData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/TeacherData`);
  }

  getTeacherDataById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/TeacherData/${id}`);
  }

  createTeacherData(teacherData: any): Observable<any> {
    // Handle ImageFile upload via FormData when it's a File
    if (teacherData && teacherData.ImageFile instanceof File) {
      const form = new FormData();
      Object.keys(teacherData).forEach(k => {
        const v = teacherData[k];
        if (v === undefined || v === null) return;
        if (k === 'ImageFile' && v instanceof File) {
          form.append('ImageFile', v);
        } else {
          form.append(k, String(v));
        }
      });
      return this.http.post<any>(`${this.baseUrl}/api/TeacherData`, form);
    }
    return this.http.post<any>(`${this.baseUrl}/api/TeacherData`, teacherData);
  }

  updateTeacherData(id: string, teacherData: any): Observable<any> {
    if (teacherData && teacherData.ImageFile instanceof File) {
      const form = new FormData();
      Object.keys(teacherData).forEach(k => {
        const v = teacherData[k];
        if (v === undefined || v === null) return;
        if (k === 'ImageFile' && v instanceof File) {
          form.append('ImageFile', v);
        } else {
          form.append(k, String(v));
        }
      });
      return this.http.put<any>(`${this.baseUrl}/api/TeacherData/${id}`, form);
    }
    return this.http.put<any>(`${this.baseUrl}/api/TeacherData/${id}`, teacherData);
  }

  deleteTeacherData(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/TeacherData/${id}`);
  }

  getTeacherDataByBranch(branchId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/TeacherData/by-branch/${branchId}`);
  }

  getTeacherDataByCity(cityId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/TeacherData/by-city/${cityId}`);
  }

  getTeacherDataByGovernorate(governorateId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/TeacherData/by-governorate/${governorateId}`);
  }

  getTeacherDataImage(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/TeacherData/${id}/image`, { responseType: 'blob' as 'blob' });
  }

  // ===== Chat APIs =====
  chatSend(payload: { text: string; conversationId?: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/chat/send`, payload);
  }

  chatReply(messageId: string, payload?: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/chat/reply/${messageId}`, payload ?? {});
  }

  chatHistory(params?: any): Observable<any> {
    // Some backends expect optional query params like conversationId, skip, take
    return this.http.get<any>(`${this.baseUrl}/api/chat/history`, { params });
  }

  chatConversation(params?: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/chat/conversation`, { params });
  }

  chatConversations(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/chat/conversations`);
  }

  chatConversationsUnread(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/chat/conversations/unread`);
  }

  chatFile(fileId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/chat/file/${fileId}`, { responseType: 'blob' });
  }

  chatMarkRead(messageId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/chat/read/${messageId}`, {});
  }

  // ===== Academy Job APIs =====
  getAcademyJob(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyJob`);
  }

  getAcademyJobById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/AcademyJob/${id}`);
  }

  createAcademyJob(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/AcademyJob`, payload);
  }

  updateAcademyJob(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/AcademyJob/${id}`, payload);
  }

  deleteAcademyJob(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/AcademyJob/${id}`);
  }

  // ===== Account APIs =====
  accountRegister(payload: {
    firstName: string;
    lastName: string;
    role: string;
    academyDataId?: string;
    branchesDataId?: string;
    email: string;
    phoneNumber?: string;
    password: string;
    confirmPassword: string;
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/register`, payload);
  }

  accountLogin(payload: { email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/login`, payload);
  }

  accountRefreshToken(payload: { refreshToken: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/refresh-token`, payload);
  }

  accountRevokeToken(payload: { refreshToken: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/revoke-token`, payload);
  }

  accountForgotPassword(payload: { email: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/forgot-password`, payload);
  }

  accountResetPassword(payload: { email: string; token: string; newPassword: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/reset-password`, payload);
  }

  accountChangePassword(payload: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/Account/change-password`, payload);
  }

  accountSendEmailConfirmation(payload: { email: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/send-email-confirmation`, payload);
  }

  accountConfirmEmail(params: { Email: string; Token: string }): Observable<any> {
    // Confirm by query parameters
    const q = new URLSearchParams({ Email: params.Email, Token: params.Token }).toString();
    return this.http.get<any>(`${this.baseUrl}/api/Account/confirm-email?${q}`);
  }

  accountSendPhoneCode(payload: { phoneNumber: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/send-phone-code`, payload);
  }

  accountConfirmPhone(payload: { phoneNumber: string; code: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/confirm-phone`, payload);
  }

  accountEnable2fa(userId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/enable-2fa/${userId}`, {});
  }

  accountDisable2fa(userId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/disable-2fa/${userId}`, {});
  }

  accountVerify2fa(payload: { userId: string; code: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/verify-2fa`, payload);
  }

  accountDeactivate(userId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/Account/deactivate/${userId}`, {});
  }

  accountActivate(userId: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/api/Account/activate/${userId}`, {});
  }

  accountLastLoginTime(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/Account/last-login-time/${userId}`);
  }

  accountUploadProfilePicture(userId: string, file: File): Observable<any> {
    const form = new FormData();
    form.append('File', file);
    return this.http.post<any>(`${this.baseUrl}/api/Account/profile-picture/${userId}`, form);
  }

  accountGetProfilePicture(userId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/Account/profile-picture/${userId}`, { responseType: 'blob' });
  }

  accountExternalLogin(payload: { provider: string; idToken: string; accessToken: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/external-login`, payload);
  }

  accountLinkExternal(userId: string, payload: { provider: string; idToken: string; accessToken: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/Account/link-external-account/${userId}`, payload);
  }

  accountMe(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/Account/me`);
  }

  accountGetById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/Account/${id}`);
  }

  accountList(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/Account`);
  }

  // ===== Complaints Student APIs =====
  getComplaintsStudent(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsStudent`);
  }

  getComplaintsStudentById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsStudent/${id}`);
  }

  // Create with optional file: if payload.FilesAttach is File, send FormData
  createComplaintsStudent(payload: any): Observable<any> {
    if (payload && payload.FilesAttach instanceof File) {
      const form = new FormData();
      Object.keys(payload).forEach(k => {
        if (k === 'FilesAttach') {
          form.append('FilesAttach', payload.FilesAttach);
        } else if (payload[k] !== undefined && payload[k] !== null) {
          form.append(k, String(payload[k]));
        }
      });
      return this.http.post<any>(`${this.baseUrl}/api/ComplaintsStudent`, form);
    }
    return this.http.post<any>(`${this.baseUrl}/api/ComplaintsStudent`, payload);
  }

  updateComplaintsStudent(id: string, payload: any): Observable<any> {
    if (payload && payload.FilesAttach instanceof File) {
      const form = new FormData();
      Object.keys(payload).forEach(k => {
        if (k === 'FilesAttach') {
          form.append('FilesAttach', payload.FilesAttach);
        } else if (payload[k] !== undefined && payload[k] !== null) {
          form.append(k, String(payload[k]));
        }
      });
      return this.http.put<any>(`${this.baseUrl}/api/ComplaintsStudent/${id}`, form);
    }
    return this.http.put<any>(`${this.baseUrl}/api/ComplaintsStudent/${id}`, payload);
  }

  deleteComplaintsStudent(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/api/ComplaintsStudent/${id}`);
  }

  getComplaintsStudentByStudent(studentId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsStudent/student/${studentId}`);
  }

  getComplaintsStudentByStatus(statusId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsStudent/status/${statusId}`);
  }

  getComplaintsStudentRange(from: string, to: string): Observable<any> {
    const params = new URLSearchParams();
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const q = params.toString();
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsStudent/range${q ? `?${q}` : ''}`);
  }

  getComplaintsStudentCountByStatus(statusId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/api/ComplaintsStudent/count/${statusId}`);
  }

  getComplaintsStudentFile(id: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/api/ComplaintsStudent/${id}/file`, { responseType: 'blob' as 'blob' });
  }

  // ===== Convenience aliases used by Evaluations page =====
  getEvaluations(): Observable<any[]> {
    return this.getStudentEvaluation();
  }

  createEvaluation(payload: any): Observable<any> {
    return this.createStudentEvaluation(payload);
  }

  getAttendance(): Observable<any[]> {
    return this.getStudentAttend();
  }

  getStudents(): Observable<any[]> {
    return this.getStudentData();
  }
}
