
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { ArrowLeft, MapPin, Clock, Users, Calendar, User } from 'lucide-react';

export const EventDetail = () => {
    const { id } = useParams<{ id: string }>();
    const { events, users, currentUser, toggleEventRSVP } = useStore();

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
        <div className="max-w-4xl mx-auto p-4">
            <Link to="/events" className="inline-flex items-center text-gray-500 hover:text-brand-primary mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
            </Link>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-brand-light text-brand-primary capitalize">
                            {event.eventType}
                        </span>
                        {currentUser && (
                            <button
                                onClick={handleRSVP}
                                className={`px-6 py-2 border rounded-md text-sm font-medium transition-colors ${hasRSVPd
                                    ? 'bg-brand-primary text-white border-brand-primary hover:bg-brand-secondary'
                                    : 'border-brand-primary text-brand-primary hover:bg-brand-light'
                                    }`}
                            >
                                {hasRSVPd ? '✓ Going' : 'RSVP'}
                            </button>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-brand-primary" />
                            <span className="font-medium">
                                {new Date(event.startDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <Clock className="h-5 w-5 mr-2 text-brand-primary" />
                            <span>{new Date(event.startDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center">
                            <Users className="h-5 w-5 mr-2 text-brand-primary" />
                            <span>{goingCount} Attending</span>
                        </div>
                    </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">About this event</h3>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.description || 'No description provided.'}</p>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center mb-2">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    Location
                                </dt>
                                <dd className="text-sm text-gray-900 font-medium">{event.location}</dd>
                                {event.address && <dd className="text-sm text-gray-500 mt-1">{event.address}</dd>}
                            </div>
                        </div>
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center">
                                    <User className="h-4 w-4 mr-1" />
                                    Organized by
                                </h3>
                                <div className="flex items-center space-x-3">
                                    <img src={organizer?.avatar} alt={organizer?.name} className="h-12 w-12 rounded-full border-2 border-white shadow" />
                                    <div>
                                        <Link to={`/profile/${organizer?.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-primary">
                                            {organizer?.name || 'Unknown'}
                                        </Link>
                                        {organizer?.kennelName && (
                                            <p className="text-xs text-gray-500">{organizer.kennelName}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Attendees ({goingCount})</h3>
                </div>
                <ul className="divide-y divide-gray-200">
                    {event.rsvps?.filter(r => r.status === 'going').map(rsvp => {
                        const attendee = users.find(u => u.id === rsvp.userId);
                        if (!attendee) return null;
                        return (
                            <li key={rsvp.userId} className="px-4 py-4 hover:bg-gray-50 transition-colors">
                                <Link to={`/profile/${attendee.id}`} className="flex items-center">
                                    <img className="h-12 w-12 rounded-full border-2 border-white shadow" src={attendee.avatar} alt={attendee.name} />
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-900 hover:text-brand-primary">{attendee.name}</p>
                                        {attendee.kennelName && (
                                            <p className="text-xs text-gray-500">{attendee.kennelName}</p>
                                        )}
                                        {attendee.location && (
                                            <p className="text-xs text-gray-400">{attendee.location}</p>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                    {goingCount === 0 && (
                        <li className="px-4 py-8 text-center">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm font-medium text-gray-900">No attendees yet</p>
                            <p className="text-sm text-gray-500">Be the first to RSVP!</p>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
};
