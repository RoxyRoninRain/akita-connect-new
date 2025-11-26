import { Mail, MapPin, Send } from 'lucide-react';
import { useState } from 'react';

export const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Create mailto link with pre-filled data
        const mailtoLink = `mailto:akitaconnect@gmail.com?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        )}`;

        window.location.href = mailtoLink;
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-8 text-white">
                    <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
                    <p className="text-white/90">We'd love to hear from you! Send us a message and we'll get back to you soon.</p>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        {/* Contact Info */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <Mail className="h-6 w-6 text-brand-primary mt-1" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">Email</h3>
                                        <a
                                            href="mailto:akitaconnect@gmail.com"
                                            className="text-brand-primary hover:text-brand-secondary transition-colors"
                                        >
                                            akitaconnect@gmail.com
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <MapPin className="h-6 w-6 text-brand-primary mt-1" />
                                    <div>
                                        <h3 className="font-medium text-gray-900">Location</h3>
                                        <p className="text-gray-600">United States</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-brand-light/30 rounded-lg">
                                <h3 className="font-medium text-gray-900 mb-2">Office Hours</h3>
                                <p className="text-sm text-gray-600">
                                    We typically respond within 24-48 hours during business days.
                                </p>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Send a Message</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Your Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                                        placeholder="john@example.com"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        id="subject"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                                        placeholder="How can we help?"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                        Message
                                    </label>
                                    <textarea
                                        id="message"
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-brand-primary focus:border-brand-primary"
                                        placeholder="Tell us what's on your mind..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-brand-primary text-white px-6 py-3 rounded-md font-medium hover:bg-brand-secondary transition-colors shadow-sm flex items-center justify-center space-x-2"
                                >
                                    <Send className="h-5 w-5" />
                                    <span>Send Message</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* FAQ or Additional Info */}
                    <div className="border-t pt-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-3">Frequently Asked Questions</h2>
                        <div className="space-y-3">
                            <div>
                                <h3 className="font-medium text-gray-900">How long does it take to get a response?</h3>
                                <p className="text-sm text-gray-600">We aim to respond to all inquiries within 24-48 hours during business days.</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">Can I suggest new features?</h3>
                                <p className="text-sm text-gray-600">Absolutely! We welcome feature suggestions and feedback from our community.</p>
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-900">How do I report a bug or issue?</h3>
                                <p className="text-sm text-gray-600">Please email us with details about the issue, including screenshots if possible, and we'll investigate right away.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
