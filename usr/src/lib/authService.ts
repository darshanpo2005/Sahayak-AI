import { getStudentByEmail, getTeacherByEmail, Student, Teacher } from "./services";

const SESSION_KEY = "sahayak-session";

type Session = {
    user: Student | Omit<Teacher, 'password'>;
    role: 'student' | 'teacher' | 'admin';
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

// This function can only be called on the client side
export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_KEY);
    }
};

export const loginStudent = async (email: string, password: string):Promise<Student | null> => {
    const student = await getStudentByEmail(email);
    if (student && student.password === password) {
        const sessionData: Session = { user: student, role: 'student' };
        if (typeof window !== 'undefined') {
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        }
        return student;
    }
    return null;
}

export const loginTeacher = async (email: string, password: string): Promise<Teacher | null> => {
    const teacher = await getTeacherByEmail(email);
    if (teacher && teacher.role !== 'admin' && teacher.password === password) {
        // Don't store password in session
        const { password: _, ...teacherData } = teacher;
        const sessionData: Session = { user: teacherData, role: teacher.role || 'teacher' };
        if (typeof window !== 'undefined') {
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        }
        return teacherData;
    }
    return null;
}

export const loginAdmin = async (email: string, password: string): Promise<Omit<Teacher, 'password'> | null> => {
    const admin = await getTeacherByEmail(email);
    if (admin && admin.role === 'admin' && admin.password === password) {
        const { password: _, ...adminData } = admin;
        const sessionData: Session = { user: adminData, role: 'admin' };
        if (typeof window !== 'undefined') {
            localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
        }
        return adminData;
    }
    return null;
}