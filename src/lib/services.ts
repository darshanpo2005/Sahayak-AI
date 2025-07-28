
'use server';

import { createNotification } from './notificationService';

// Mock data services. No database connection needed.
export type Theme = 'default' | 'green' | 'purple';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be handled securely in a real app
  role?: 'teacher' | 'admin';
  theme?: Theme;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be handled securely in a real app
  grade: string; // Used as "Department" for interns
  teacherId: string; // Used as "ManagerId" for interns
  theme?: Theme;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: string[]; // Used for resource content links
  teacherId: string; // Used as "ManagerId" for resources
}

export interface QuizResult {
  id:string;
  studentId: string;
  courseId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  submittedAt: string;
  answers: Record<number, string>;
  graded?: boolean;
}

interface MockDB {
  teachers: Teacher[]; // Managers
  students: Student[]; // Interns
  courses: Course[]; // Resources
  quizResults: QuizResult[];
}

// Use a global singleton to persist data across hot reloads in development
const globalForDb = globalThis as unknown as { db: MockDB | undefined };

const db = globalForDb.db ?? {
  teachers: [ // Managers
    { id: 't1', name: 'Dr. Evelyn Reed', email: 'e.reed@bel.com', password: 'password123', role: 'admin' },
    { id: 't2', name: 'Mr. Johnathan Chen', email: 'j.chen@bel.com', password: 'password123', role: 'admin' },
  ],
  students: [ // Interns
    { id: 's1', name: 'Alex Doe', grade: 'Networking', teacherId: 't1', email: 'alex.doe@bel.com', password: 'password123', theme: 'default' },
    { id: 's2', name: 'Sam Wilson', grade: 'Cyber-Security', teacherId: 't1', email: 'sam.wilson@bel.com', password: 'password123', theme: 'default' },
    { id: 's3', name: 'Maria Hill', grade: 'Networking', teacherId: 't2', email: 'maria.hill@bel.com', password: 'password123', theme: 'default' },
  ],
  courses: [ // Resources
    { 
      id: 'c1', 
      title: 'Intro to TCP/IP', 
      description: 'Fundamentals of the TCP/IP protocol suite.', 
      modules: ['OSI Model PDF', 'Packet Tracing Guide', 'Subnetting Cheat Sheet'], 
      teacherId: 't1' 
    },
    { 
      id: 'c2', 
      title: 'Ethical Hacking Principles', 
      description: 'Learn the core principles of ethical hacking and penetration testing.', 
      modules: ['Reconnaissance Video', 'Scanning Techniques PDF'], 
      teacherId: 't2' 
    },
  ],
  quizResults: [],
};

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const generateId = (prefix: string) => `${prefix}${Date.now()}${Math.random().toString(36).substring(2, 5)}`;

// Manager Services (formerly Teacher)
export async function addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
  await delay(300);
  const newManager: Teacher = { ...teacher, id: generateId('t'), theme: 'default', role: 'admin' };
  db.teachers.push(newManager);
  return newManager;
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
  db.teachers[teacherIndex] = { ...db.teachers[teacherIndex], ...updates, role: 'admin' };
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

export async function updateTeacherTheme(teacherId: string, theme: Theme): Promise<void> {
    await delay(100);
    const teacher = db.teachers.find(t => t.id === teacherId);
    if(teacher) {
        teacher.theme = theme;
    }
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

// Intern Services (formerly Student)
export async function addStudent(student: Omit<Student, 'id'>): Promise<Student> {
  await delay(300);
  const newIntern: Student = { ...student, id: generateId('s'), theme: 'default' };
  db.students.push(newIntern);
  return newIntern;
};

export async function getStudents(): Promise<Student[]> {
  await delay(300);
  return [...db.students];
};

export async function getStudentById(id: string): Promise<Student | null> {
    await delay(100);
    return db.students.find(s => s.id === id) || null;
}


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

export async function updateStudentTheme(studentId: string, theme: Theme): Promise<void> {
    await delay(100);
    const student = db.students.find(s => s.id === studentId);
    if(student) {
        student.theme = theme;
    }
}

export async function deleteStudent(id: string): Promise<void> {
  await delay(300);
  db.students = db.students.filter(s => s.id !== id);
};

export async function notifyTeacherOfQuestion(studentId: string, question: string, courseTopic: string): Promise<void> {
  await delay(50);
  const student = await getStudentById(studentId);
  if (!student || !student.teacherId) return;

  await createNotification({
    userId: student.teacherId, // Manager's ID
    message: `${student.name} submitted a query about "${courseTopic}": "${question.substring(0, 50)}${question.length > 50 ? '...' : ''}"`,
    link: '/management?tab=queries', // A future queries tab for managers
  });
}


// Resource Services (formerly Course)
export async function addCourse(course: Omit<Course, 'id'>): Promise<Course> {
  await delay(300);
  const newResource: Course = { ...course, id: generateId('c') };
  db.courses.push(newResource);
  return newResource;
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

// Quiz Result Services (can be repurposed for attendance/leaderboard later)
export async function submitQuizResult(result: Omit<QuizResult, 'id' | 'submittedAt' | 'graded'>): Promise<void> {
  await delay(100);
  const newResult: QuizResult = {
    ...result,
    id: generateId('qr'),
    submittedAt: new Date().toISOString(),
    graded: false
  };

  const filteredResults = db.quizResults.filter(
    r => !(r.studentId === newResult.studentId && r.courseId === newResult.courseId)
  );
  
  filteredResults.push(newResult);
  db.quizResults = filteredResults;
}

export async function gradeQuiz(quizResultId: string): Promise<boolean> {
  await delay(100);
  const result = db.quizResults.find(r => r.id === quizResultId);
  if (!result) return false;
  
  result.graded = true;
  return true;
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
