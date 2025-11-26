import { useNavigate } from 'react-router-dom';
import { Shield, Users, Activity, Heart, Award } from 'lucide-react';

export const Landing = () => {
    const navigate = useNavigate();

    const features = [
        {
            icon: Shield,
            title: 'Verified Breeders',
            description: 'Connect with reputable breeders who prioritize health testing and ethical practices'
        },
        {
            icon: Users,
            title: 'Join Community',
            description: 'Engage with thousands of Akita enthusiasts, share experiences, and get advice'
        },
        {
            icon: Activity,
            title: 'Health Database',
            description: 'Access comprehensive OFA and VGL health records for informed breeding decisions'
        }
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-2">
                            <img src="/akita-logo.png" alt="Akita Connect" className="h-10 w-10 rounded-full" />
                            <div>
                                <span className="text-xl font-semibold text-brand-primary">Akita</span>
                                <span className="text-xl font-light text-brand-secondary">Connect</span>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/login')}
                                className="text-gray-700 hover:text-brand-primary font-medium transition-colors"
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="bg-brand-primary text-white px-6 py-2 rounded-md font-medium hover:bg-brand-secondary transition-colors shadow-sm"
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Option 1 Style */}
            <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="absolute inset-0">
                    <img
                        src="/hero-akita.jpg"
                        alt="Majestic American Akita"
                        className="w-full h-full object-cover opacity-40"
                        onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&q=80&w=1600';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/80 via-brand-secondary/70 to-brand-primary/80"></div>
                </div>

                {/* Hero Content */}
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
                    <div className="text-center">
                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                            Connect with Akita Lovers
                            <span className="block text-white/95 mt-2">Worldwide</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
                            Join breeders, owners, and enthusiasts in the premier American Akita community
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/signup')}
                                className="bg-white text-brand-primary px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-xl transform hover:scale-105"
                            >
                                Get Started
                            </button>
                            <button
                                onClick={() => navigate('/community')}
                                className="border-2 border-white text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                            >
                                Explore Community
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need in One Place
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            The most comprehensive platform for American Akita enthusiasts
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-white to-brand-light/30 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-brand-light"
                            >
                                <div className="bg-brand-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="h-8 w-8 text-brand-primary" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Additional Features Grid */}
            <section className="py-20 bg-gradient-to-br from-brand-light/50 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Feature icon={Heart} title="Marketplace" description="Find puppies from health-tested parents" />
                        <Feature icon={Activity} title="Events Calendar" description="Dog shows, meetups, and seminars" />
                        <Feature icon={Award} title="Champions Gallery" description="Celebrate titled dogs" />
                        <Feature icon={Users} title="Forums" description="Discuss training, health, and more" />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold mb-6">
                        Ready to Join the Community?
                    </h2>
                    <p className="text-xl mb-8 text-white/90">
                        Create your free account and connect with Akita enthusiasts today
                    </p>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-white text-brand-primary px-10 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-all shadow-xl transform hover:scale-105"
                    >
                        Sign Up Now - It's Free
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="col-span-1">
                            <div className="flex items-center space-x-2 mb-4">
                                <img src="/akita-logo.png" alt="Akita Connect" className="h-8 w-8 rounded-full" />
                                <span className="text-lg font-semibold">Akita Connect</span>
                            </div>
                            <p className="text-gray-400">
                                The premier platform for American Akita breeders, owners, and enthusiasts worldwide.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Quick Links</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><button onClick={() => navigate('/directory')} className="hover:text-white">Breeder Directory</button></li>
                                <li><button onClick={() => navigate('/marketplace')} className="hover:text-white">Marketplace</button></li>
                                <li><button onClick={() => navigate('/community')} className="hover:text-white">Community</button></li>
                                <li><button onClick={() => navigate('/events')} className="hover:text-white">Events</button></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Contact</h4>
                            <p className="text-gray-400 mb-2">Have questions or feedback?</p>
                            <a href="mailto:akitaconnect@gmail.com" className="text-brand-primary hover:text-brand-secondary transition-colors">
                                akitaconnect@gmail.com
                            </a>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
                        <p>&copy; 2025 Akita Connect. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Helper component for smaller feature items
const Feature = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex items-start space-x-4 p-4 rounded-lg hover:bg-white/50 transition-colors">
        <div className="bg-brand-primary/10 p-3 rounded-lg flex-shrink-0">
            <Icon className="h-6 w-6 text-brand-primary" />
        </div>
        <div>
            <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-600">{description}</p>
        </div>
    </div>
);
