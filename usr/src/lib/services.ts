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

interface MockDB {
  teachers: Teacher[];
  students: Student[];
  courses: Course[];
  quizResults: QuizResult[];
}

// Use a global singleton to persist data across hot reloads in development
const globalForDb = globalThis as unknown as { db: MockDB | undefined };

const db = globalForDb.db ?? {
  teachers: [
    { id: 't1', name: 'Jane Doe', email: 'jane.doe@school.com', password: 'password123', role: 'teacher' },
    { id: 't2', name: 'John Smith', email: 'john.smith@school.com', password: 'password123', role: 'teacher' },
    { id: 't0', name: 'Admin User', email: 'admin@sahayak.com', password: 'SahayakAdmin123', role: 'admin' },
  ],
  students: [
    { id: 's1', name: 'Alex Doe', grade: '10th Grade', teacherId: 't1', email: 'alex.doe@school.com', password: 'password123' },
    { id: 's2', name: 'Sam Wilson', grade: '10th Grade', teacherId: 't1', email: 'sam.wilson@school.com', password: 'password123' },
    { id: 's3', name: 'Maria Hill', grade: '11th Grade', teacherId: 't2', email: 'maria.hill@school.com', password: 'password123' },
  ],
  courses: [
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
  ],
  quizResults: [],
};

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const generateId = (prefix: string) => `${prefix}${Date.now()}${Math.random().toString(36).substring(2, 5)}`;

// Teacher Services
export async function addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
  await delay(300);
  const newTeacher: Teacher = { ...teacher, id: generateId('t') };
  db.teachers.push(newTeacher);
  return newTeacher;
};

export async function getTeachers(): Promise<Teacher[]> {
  await delay(300);
  return [...db.teachers];
};

export async function getTeacherByName(name: string): Promise<Teacher | null> {
    await delay(100);
    return db.teachers.find(t => t.name === name) || null;
}

export async function getTeacherById(id: string): Promise<Teacher | null> {
    await delay(100);
    return db.teachers.find(t => t.id === id) || null;
}

export async function updateTeacher(id: string, updates: Partial<Teacher>): Promise<Teacher | null> {
  await delay(300);
  const teacherIndex = db.teachers.findIndex(t => t.id === id);
  if (teacherIndex === -1) return null;
  const originalPassword = db.teachers[teacherIndex].password;
  db.teachers[teacherIndex] = { ...db.teachers[teacherIndex], ...updates };
  if (!updates.password) {
    db.teachers[teacherIndex].password = originalPassword;
  }
  return db.teachers[teacherIndex];
}

export async function updateTeacherPassword(teacherId: string, currentPassword: string, newPassword: string):Promise<boolean> {
  await delay(300);
  const teacherIndex = db.teachers.findIndex(t => t.id === teacherId);
  if (teacherIndex === -1) return false;

  const teacher = db.teachers[teacherIndex];
  if (teacher.password !== currentPassword) {
    return false;
  }
  
  teacher.password = newPassword;
  return true;
}


export async function deleteTeacher(id: string): Promise<void> {
  await delay(300);
  db.teachers = db.teachers.filter(t => t.id !== id);
  db.students = db.students.map(s => s.teacherId === id ? { ...s, teacherId: '' } : s);
  db.courses = db.courses.map(c => c.teacherId === id ? { ...c, teacherId: '' } : c);
};

export async function getTeacherByEmail(email: string): Promise<Teacher | null> {
  await delay(100);
  return db.teachers.find(t => t.email.toLowerCase() === email.toLowerCase()) || null;
}

// Student Services
export async function addStudent(student: Omit<Student, 'id'>): Promise<Student> {
  await delay(300);
  const newStudent: Student = { ...student, id: generateId('s') };
  db.students.push(newStudent);
  return newStudent;
};

export async function getStudents(): Promise<Student[]> {
  await delay(300);
  return [...db.students];
};

export async function getStudentByName(name: string): Promise<Student | null> {
    await delay(100);
    return db.students.find(s => s.name === name) || null;
}

export async function getStudentByEmail(email: string): Promise<Student | null> {
  await delay(100);
  return db.students.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
}

export async function getStudentsForTeacher(teacherId: string): Promise<Student[]> {
    await delay(200);
    return db.students.filter(s => s.teacherId === teacherId);
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
  await delay(300);
  const studentIndex = db.students.findIndex(s => s.id === id);
  if (studentIndex === -1) return null;
  const originalPassword = db.students[studentIndex].password;
  db.students[studentIndex] = { ...db.students[studentIndex], ...updates };
  if (!updates.password) {
    db.students[studentIndex].password = originalPassword;
  }
  return db.students[studentIndex];
}

export async function updateStudentPassword(studentId: string, currentPassword: string, newPassword: string):Promise<boolean> {
  await delay(300);
  const studentIndex = db.students.findIndex(s => s.id === studentId);
  if (studentIndex === -1) return false;

  const student = db.students[studentIndex];
  if (student.password !== currentPassword) {
    return false;
  }
  
  student.password = newPassword;
  return true;
}

export async function deleteStudent(id: string): Promise<void> {
  await delay(300);
  db.students = db.students.filter(s => s.id !== id);
};

// Course Services
export async function addCourse(course: Omit<Course, 'id'>): Promise<Course> {
  await delay(300);
  const newCourse: Course = { ...course, id: generateId('c') };
  db.courses.push(newCourse);
  return newCourse;
};

export async function getCourses(): Promise<Course[]> {
  await delay(300);
  return [...db.courses];
};

export async function getCoursesForTeacher(teacherId: string): Promise<Course[]> {
    await delay(200);
    return db.courses.filter(c => c.teacherId === teacherId);
}

export async function getCoursesForStudent(studentId: string): Promise<Course[]> {
    await delay(200);
    const student = db.students.find(s => s.id === studentId);
    if (!student) return [];
    return db.courses.filter(c => c.teacherId === student.teacherId);
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course | null> {
  await delay(300);
  const courseIndex = db.courses.findIndex(c => c.id === id);
  if (courseIndex === -1) return null;
  db.courses[courseIndex] = { ...db.courses[courseIndex], ...updates };
  return db.courses[courseIndex];
}

export async function deleteCourse(id: string): Promise<void> {
  await delay(300);
  db.courses = db.courses.filter(c => c.id !== id);
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
  const filteredResults = db.quizResults.filter(
    r => !(r.studentId === newResult.studentId && r.courseId === newResult.courseId)
  );
  
  filteredResults.push(newResult);
  db.quizResults = filteredResults;
}

export async function getQuizResultsForCourse(courseId: string): Promise<QuizResult[]> {
  await delay(200);
  return db.quizResults.filter(r => r.courseId === courseId);
}

export async function getLatestQuizResultForStudent(studentId: string, courseId: string): Promise<QuizResult | null> {
    await delay(100);
    const studentResultsForCourse = db.quizResults
        .filter(r => r.studentId === studentId && r.courseId === courseId)
        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    return studentResultsForCourse[0] || null;
}
