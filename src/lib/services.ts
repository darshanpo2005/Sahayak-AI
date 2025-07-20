'use server';

import type { GenerateQuizQuestionsOutput } from "./actions";

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

export type StoredQuiz = GenerateQuizQuestionsOutput & { courseId: string };

// Default Mock Database
const defaultTeachers: Teacher[] = [
  { id: 't1', name: 'Jane Doe', email: 'jane.doe@school.com', password: 'password123', role: 'teacher' },
  { id: 't2', name: 'John Smith', email: 'john.smith@school.com', password: 'password123', role: 'teacher' },
];

const defaultStudents: Student[] = [
  { id: 's1', name: 'Alex Doe', grade: '10th Grade', teacherId: 't1', email: 'alex.doe@school.com', password: 'password123' },
  { id: 's2', name: 'Sam Wilson', grade: '10th Grade', teacherId: 't1', email: 'sam.wilson@school.com', password: 'password123' },
  { id: 's3', name: 'Maria Hill', grade: '11th Grade', teacherId: 't2', email: 'maria.hill@school.com', password: 'password123' },
];

const defaultCourses: Course[] = [
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

const getFromStorage = <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') {
        return defaultValue;
    }
    const storedValue = localStorage.getItem(key);
    if (storedValue) {
        try {
            return JSON.parse(storedValue);
        } catch (error) {
            console.error(`Error parsing localStorage key "${key}":`, error);
            return defaultValue;
        }
    }
    return defaultValue;
}

const saveToStorage = <T>(key: string, value: T) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value));
    }
}

let mockTeachers: Teacher[] = getFromStorage('mock_teachers', defaultTeachers);
let mockStudents: Student[] = getFromStorage('mock_students', defaultStudents);
let mockCourses: Course[] = getFromStorage('mock_courses', defaultCourses);

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const generateId = (prefix: string) => `${prefix}${Date.now()}${Math.random().toString(36).substring(2, 5)}`;

// Teacher Services
export const addTeacher = async (teacher: Omit<Teacher, 'id'>): Promise<Teacher> => {
  await delay(300);
  const newTeacher: Teacher = { ...teacher, id: generateId('t') };
  mockTeachers.push(newTeacher);
  saveToStorage('mock_teachers', mockTeachers);
  return newTeacher;
};

export const getTeachers = async (): Promise<Teacher[]> => {
  await delay(300);
  return [...getFromStorage('mock_teachers', defaultTeachers)];
};

export const getTeacherByName = async (name: string): Promise<Teacher | null> => {
    await delay(100);
    return getFromStorage('mock_teachers', defaultTeachers).find(t => t.name === name) || null;
}

export const getTeacherById = async (id: string): Promise<Teacher | null> => {
    await delay(100);
    return getFromStorage('mock_teachers', defaultTeachers).find(t => t.id === id) || null;
}

export const updateTeacher = async (id: string, updates: Partial<Teacher>): Promise<Teacher | null> => {
  await delay(300);
  const teachers = getFromStorage('mock_teachers', defaultTeachers);
  const teacherIndex = teachers.findIndex(t => t.id === id);
  if (teacherIndex === -1) return null;
  const originalPassword = teachers[teacherIndex].password;
  teachers[teacherIndex] = { ...teachers[teacherIndex], ...updates };
  if (!updates.password) {
    teachers[teacherIndex].password = originalPassword;
  }
  saveToStorage('mock_teachers', teachers);
  return teachers[teacherIndex];
}

export const updateTeacherPassword = async (teacherId: string, currentPassword: string, newPassword: string):Promise<boolean> => {
  await delay(300);
  const teachers = getFromStorage('mock_teachers', defaultTeachers);
  const teacherIndex = teachers.findIndex(t => t.id === teacherId);
  if (teacherIndex === -1) return false;

  const teacher = teachers[teacherIndex];
  if (teacher.password !== currentPassword) {
    return false;
  }
  
  teacher.password = newPassword;
  saveToStorage('mock_teachers', teachers);
  return true;
}


export const deleteTeacher = async (id: string): Promise<void> => {
  await delay(300);
  let teachers = getFromStorage('mock_teachers', defaultTeachers);
  let students = getFromStorage('mock_students', defaultStudents);
  let courses = getFromStorage('mock_courses', defaultCourses);
  
  teachers = teachers.filter(t => t.id !== id);
  students = students.map(s => s.teacherId === id ? { ...s, teacherId: '' } : s);
  courses = courses.map(c => c.teacherId === id ? { ...c, teacherId: '' } : c);
  
  saveToStorage('mock_teachers', teachers);
  saveToStorage('mock_students', students);
  saveToStorage('mock_courses', courses);
};

