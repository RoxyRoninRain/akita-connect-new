import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../types';

interface CalendarProps {
    events: Event[];
    currentDate: Date;
    onDateChange: (date: Date) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ events, currentDate, onDateChange }) => {
    const navigate = useNavigate();

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 border border-gray-100"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = events.filter(e => e.startDate.startsWith(dateStr));

        days.push(
            <div key={day} className="h-24 border border-gray-100 p-1 overflow-y-auto hover:bg-gray-50 transition-colors">
                <div className="text-sm font-medium text-gray-500 mb-1">{day}</div>
                <div className="space-y-1">
                    {dayEvents.map(event => (
                        <button
                            key={event.id}
                            onClick={() => navigate(`/events/${event.id}`)}
                            className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate ${event.eventType === 'show' ? 'bg-purple-100 text-purple-800' :
                                event.eventType === 'meetup' ? 'bg-green-100 text-green-800' :
                                    event.eventType === 'seminar' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                }`}
                        >
                            {event.title}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const handlePrevMonth = () => {
        onDateChange(new Date(year, currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        onDateChange(new Date(year, currentDate.getMonth() + 1, 1));
    };

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                    {monthName} {year}
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 border-b border-gray-200 text-center text-xs font-semibold text-gray-700 uppercase tracking-wide">
                <div className="bg-gray-50 py-2">Sun</div>
                <div className="bg-gray-50 py-2">Mon</div>
                <div className="bg-gray-50 py-2">Tue</div>
                <div className="bg-gray-50 py-2">Wed</div>
                <div className="bg-gray-50 py-2">Thu</div>
                <div className="bg-gray-50 py-2">Fri</div>
                <div className="bg-gray-50 py-2">Sat</div>
            </div>
            <div className="grid grid-cols-7 bg-white">
                {days}
            </div>
        </div>
    );
};
