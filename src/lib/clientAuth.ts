
"use client";

import type { Student, Teacher } from "./services";

const SESSION_KEY = "nwcs-session";

export type Session = {
    user: Student | Omit<Teacher, 'password'>;
    role: 'student' | 'admin';
    theme?: 'default' | 'green' | 'purple';
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
export const setSession = (session: Session) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
};

export const logout = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = '/';
    }
};
