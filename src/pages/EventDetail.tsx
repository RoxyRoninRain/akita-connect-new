import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, MapPin, Clock, Users, Calendar, MessageSquare } from 'lucide-react';

export const EventDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { events, users, currentUser, toggleEventRSVP } = useStore();
    const [comment, setComment] = useState('');

    const event = events.find(e => e.id === id);
    const organizer = event ? users.find(u => u.id === event.organizerId) : null;

    if (!event) {
        return (
            <div className="max-w-3xl mx-auto p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
                <Link to="/events" className="text-brand-primary hover:underline mt-4 inline-block">
                    Return to Events
                </Link>
            </div>
        );
    }

    const goingCount = event.rsvps?.filter(r => r.status === 'going').length || 0;
    const hasRSVPd = currentUser ? event.rsvps?.some(r => r.userId === currentUser.id) : false;

    const handleRSVP = () => {
        if (currentUser) {
            toggleEventRSVP(event.id);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4">
            <Link to="/events" className="inline-flex items-center text-gray-500 hover:text-brand-primary mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
            </Link>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-light text-brand-primary capitalize">
                            {event.eventType}
                        </span>
                        {currentUser && (
                            <button
                                onClick={handleRSVP}
                                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${hasRSVPd
                                    ? 'bg-brand-primary text-white border-brand-primary hover:bg-brand-secondary'
                                    : 'border-brand-primary text-brand-primary hover:bg-brand-light'
                                    }`}
                            >
                                {hasRSVPd ? 'Going' : 'RSVP'}
                            </button>
                        )}
                    </div>
                    <h1 className="mt-4 text-3xl font-bold text-gray-900">{event.title}</h1>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        <span className="mx-2">•</span>
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(event.startDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                Location
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900">{event.location}</dd>
                            {event.address && <dd className="text-sm text-gray-500">{event.address}</dd>}
                        </div>
                        <div className="sm:col-span-1">
                            <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                Organizer
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                <img src={organizer?.avatar} alt={organizer?.name} className="h-6 w-6 rounded-full mr-2" />
                                {organizer?.name || 'Unknown'}
                            </dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{event.description}</dd>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Attendees ({goingCount})</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {event.rsvps?.filter(r => r.status === 'going').map(rsvp => {
                        const attendee = users.find(u => u.id === rsvp.userId);
                        if (!attendee) return null;
                        return (
                            <li key={rsvp.userId} className="px-4 py-4 flex items-center sm:px-6">
                                <img className="h-10 w-10 rounded-full" src={attendee.avatar} alt={attendee.name} />
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{attendee.name}</p>
                                    <p className="text-xs text-gray-500">{attendee.role}</p>
                                </div>
                            </li>
                        );
                    })}
                    {goingCount === 0 && (
                        <li className="px-4 py-4 text-sm text-gray-500 text-center">No one is attending yet. Be the first!</li>
                    )}
                </ul>
            </div>
        </div>
    );
};
