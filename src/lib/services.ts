// Mock data services. No database connection needed.

export interface Teacher {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be handled securely in a real app
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

// Mock Database
let mockTeachers: Teacher[] = [
  { id: 't1', name: 'Jane Doe', email: 'jane.doe@school.com', password: 'password123' },
  { id: 't2', name: 'John Smith', email: 'john.smith@school.com', password: 'password123' },
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

export const updateTeacher = async (id: string, updates: Partial<Teacher>): Promise<Teacher | null> => {
  await delay(300);
  const teacherIndex = mockTeachers.findIndex(t => t.id === id);
  if (teacherIndex === -1) return null;
  mockTeachers[teacherIndex] = { ...mockTeachers[teacherIndex], ...updates };
  return mockTeachers[teacherIndex];
}

export const deleteTeacher = async (id: string): Promise<void> => {
  await delay(300);
  mockTeachers = mockTeachers.filter(t => t.id !== id);
  // Also unassign students and courses from this teacher
  mockStudents = mockStudents.map(s => s.teacherId === id ? { ...s, teacherId: '' } : s);
  mockCourses = mockCourses.map(c => c.teacherId === id ? { ...c, teacherId: '' } : c);
};

export const getTeacherByEmail = async (email: string): Promise<Teacher | null> => {
  await delay(100);
  return mockTeachers.find(t => t.email.toLowerCase() === email.toLowerCase()) || null;
}

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

export const getStudentByEmail = async (email: string): Promise<Student | null> => {
  await delay(100);
  return mockStudents.find(s => s.email.toLowerCase() === email.toLowerCase()) || null;
}

export const getStudentsForTeacher = async (teacherId: string): Promise<Student[]> => {
    await delay(200);
    return mockStudents.filter(s => s.teacherId === teacherId);
}

export const updateStudent = async (id: string, updates: Partial<Student>): Promise<Student | null> => {
  await delay(300);
  const studentIndex = mockStudents.findIndex(s => s.id === id);
  if (studentIndex === -1) return null;
  mockStudents[studentIndex] = { ...mockStudents[studentIndex], ...updates };
  return mockStudents[studentIndex];
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
    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return [];
    // A student sees courses taught by their assigned teacher
    return mockCourses.filter(c => c.teacherId === student.teacherId);
}

export const updateCourse = async (id: string, updates: Partial<Course>): Promise<Course | null> => {
  await delay(300);
  const courseIndex = mockCourses.findIndex(c => c.id === id);
  if (courseIndex === -1) return null;
  mockCourses[courseIndex] = { ...mockCourses[courseIndex], ...updates };
  return mockCourses[courseIndex];
}

export const deleteCourse = async (id: string): Promise<void> => {
  await delay(300);
  mockCourses = mockCourses.filter(c => c.id !== id);
};

export const isFirebaseConfigured = true;
