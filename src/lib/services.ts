'use server';

// Mock data services. No database connection needed.

export interface Teacher {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be handled securely in a real app
  role?: 'teacher' | 'admin';
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be handled securely in a real app
  grade: string;
  teacherId: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: string[];
  teacherId: string;
}

export interface QuizResult {
  id: string;
  studentId: string;
  courseId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  submittedAt: string;
}

// In-memory "database"
let mockTeachers: Teacher[] = [
  { id: 't1', name: 'Jane Doe', email: 'jane.doe@school.com', password: 'password123', role: 'teacher' },
  { id: 't2', name: 'John Smith', email: 'john.smith@school.com', password: 'password123', role: 'teacher' },
];

let mockStudents: Student[] = [
  { id: 's1', name: 'Alex Doe', grade: '10th Grade', teacherId: 't1', email: 'alex.doe@school.com', password: 'password123' },
  { id: 's2', name: 'Sam Wilson', grade: '10th Grade', teacherId: 't1', email: 'sam.wilson@school.com', password: 'password123' },
  { id: 's3', name: 'Maria Hill', grade: '11th Grade', teacherId: 't2', email: 'maria.hill@school.com', password: 'password123' },
];

let mockCourses: Course[] = [
  { 
    id: 'c1', 
    title: 'Introduction to Algebra', 
    description: 'Learn the fundamentals of algebraic expressions and equations.', 
    modules: ['Variables and Expressions', 'Solving Equations', 'Functions and Graphs'], 
    teacherId: 't1' 
  },
  { 
    id: 'c2', 
    title: 'World History: Ancient Civilizations', 
    description: 'Explore the history of early human societies from Mesopotamia to Rome.', 
    modules: ['The Fertile Crescent', 'Ancient Egypt', 'Greece and Rome'], 
    teacherId: 't2' 
  },
];

let mockQuizResults: QuizResult[] = [];


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const generateId = (prefix: string) => `${prefix}${Date.now()}${Math.random().toString(36).substring(2, 5)}`;

// Teacher Services
export async function addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
  await delay(300);
  const newTeacher: Teacher = { ...teacher, id: generateId('t') };
  mockTeachers.push(newTeacher);
  return newTeacher;
};

export async function getTeachers(): Promise<Teacher[]> {
  await delay(300);
  return [...mockTeachers];
};

export async function getTeacherByName(name: string): Promise<Teacher | null> {
    await delay(100);
    return mockTeachers.find(t => t.name === name) || null;
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
    await delay(100);
    return mockTeachers.find(t => t.id === id) || null;
}

export async function updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | null> {
  await delay(300);
  const teacherIndex = mockTeachers.findIndex(t => t.id === id);
  if (teacherIndex === -1) return null;
  const originalPassword = mockTeachers[teacherIndex].password;
  mockTeachers[teacherIndex] = { ...mockTeachers[teacherIndex], ...updates };
  if (!updates.password) {
    mockTeachers[teacherIndex].password = originalPassword;
  }
  return mockTeachers[teacherIndex];
}

export async function updateTeacherPassword(teacherId: string, currentPassword: string, newPassword: string):Promise<boolean> {
  await delay(300);
  const teacherIndex = mockTeachers.findIndex(t => t.id === teacherId);
  if (teacherIndex === -1) return false;

  const teacher = mockTeachers[teacherIndex];
  if (teacher.password !== currentPassword) {
    return false;
  }
  
  teacher.password = newPassword;
  return true;
}


export async function deleteTeacher(id: string): Promise<void> {
  await delay(300);
  mockTeachers = mockTeachers.filter(t => t.id !== id);
  mockStudents = mockStudents.map(s => s.teacherId === id ? { ...s, teacherId: '' } : s);
  mockCourses = mockCourses.map(c => c.teacherId === id ? { ...c, teacherId: '' } : c);
};

