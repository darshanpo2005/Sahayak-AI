import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc, limit } from 'firebase/firestore';

export interface Teacher {
  id?: string;
  name: string;
  email: string;
}

export interface Student {
  id?: string;
  name: string;
  grade: string;
  teacherId: string;
}

export interface Course {
  id?: string;
  title: string;
  description: string;
  modules: string[];
  teacherId: string;
}

// Teacher Services
export const addTeacher = async (teacher: Omit<Teacher, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, 'teachers'), teacher);
    return { id: docRef.id, ...teacher };
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not add teacher");
  }
};

export const getTeachers = async (): Promise<Teacher[]> => {
  const querySnapshot = await getDocs(collection(db, "teachers"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
};

export const getTeacherByName = async (name: string): Promise<Teacher | null> => {
    const q = query(collection(db, "teachers"), where("name", "==", name), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Teacher;
};

export const getTeacherById = async (id: string): Promise<Teacher | null> => {
    const docRef = doc(db, "teachers", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Teacher;
    }
    return null;
}

export const deleteTeacher = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'teachers', id));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw new Error("Could not delete teacher");
  }
};


// Student Services
export const addStudent = async (student: Omit<Student, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, 'students'), student);
        return { id: docRef.id, ...student };
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Could not add student");
    }
}

export const getStudents = async (): Promise<Student[]> => {
    const querySnapshot = await getDocs(collection(db, "students"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
}

export const getStudentByName = async (name: string): Promise<Student | null> => {
    const q = query(collection(db, "students"), where("name", "==", name), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return null;
    }
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Student;
}

export const getStudentsForTeacher = async (teacherId: string): Promise<Student[]> => {
    const q = query(collection(db, "students"), where("teacherId", "==", teacherId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
}

export const deleteStudent = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'students', id));
  } catch (e) {
    console.error("Error deleting document: ", e);
    throw new Error("Could not delete student");
  }
};


// Course Services
export const addCourse = async (course: Omit<Course, 'id'>) => {
    try {
        const docRef = await addDoc(collection(db, 'courses'), course);
        return { id: docRef.id, ...course };
    } catch (e) {
        console.error("Error adding document: ", e);
        throw new Error("Could not add course");
    }
}

export const getCourses = async (): Promise<Course[]> => {
    const querySnapshot = await getDocs(collection(db, "courses"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
}

export const getCoursesForTeacher = async (teacherId: string): Promise<Course[]> => {
    const q = query(collection(db, "courses"), where("teacherId", "==", teacherId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
}

// In a real app, students would be enrolled in courses. For simplicity, we'll return all courses.
export const getCoursesForStudent = async (studentId: string): Promise<Course[]> => {
    return getCourses();
}
