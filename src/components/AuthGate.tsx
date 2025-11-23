import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';

interface AuthGateProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    action: string;
    redirectTo?: string;
}

export const AuthGate: React.FC<AuthGateProps> = ({
    children,
    fallback,
    action,
    redirectTo = '/signup'
}) => {
    const { currentUser } = useStore();

    if (!currentUser) {
        if (fallback) {
            return <>{fallback}</>;
        }

        return (
            <Link
                to={redirectTo}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
            >
                Sign Up to {action}
            </Link>
        );
    }

    return <>{children}</>;
};
