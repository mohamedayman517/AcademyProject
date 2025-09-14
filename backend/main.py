from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import httpx
import os
from typing import List, Optional, Dict, Any
import asyncio

app = FastAPI(title="Academy of Creativity API", version="1.0.0")

# إعداد CORS للسماح بالوصول من الواجهة الأمامية
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# تقديم الملفات الثابتة: جرّب عدة مسارات محتملة وتجاوز التثبيت إذا لم يوجد مجلد الأصول
base_dir = os.path.dirname(__file__)
asset_candidates = [
    os.path.abspath(os.path.join(base_dir, "..", "frontend", "academy-angular", "src", "assets")),
    os.path.abspath(os.path.join(base_dir, "..", "frontend", "assets")),
]
for assets_dir in asset_candidates:
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        break

# عنوان API الخارجي
EXTERNAL_API_BASE = "http://95.216.63.80:255/api"

class APIClient:
    def __init__(self):
        self.base_url = EXTERNAL_API_BASE
        self.timeout = 30.0
    
    async def get(self, endpoint: str, params: Optional[Dict] = None, headers: Optional[Dict[str, str]] = None):
        """إجراء طلب GET إلى API الخارجي"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.get(f"{self.base_url}/{endpoint}", params=params, headers=headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise HTTPException(status_code=500, detail=f"External API error: {str(e)}")
    
    async def post(self, endpoint: str, data: Optional[Dict] = None, headers: Optional[Dict[str, str]] = None):
        """إجراء طلب POST إلى API الخارجي"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(f"{self.base_url}/{endpoint}", json=data, headers=headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise HTTPException(status_code=500, detail=f"External API error: {str(e)}")
    
    async def put(self, endpoint: str, data: Optional[Dict] = None, headers: Optional[Dict[str, str]] = None):
        """إجراء طلب PUT إلى API الخارجي"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.put(f"{self.base_url}/{endpoint}", json=data, headers=headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise HTTPException(status_code=500, detail=f"External API error: {str(e)}")
    
    async def delete(self, endpoint: str, headers: Optional[Dict[str, str]] = None):
        """إجراء طلب DELETE إلى API الخارجي"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.delete(f"{self.base_url}/{endpoint}", headers=headers)
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                raise HTTPException(status_code=500, detail=f"External API error: {str(e)}")

api_client = APIClient()

def forward_auth_headers(request: Request) -> Dict[str, str]:
    headers: Dict[str, str] = {}
    auth = request.headers.get("authorization")
    if auth:
        headers["authorization"] = auth
    return headers

@app.get("/")
async def root():
    return {"message": "مرحباً بكم في أكاديمية الإبداع"}

# نقاط النهاية للدورات
@app.get("/courses")
async def get_courses():
    """الحصول على جميع الدورات"""
    try:
        courses = await api_client.get("AcademyClaseDetail")
        return {"courses": courses, "status": "success"}
    except Exception as e:
        return {"courses": [], "status": "error", "message": str(e)}

