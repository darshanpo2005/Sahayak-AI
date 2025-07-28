
import { getStudentByEmail, getTeacherByEmail, Student, Teacher } from "./services";

const SESSION_KEY = "nwcs-session";

type User = Student | Omit<Teacher, 'password'>;

export type Session = {
    user: User;
    role: 'student' | 'admin';
};

// Mock admin user for direct access
const mockAdmin: Omit<Teacher, 'password'> = {
    id: 't1',
    name: 'Manager',
    email: 'manager@bel.com',
    role: 'admin',
    theme: 'default',
};

// Mock student user for direct access
const mockStudent: Student = {
    id: 's1',
    name: 'Intern',
    email: 'intern@bel.com',
    grade: 'Networking',
    teacherId: 't1',
    theme: 'default',
};


// This function can only be called on the client side
export const getSession = (): Session | null => {
    if (typeof window === 'undefined') {
        return { user: mockAdmin, role: 'admin' }; // Default to admin for server-side rendering
    }
    
    // For client-side access, determine role by path
    if(window.location.pathname.startsWith('/student')) {
        return { user: mockStudent, role: 'student' };
    }
    
    if(window.location.pathname.startsWith('/management')) {
        return { user: mockAdmin, role: 'admin' };
    }
    
    // Fallback for other pages, can be adjusted
    return { user: mockAdmin, role: 'admin' };
};

export const setSession = (session: Session) => {
    // No-op when login is disabled
};

export const logout = () => {
    // No-op when login is disabled
    if (typeof window !== 'undefined') {
        window.location.href = '/';
    }
};

// Functions below are disabled for direct access mode.
export const loginStudent = async (email: string, password: string):Promise<Student | null> => {
    return mockStudent;
}

export const loginAdmin = async (email: string, password: string): Promise<Omit<Teacher, 'password'> | null> => {
    return mockAdmin;
}
