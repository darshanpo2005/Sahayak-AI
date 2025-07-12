import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, getDoc } from 'firebase/firestore';

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