@app.get("/courses/{course_id}")
async def get_course(course_id: int):
    """الحصول على تفاصيل دورة محددة"""
    try:
        course = await api_client.get(f"AcademyClaseDetail/{course_id}")
        return {"course": course, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Course not found: {str(e)}")

@app.get("/courses/{course_id}/image")
async def get_course_image(course_id: int):
    """الحصول على صورة الدورة"""
    try:
        image = await api_client.get(f"AcademyClaseDetail/{course_id}/image")
        return {"image": image, "status": "success"}
    except Exception as e:
        return {"image": None, "status": "error", "message": str(e)}

# نقاط النهاية للفئات الرئيسية للدورات
@app.get("/course-masters")
async def get_course_masters():
    """الحصول على الفئات الرئيسية للدورات"""
    try:
        masters = await api_client.get("AcademyClaseMaster")
        return {"masters": masters, "status": "success"}
    except Exception as e:
        return {"masters": [], "status": "error", "message": str(e)}

@app.get("/course-masters/{master_id}")
async def get_course_master(master_id: int):
    """الحصول على تفاصيل فئة رئيسية محددة"""
    try:
        master = await api_client.get(f"AcademyClaseMaster/{master_id}")
        return {"master": master, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Course master not found: {str(e)}")

# نقاط النهاية لأنواع الدورات
@app.get("/course-types")
async def get_course_types():
    """الحصول على أنواع الدورات"""
    try:
        types = await api_client.get("AcademyClaseType")
        return {"types": types, "status": "success"}
    except Exception as e:
        return {"types": [], "status": "error", "message": str(e)}

# نقاط النهاية لبيانات الأكاديمية
@app.get("/academy-data")
async def get_academy_data(request: Request):
    """الحصول على بيانات الأكاديمية"""
    try:
        data = await api_client.get("AcademyData", headers=forward_auth_headers(request))
        return {"data": data, "status": "success"}
    except Exception as e:
        return {"data": [], "status": "error", "message": str(e)}

# نقاط النهاية للوظائف
@app.get("/jobs")
async def get_jobs():
    """الحصول على الوظائف المتاحة"""
    try:
        jobs = await api_client.get("AcademyJob")
        return {"jobs": jobs, "status": "success"}
    except Exception as e:
        return {"jobs": [], "status": "error", "message": str(e)}

# نقاط النهاية للفروع
@app.get("/branches")
async def get_branches(request: Request):
    """الحصول على فروع الأكاديمية"""
    try:
        branches = await api_client.get("BranchData", headers=forward_auth_headers(request))
        return {"branches": branches, "status": "success"}
    except Exception as e:
        return {"branches": [], "status": "error", "message": str(e)}

# نقاط النهاية للبرامج
@app.get("/programs")
async def get_programs():
    """الحصول على البرامج التعليمية"""
    try:
        programs = await api_client.get("ProgramsContentMaster")
        return {"programs": programs, "status": "success"}
    except Exception as e:
        return {"programs": [], "status": "error", "message": str(e)}

@app.get("/programs/{program_id}")
async def get_program(program_id: int):
    """الحصول على تفاصيل برنامج محدد"""
    try:
        program = await api_client.get(f"ProgramsContentMaster/{program_id}")
        return {"program": program, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Program not found: {str(e)}")

@app.get("/program-details")
async def get_program_details():
    """الحصول على تفاصيل محتوى البرامج"""
    try:
        details = await api_client.get("ProgramsContentDetail")
        return {"details": details, "status": "success"}
    except Exception as e:
        return {"details": [], "status": "error", "message": str(e)}

# نقاط النهاية للمشاريع
@app.get("/projects")
async def get_projects():
    """الحصول على المشاريع"""
    try:
        projects = await api_client.get("ProjectsMaster")
        return {"projects": projects, "status": "success"}
    except Exception as e:
        return {"projects": [], "status": "error", "message": str(e)}

@app.get("/projects/{project_id}")
async def get_project(project_id: int):
    """الحصول على تفاصيل مشروع محدد"""
    try:
        project = await api_client.get(f"ProjectsMaster/{project_id}")
        return {"project": project, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Project not found: {str(e)}")

@app.get("/project-details")
async def get_project_details():
    """الحصول على تفاصيل المشاريع"""
    try:
        details = await api_client.get("ProjectsDetail")
        return {"details": details, "status": "success"}
    except Exception as e:
        return {"details": [], "status": "error", "message": str(e)}

# نقاط النهاية لتطوير المهارات
@app.get("/skill-development")
async def get_skill_development():
    """الحصول على برامج تطوير المهارات"""
    try:
        skills = await api_client.get("SkillDevelopment")
        return {"skills": skills, "status": "success"}
    except Exception as e:
        return {"skills": [], "status": "error", "message": str(e)}

# نقاط النهاية للطلاب
@app.get("/students")
async def get_students():
    """الحصول على بيانات الطلاب"""
    try:
        students = await api_client.get("StudentData")
        return {"students": students, "status": "success"}
    except Exception as e:
        return {"students": [], "status": "error", "message": str(e)}

@app.get("/students/{student_id}")
async def get_student(student_id: int):
    """الحصول على تفاصيل طالب محدد"""
    try:
        student = await api_client.get(f"StudentData/{student_id}")
        return {"student": student, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Student not found: {str(e)}")

# نقاط النهاية للمعلمين
@app.get("/teachers")
async def get_teachers():
    """الحصول على بيانات المعلمين"""
    try:
        teachers = await api_client.get("TeacherData")
        return {"teachers": teachers, "status": "success"}
    except Exception as e:
        return {"teachers": [], "status": "error", "message": str(e)}

@app.get("/teachers/{teacher_id}")
async def get_teacher(teacher_id: int):
    """الحصول على تفاصيل معلم محدد"""
    try:
        teacher = await api_client.get(f"TeacherData/{teacher_id}")
        return {"teacher": teacher, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Teacher not found: {str(e)}")

# نقاط النهاية لبنك الأسئلة
@app.get("/question-bank")
async def get_question_bank():
    """الحصول على بنك الأسئلة"""
    try:
        questions = await api_client.get("QuestionBankMaster")
        return {"questions": questions, "status": "success"}
    except Exception as e:
        return {"questions": [], "status": "error", "message": str(e)}

@app.get("/question-details")
async def get_question_details():
    """الحصول على تفاصيل الأسئلة"""
    try:
        details = await api_client.get("QuestionBankDetail")
        return {"details": details, "status": "success"}
    except Exception as e:
        return {"details": [], "status": "error", "message": str(e)}

# نقاط النهاية للشكاوى
@app.get("/complaints")
async def get_complaints():
    """الحصول على جميع الشكاوى"""
    try:
        complaints = await api_client.get("ComplaintsStudent")
        return {"complaints": complaints, "status": "success"}
    except Exception as e:
        return {"complaints": [], "status": "error", "message": str(e)}

@app.get("/complaints/{complaint_id}")
async def get_complaint(complaint_id: str):
    """الحصول على شكوى محددة"""
    try:
        complaint = await api_client.get(f"ComplaintsStudent/{complaint_id}")
        return {"complaint": complaint, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Complaint not found: {str(e)}")

@app.post("/complaints")
async def create_complaint(complaint_data: dict):
    """إنشاء شكوى جديدة"""
    try:
        complaint = await api_client.post("ComplaintsStudent", complaint_data)
        return {"complaint": complaint, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create complaint: {str(e)}")

@app.put("/complaints/{complaint_id}")
async def update_complaint(complaint_id: str, complaint_data: dict):
    """تحديث شكوى موجودة"""
    try:
        complaint = await api_client.put(f"ComplaintsStudent/{complaint_id}", complaint_data)
        return {"complaint": complaint, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update complaint: {str(e)}")

@app.delete("/complaints/{complaint_id}")
async def delete_complaint(complaint_id: str):
    """حذف شكوى"""
    try:
        result = await api_client.delete(f"ComplaintsStudent/{complaint_id}")
        return {"message": "Complaint deleted successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete complaint: {str(e)}")

@app.get("/complaints/student/{student_id}")
async def get_student_complaints(student_id: str):
    """الحصول على شكاوى طالب محدد"""
    try:
        complaints = await api_client.get(f"ComplaintsStudent/student/{student_id}")
        return {"complaints": complaints, "status": "success"}
    except Exception as e:
        return {"complaints": [], "status": "error", "message": str(e)}

@app.get("/complaints/status/{status_id}")
async def get_complaints_by_status(status_id: str):
    """الحصول على الشكاوى حسب الحالة"""
    try:
        complaints = await api_client.get(f"ComplaintsStudent/status/{status_id}")
        return {"complaints": complaints, "status": "success"}
    except Exception as e:
        return {"complaints": [], "status": "error", "message": str(e)}

@app.get("/complaints/range")
async def get_complaints_by_date_range(from_date: Optional[str] = None, to_date: Optional[str] = None):
    """الحصول على الشكاوى حسب النطاق الزمني"""
    try:
        params = {}
        if from_date:
            params["from"] = from_date
        if to_date:
            params["to"] = to_date
        complaints = await api_client.get("ComplaintsStudent/range", params)
        return {"complaints": complaints, "status": "success"}
    except Exception as e:
        return {"complaints": [], "status": "error", "message": str(e)}

@app.get("/complaints/count/{status_id}")
async def get_complaints_count_by_status(status_id: str):
    """الحصول على عدد الشكاوى حسب الحالة"""
    try:
        count = await api_client.get(f"ComplaintsStudent/count/{status_id}")
        return {"count": count, "status": "success"}
    except Exception as e:
        return {"count": 0, "status": "error", "message": str(e)}

@app.get("/complaints/{complaint_id}/file")
async def get_complaint_file(complaint_id: str):
    """الحصول على ملف الشكوى"""
    try:
        file = await api_client.get(f"ComplaintsStudent/{complaint_id}/file")
        return {"file": file, "status": "success"}
    except Exception as e:
        return {"file": None, "status": "error", "message": str(e)}

# نقاط النهاية لأنواع الشكاوى
@app.get("/complaint-types")
async def get_complaint_types():
    """الحصول على جميع أنواع الشكاوى"""
    try:
        types = await api_client.get("ComplaintsType")
        return {"types": types, "status": "success"}
    except Exception as e:
        return {"types": [], "status": "error", "message": str(e)}

@app.get("/complaint-types/{type_id}")
async def get_complaint_type(type_id: str):
    """الحصول على نوع شكوى محدد"""
    try:
        complaint_type = await api_client.get(f"ComplaintsType/{type_id}")
        return {"type": complaint_type, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Complaint type not found: {str(e)}")

@app.post("/complaint-types")
async def create_complaint_type(type_data: dict):
    """إنشاء نوع شكوى جديد"""
    try:
        complaint_type = await api_client.post("ComplaintsType", type_data)
        return {"type": complaint_type, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create complaint type: {str(e)}")

@app.put("/complaint-types/{type_id}")
async def update_complaint_type(type_id: str, type_data: dict):
    """تحديث نوع شكوى موجود"""
    try:
        complaint_type = await api_client.put(f"ComplaintsType/{type_id}", type_data)
        return {"type": complaint_type, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update complaint type: {str(e)}")

@app.delete("/complaint-types/{type_id}")
async def delete_complaint_type(type_id: str):
    """حذف نوع شكوى"""
    try:
        result = await api_client.delete(f"ComplaintsType/{type_id}")
        return {"message": "Complaint type deleted successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete complaint type: {str(e)}")

@app.get("/complaint-types/company/{company_id}")
async def get_company_complaint_types(company_id: str):
    """الحصول على أنواع الشكاوى حسب الشركة"""
    try:
        types = await api_client.get(f"ComplaintsType/company/{company_id}")
        return {"types": types, "status": "success"}
    except Exception as e:
        return {"types": [], "status": "error", "message": str(e)}

@app.get("/complaint-types/branch/{branch_id}")
async def get_branch_complaint_types(branch_id: str):
    """الحصول على أنواع الشكاوى حسب الفرع"""
    try:
        types = await api_client.get(f"ComplaintsType/branch/{branch_id}")
        return {"types": types, "status": "success"}
    except Exception as e:
        return {"types": [], "status": "error", "message": str(e)}

@app.get("/complaint-types/exists")
async def check_complaint_type_exists(name: Optional[str] = None):
    """التحقق من وجود نوع شكوى"""
    try:
        params = {}
        if name:
            params["name"] = name
        exists = await api_client.get("ComplaintsType/exists", params)
        return {"exists": exists, "status": "success"}
    except Exception as e:
        return {"exists": False, "status": "error", "message": str(e)}

# نقاط النهاية لحالات الشكاوى
@app.get("/complaint-status")
async def get_complaint_status():
    """الحصول على جميع حالات الشكاوى"""
    try:
        status = await api_client.get("ComplaintsStatus")
        return {"status": status, "status": "success"}
    except Exception as e:
        return {"status": [], "status": "error", "message": str(e)}

@app.get("/complaint-status/{status_id}")
async def get_complaint_status_by_id(status_id: str):
    """الحصول على حالة شكوى محددة"""
    try:
        status = await api_client.get(f"ComplaintsStatus/{status_id}")
        return {"status": status, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Complaint status not found: {str(e)}")

@app.post("/complaint-status")
async def create_complaint_status(status_data: dict):
    """إنشاء حالة شكوى جديدة"""
    try:
        status = await api_client.post("ComplaintsStatus", status_data)
        return {"status": status, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create complaint status: {str(e)}")

@app.put("/complaint-status/{status_id}")
async def update_complaint_status(status_id: str, status_data: dict):
    """تحديث حالة شكوى موجودة"""
    try:
        status = await api_client.put(f"ComplaintsStatus/{status_id}", status_data)
        return {"status": status, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update complaint status: {str(e)}")

@app.delete("/complaint-status/{status_id}")
async def delete_complaint_status(status_id: str):
    """حذف حالة شكوى"""
    try:
        result = await api_client.delete(f"ComplaintsStatus/{status_id}")
        return {"message": "Complaint status deleted successfully", "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to delete complaint status: {str(e)}")

# نقاط النهاية للمواقع الجغرافية
@app.get("/countries")
async def get_countries():
    """الحصول على الدول"""
    try:
        countries = await api_client.get("CountryCode")
        return {"countries": countries, "status": "success"}
    except Exception as e:
        return {"countries": [], "status": "error", "message": str(e)}

@app.get("/governorates")
async def get_governorates():
    """الحصول على المحافظات"""
    try:
        governorates = await api_client.get("GovernorateCode")
        return {"governorates": governorates, "status": "success"}
    except Exception as e:
        return {"governorates": [], "status": "error", "message": str(e)}

@app.get("/cities")
async def get_cities():
    """الحصول على المدن"""
    try:
        cities = await api_client.get("CityCode")
        return {"cities": cities, "status": "success"}
    except Exception as e:
        return {"cities": [], "status": "error", "message": str(e)}

# نقاط النهاية للحضور والتقييم
@app.get("/attendance")
async def get_attendance():
    """الحصول على بيانات الحضور"""
    try:
        attendance = await api_client.get("StudentAttend")
        return {"attendance": attendance, "status": "success"}
    except Exception as e:
        return {"attendance": [], "status": "error", "message": str(e)}

@app.get("/evaluations")
async def get_evaluations():
    """الحصول على التقييمات"""
    try:
        evaluations = await api_client.get("StudentEvaluation")
        return {"evaluations": evaluations, "status": "success"}
    except Exception as e:
        return {"evaluations": [], "status": "error", "message": str(e)}

@app.get("/student-groups")
async def get_student_groups():
    """الحصول على مجموعات الطلاب"""
    try:
        groups = await api_client.get("StudentGroup")
        return {"groups": groups, "status": "success"}
    except Exception as e:
        return {"groups": [], "status": "error", "message": str(e)}

# نقاط النهاية للدردشة
@app.get("/chat/messages")
async def get_chat_messages():
    """الحصول على رسائل الدردشة"""
    try:
        messages = await api_client.get("Chat")
        return {"messages": messages, "status": "success"}
    except Exception as e:
        return {"messages": [], "status": "error", "message": str(e)}

# Generic proxy for Angular's existing `/api/...` endpoints
"""
This allows the frontend to keep calling `/api/...` while pointing baseUrl to this backend.
It now correctly forwards raw bodies (including multipart/form-data) and returns binary responses.
"""
@app.api_route("/api/{full_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_api(full_path: str, request: Request):
    method = request.method
    params = dict(request.query_params)

    # Read raw body once (supports JSON, form-data, files, etc.)
    body_bytes = await request.body()

    # Prepare headers: forward most headers except hop-by-hop ones
    forward_headers = {}
    for k, v in request.headers.items():
        lk = k.lower()
        if lk in {"host", "content-length", "accept-encoding", "connection"}:
            continue
        # Forward Authorization and Content-Type, etc.
        forward_headers[k] = v

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            target_url = f"{EXTERNAL_API_BASE}/{full_path}"
            resp = await client.request(
                method,
                target_url,
                params=params,
                content=body_bytes if body_bytes else None,
                headers=forward_headers,
            )
            # Do not raise for status here; preserve upstream status codes
            # Build FastAPI Response preserving content-type and disposition for files
            response_headers = {}
            ct = resp.headers.get("content-type")
            cd = resp.headers.get("content-disposition")
            if ct:
                response_headers["content-type"] = ct
            if cd:
                response_headers["content-disposition"] = cd
            return Response(content=resp.content, status_code=resp.status_code, headers=response_headers)
    except httpx.HTTPError as e:
        status = getattr(e.response, "status_code", 500) if hasattr(e, "response") and e.response is not None else 500
        raise HTTPException(status_code=status, detail=f"External API error: {str(e)}")

# Expose Swagger paths for comparison in the frontend
@app.get("/swagger/paths")
async def swagger_paths():
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.get(f"{EXTERNAL_API_BASE}/swagger/v1/swagger.json")
            resp.raise_for_status()
            data = resp.json()
            paths = sorted(list((data.get("paths") or {}).keys()))
            return {"count": len(paths), "paths": paths}
    except httpx.HTTPError as e:
        status = getattr(e.response, "status_code", 500) if hasattr(e, "response") and e.response is not None else 500
        raise HTTPException(status_code=status, detail=f"Failed to fetch swagger: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