export const getTeacherByEmail = async (email: string): Promise<Teacher | null> => {
  await delay(100);
  return getFromStorage('mock_teachers', defaultTeachers).find(t => t.email.toLowerCase() === email.toLowerCase()) || null;
}

// Student Services
export const addStudent = async (student: Omit<Student, 'id'>): Promise<Student> => {
  await delay(300);
  const newStudent: Student = { ...student, id: generateId('s') };
  const students = getFromStorage('mock_students', defaultStudents);
  students.push(newStudent);
  saveToStorage('mock_students', students);
  return newStudent;
};

export const getStudents = async (): Promise<Student[]> => {
  await delay(300);
  return [...getFromStorage('mock_students', defaultStudents)];
};

export const getStudentByName = async (name: string): Promise<Student | null> => {
    await delay(100);
    return getFromStorage('mock_students', defaultStudents).find(s => s.name === name) || null;
}

export const getStudentByEmail = async (email: string): Promise<Student | null> => {
  await delay(100);
  return getFromStorage('mock_students', defaultStudents).find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
}

export const getStudentsForTeacher = async (teacherId: string): Promise<Student[]> => {
    await delay(200);
    return getFromStorage('mock_students', defaultStudents).filter(s => s.teacherId === teacherId);
}

export const updateStudent = async (id: string, updates: Partial<Student>): Promise<Student | null> => {
  await delay(300);
  const students = getFromStorage('mock_students', defaultStudents);
  const studentIndex = students.findIndex(s => s.id === id);
  if (studentIndex === -1) return null;
  const originalPassword = students[studentIndex].password;
  students[studentIndex] = { ...students[studentIndex], ...updates };
  if (!updates.password) {
    students[studentIndex].password = originalPassword;
  }
  saveToStorage('mock_students', students);
  return students[studentIndex];
}

export const updateStudentPassword = async (studentId: string, currentPassword: string, newPassword: string):Promise<boolean> => {
  await delay(300);
  const students = getFromStorage('mock_students', defaultStudents);
  const studentIndex = students.findIndex(s => s.id === studentId);
  if (studentIndex === -1) return false;

  const student = students[studentIndex];
  if (student.password !== currentPassword) {
    return false;
  }
  
  student.password = newPassword;
  saveToStorage('mock_students', students);
  return true;
}

export const deleteStudent = async (id: string): Promise<void> => {
  await delay(300);
  const students = getFromStorage('mock_students', defaultStudents);
  saveToStorage('mock_students', students.filter(s => s.id !== id));
};

// Course Services
export const addCourse = async (course: Omit<Course, 'id'>): Promise<Course> => {
  await delay(300);
  const newCourse: Course = { ...course, id: generateId('c') };
  const courses = getFromStorage('mock_courses', defaultCourses);
  courses.push(newCourse);
  saveToStorage('mock_courses', courses);
  return newCourse;
};

export const getCourses = async (): Promise<Course[]> => {
  await delay(300);
  return [...getFromStorage('mock_courses', defaultCourses)];
};

export const getCoursesForTeacher = async (teacherId: string): Promise<Course[]> => {
    await delay(200);
    return getFromStorage('mock_courses', defaultCourses).filter(c => c.teacherId === teacherId);
}

export const getCoursesForStudent = async (studentId: string): Promise<Course[]> => {
    await delay(200);
    const student = getFromStorage('mock_students', defaultStudents).find(s => s.id === studentId);
    if (!student) return [];
    return getFromStorage('mock_courses', defaultCourses).filter(c => c.teacherId === student.teacherId);
}

export const updateCourse = async (id: string, updates: Partial<Course>): Promise<Course | null> => {
  await delay(300);
  const courses = getFromStorage('mock_courses', defaultCourses);
  const courseIndex = courses.findIndex(c => c.id === id);
  if (courseIndex === -1) return null;
  courses[courseIndex] = { ...courses[courseIndex], ...updates };
  saveToStorage('mock_courses', courses);
  return courses[courseIndex];
}

export const deleteCourse = async (id: string): Promise<void> => {
  await delay(300);
  const courses = getFromStorage('mock_courses', defaultCourses);
  saveToStorage('mock_courses', courses.filter(c => c.id !== id));
};

// Quiz Services
export const storeQuiz = (courseId: string, quizData: GenerateQuizQuestionsOutput) => {
  if (typeof window === 'undefined') return;
  const quizKey = `quiz_${courseId}`;
  const storedQuiz: StoredQuiz = { ...quizData, courseId };
  localStorage.setItem(quizKey, JSON.stringify(storedQuiz));
};

export const getStoredQuiz = (courseId: string): StoredQuiz | null => {
  if (typeof window === 'undefined') return null;
  const quizKey = `quiz_${courseId}`;
  const quizData = localStorage.getItem(quizKey);
  return quizData ? JSON.parse(quizData) : null;
};
