import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Chatbot } from '../common/Chatbot';

export const Layout = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex gap-8">
                    <Sidebar />
                    <main className="flex-1 min-w-0">
                        <Outlet />
                    </main>
                </div>
            </div>
            <Chatbot />
        </div>
    );
};
