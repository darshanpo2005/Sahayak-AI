
import { getStudentByEmail, getTeacherByEmail, Student, Teacher } from "./services";

const SESSION_KEY = "nwcs-session";

type User = Student | Omit<Teacher, 'password'>;

export type Session = {
    user: User;
    role: 'student' | 'admin';
};

// This function can only be called on the client side
export const getSession = (): Session | null => {
    if (typeof window === 'undefined') {
        return null;
    }
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (sessionData) {
        return JSON.parse(sessionData);
    }
    return null;
};

export const setSession = (session: Session) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
};

// This function can only be called on the client side
export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_KEY);
    }
};

export const loginStudent = async (email: string, password: string):Promise<Student | null> => {
    const student = await getStudentByEmail(email);
    // Simplified check
    if (student && student.password === password) {
        const sessionData: Session = { user: student, role: 'student' };
        setSession(sessionData);
        return student;
    }
    return null;
}

// Deprecated, use loginAdmin for managers
export const loginTeacher = async (email: string, password: string): Promise<Omit<Teacher, 'password'> | null> => {
    return null;
}

export const loginAdmin = async (email: string, password: string): Promise<Omit<Teacher, 'password'> | null> => {
    const admin = await getTeacherByEmail(email);
    // Simplified check for admin/manager login
    if (admin && admin.password === password) {
        const { password: _, ...adminData } = admin;
        const sessionData: Session = { user: adminData, role: 'admin' };
        setSession(sessionData);
        return adminData;
    }
    return null;
}
