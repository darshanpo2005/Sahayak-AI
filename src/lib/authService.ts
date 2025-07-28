
'use server';

import { getStudentByEmail, getTeacherByEmail, Student, Teacher } from "./services";

export type Session = {
    user: Student | Omit<Teacher, 'password'>;
    role: 'student' | 'admin';
    theme?: 'default' | 'green' | 'purple';
};

export const loginStudent = async (email: string, password: string):Promise<Student | null> => {
    const student = await getStudentByEmail(email);
    if (student && student.password === password) {
        return student;
    }
    return null;
}

export const loginAdmin = async (email: string, password: string): Promise<Omit<Teacher, 'password'> | null> => {
    const admin = await getTeacherByEmail(email);
    if (admin && admin.role === 'admin' && admin.password === password) {
        const { password: _, ...adminData } = admin;
        return adminData;
    }
    return null;
}
