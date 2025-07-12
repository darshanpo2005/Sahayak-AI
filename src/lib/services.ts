// Mock data services. No database connection needed.

export interface Teacher {
  id: string;
  name: string;
  email: string;
}

export interface Student {
  id: string;
  name: string;
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

// Mock Database
let mockTeachers: Teacher[] = [
  { id: 't1', name: 'Jane Doe', email: 'jane.doe@school.com' },
  { id: 't2', name: 'John Smith', email: 'john.smith@school.com' },
];

let mockStudents: Student[] = [
  { id: 's1', name: 'Alex Doe', grade: '10th Grade', teacherId: 't1' },
  { id: 's2', name: 'Sam Wilson', grade: '10th Grade', teacherId: 't1' },
  { id: 's3', name: 'Maria Hill', grade: '11th Grade', teacherId: 't2' },
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

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Helper to generate unique IDs
const generateId = (prefix: string) => `${prefix}${Date.now()}${Math.random().toString(36).substring(2, 5)}`;

// Teacher Services
export const addTeacher = async (teacher: Omit<Teacher, 'id'>): Promise<Teacher> => {
  await delay(300);
  const newTeacher: Teacher = { ...teacher, id: generateId('t') };
  mockTeachers.push(newTeacher);
  return newTeacher;
};

export const getTeachers = async (): Promise<Teacher[]> => {
  await delay(300);
  return [...mockTeachers];
};

export const getTeacherByName = async (name: string): Promise<Teacher | null> => {
    await delay(100);
    return mockTeachers.find(t => t.name === name) || null;
}

export const getTeacherById = async (id: string): Promise<Teacher | null> => {
    await delay(100);
    return mockTeachers.find(t => t.id === id) || null;
}

export const deleteTeacher = async (id: string): Promise<void> => {
  await delay(300);
  mockTeachers = mockTeachers.filter(t => t.id !== id);
  // Also unassign students and courses from this teacher
  mockStudents = mockStudents.map(s => s.teacherId === id ? { ...s, teacherId: '' } : s);
  mockCourses = mockCourses.map(c => c.teacherId === id ? { ...c, teacherId: '' } : c);
};

// Student Services
export const addStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  await delay(300);
  const newStudent: Student = { ...student, id: generateId('s') };
  mockStudents.push(newStudent);
  return newStudent;
};

export const getStudents = async (): Promise<Student[]> => {
  await delay(300);
  return [...mockStudents];
};

export const getStudentByName = async (name: string): Promise<Student | null> => {
    await delay(100);
    return mockStudents.find(s => s.name === name) || null;
}

export const getStudentsForTeacher = async (teacherId: string): Promise<Student[]> => {
    await delay(200);
    return mockStudents.filter(s => s.teacherId === teacherId);
}

export const deleteStudent = async (id: string): Promise<void> => {
  await delay(300);
  mockStudents = mockStudents.filter(s => s.id !== id);
};

// Course Services
export const addCourse = async (course: Omit<Course, 'id'>): Promise<Course> => {
  await delay(300);
  const newCourse: Course = { ...course, id: generateId('c') };
  mockCourses.push(newCourse);
  return newCourse;
};

export const getCourses = async (): Promise<Course[]> => {
  await delay(300);
  return [...mockCourses];
};

export const getCoursesForTeacher = async (teacherId: string): Promise<Course[]> => {
    await delay(200);
    return mockCourses.filter(c => c.teacherId === teacherId);
}

// For simplicity, we'll return all courses for any student.
export const getCoursesForStudent = async (studentId: string): Promise<Course[]> => {
    await delay(200);
    return getCourses();
}

export const deleteCourse = async (id: string): Promise<void> => {
  await delay(300);
  mockCourses = mockCourses.filter(c => c.id !== id);
};

// This is no longer needed but kept for compatibility with components that might import it.
export const isFirebaseConfigured = true;