export async function getTeacherByEmail(email: string): Promise<Teacher | null> {
  await delay(100);
  return mockTeachers.find(t => t.email.toLowerCase() === email.toLowerCase()) || null;
}

// Student Services
export async function addStudent(student: Omit<Student, 'id'>): Promise<Student> {
  await delay(300);
  const newStudent: Student = { ...student, id: generateId('s') };
  mockStudents.push(newStudent);
  return newStudent;
};

export async function getStudents(): Promise<Student[]> {
  await delay(300);
  return [...mockStudents];
};

export async function getStudentByName(name: string): Promise<Student | null> {
    await delay(100);
    return mockStudents.find(s => s.name === name) || null;
}

export async function getStudentByEmail(email: string): Promise<Student | null> {
  await delay(100);
  return mockStudents.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getStudentsForTeacher(teacherId: string): Promise<Student[]> {
    await delay(200);
    return mockStudents.filter(s => s.teacherId === teacherId);
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
  await delay(300);
  const studentIndex = mockStudents.findIndex(s => s.id === id);
  if (studentIndex === -1) return null;
  const originalPassword = mockStudents[studentIndex].password;
  mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...updates };
  if (!updates.password) {
    mockStudents[studentIndex].password = originalPassword;
  }
  return mockStudents[studentIndex];
}

export async function updateStudentPassword(studentId: string, currentPassword: string, newPassword: string):Promise<boolean> {
  await delay(300);
  const studentIndex = mockStudents.findIndex(s => s.id === studentId);
  if (studentIndex === -1) return false;

  const student = mockStudents[studentIndex];
  if (student.password !== currentPassword) {
    return false;
  }
  
  student.password = newPassword;
  return true;
}

export async function deleteStudent(id: string): Promise<void> {
  await delay(300);
  mockStudents = mockStudents.filter(s => s.id !== id);
};

// Course Services
export async function addCourse(course: Omit<Course, 'id'>): Promise<Course> {
  await delay(300);
  const newCourse: Course = { ...course, id: generateId('c') };
  mockCourses.push(newCourse);
  return newCourse;
};

export async function getCourses(): Promise<Course[]> {
  await delay(300);
  return [...mockCourses];
};

export async function getCoursesForTeacher(teacherId: string): Promise<Course[]> {
    await delay(200);
    return mockCourses.filter(c => c.teacherId === teacherId);
}

export async function getCoursesForStudent(studentId: string): Promise<Course[]> {
    await delay(200);
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return [];
    return mockCourses.filter(c => c.teacherId === student.teacherId);
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
  await delay(300);
  const courseIndex = mockCourses.findIndex(c => c.id === id);
  if (courseIndex === -1) return null;
  mockCourses[courseIndex] = { ...mockCourses[courseIndex], ...updates };
  return mockCourses[courseIndex];
}

export async function deleteCourse(id: string): Promise<void> {
  await delay(300);
  mockCourses = mockCourses.filter(c => c.id !== id);
};

// Quiz Result Services
export async function submitQuizResult(result: Omit<QuizResult, 'id' | 'submittedAt'>): Promise<void> {
  await delay(100);
  const newResult: QuizResult = {
    ...result,
    id: generateId('qr'),
    submittedAt: new Date().toISOString(),
  };

  // Remove previous result for the same student and course
  const filteredResults = mockQuizResults.filter(
    r => !(r.studentId === newResult.studentId && r.courseId === newResult.courseId)
  );
  
  filteredResults.push(newResult);
  mockQuizResults = filteredResults;
}

export async function getQuizResultsForCourse(courseId: string): Promise<QuizResult[]> {
  await delay(200);
  return mockQuizResults.filter(r => r.courseId === courseId);
}

export async function getLatestQuizResultForStudent(studentId: string, courseId: string): Promise<QuizResult | null> {
    await delay(100);
    const studentResultsForCourse = mockQuizResults
        .filter(r => r.studentId === studentId && r.courseId === courseId)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return studentResultsForCourse[0] || null;
}
