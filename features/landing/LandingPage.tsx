import React, { useState, useEffect } from 'react';
import { Icon } from '../../components/Icon';
import { Button } from '../../components/Button';

interface LandingPageProps {
  onEnter: () => void;
}

const features = [
  {
    icon: 'Flower',
    title: 'Grow Your Mood Garden',
    description: 'Log your daily moods and watch a beautiful, personal garden bloom, visualizing your emotional journey.',
    color: 'text-violet-500 bg-violet-100/80'
  },
  {
    icon: 'MessageCircle',
    title: 'AI Companion Chat',
    description: 'Talk about anything on your mind in a private, non-judgmental space with your empathetic AI companion.',
     color: 'text-sky-500 bg-sky-100/80'
  },
  {
    icon: 'Headphones',
    title: 'Guided Exercises',
    description: 'Access a library of short, effective tools for exam stress, difficult conversations, and finding calm.',
     color: 'text-emerald-500 bg-emerald-100/80'
  }
];

const howItWorksSteps = [
    {
        icon: 'CheckCircle',
        title: 'Check-In & Reflect',
        description: 'Start with a simple mood check-in to acknowledge your feelings and plant a seed in your private garden.',
    },
    {
        icon: 'Sparkles',
        title: 'Explore & Engage',
        description: 'Talk with your AI companion, try a guided exercise, or express yourself on the Calm Canvas.',
    },
    {
        icon: 'ChartBar',
        title: 'Grow & Understand',
        description: 'Watch your garden visualize your journey and use the dashboard to see your progress over time.',
    }
];

const testimonials = [
    {
        quote: "MindBloom has become my private diary. It's the only place I feel I can be truly honest without any judgment.",
        name: 'Priya, Engineering Student'
    },
    {
        quote: "The pre-exam breathing exercise is a lifesaver. It actually helps me focus and calm down before a big test.",
        name: 'Rohan, 12th Standard'
    },
    {
        quote: "I love watching my garden grow. It's a beautiful and gentle reminder that my feelings, good and bad, are all part of my story.",
        name: 'Anjali, Design Student'
    }
];


const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      // Hide the indicator if user has scrolled more than 50px
      setShowScrollIndicator(window.scrollY < 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetElement = document.getElementById('features-section');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white text-slate-800 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-blue-100"></div>
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-violet-200/50 rounded-full blur-3xl hidden md:block" style={{ animation: 'orb-bob 20s ease-in-out infinite' }}></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-sky-200/50 rounded-full blur-3xl hidden md:block" style={{ animation: 'orb-bob 25s ease-in-out infinite alternate' }}></div>
            <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-fuchsia-200/40 rounded-full blur-3xl hidden md:block" style={{ animation: 'orb-bob 18s ease-in-out infinite' }}></div>
        </div>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center p-8 z-10 overflow-hidden">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-violet-200/30 via-transparent to-blue-200/30 md:animate-spin-slowest -z-10"></div>
            <div className="text-center flex flex-col items-center">
                 <div className="relative w-40 h-40 mb-8 flex items-center justify-center animate-bloom-pulse">
                    <div className="absolute w-full h-full rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 opacity-20 blur-2xl animate-spin-slow"></div>
                    <div className="absolute w-3/4 h-3/4 rounded-full bg-gradient-to-br from-blue-300 to-violet-300 opacity-20 blur-xl animate-spin-slower"></div>
                    <div className="w-24 h-24 bg-white/50 backdrop-blur-md rounded-3xl flex items-center justify-center shadow-lg transform rotate-[-15deg]">
                        <Icon name="Flower" className="w-12 h-12 text-violet-500 transform rotate-[15deg]" />
                    </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold text-slate-800 mb-4 tracking-tight md:animate-shine bg-clip-text text-transparent bg-gradient-to-br from-slate-800 to-slate-600">
                    Welcome to MindBloom
                </h1>
                <p className="text-lg text-slate-600 max-w-xl mx-auto mb-10">
                    A private and culturally-sensitive space for your mental wellness. Grow, reflect, and find calm.
                </p>
                <Button size="lg" onClick={onEnter}>
                    Enter Your Safe Space
                </Button>
            </div>
             {/* Scroll Down Indicator */}
            <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-20 transition-all duration-500 ${showScrollIndicator ? 'opacity-100' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <a href="#features-section"
                   onClick={handleScrollClick}
                   className="group flex flex-col items-center text-slate-500 hover:text-violet-500 transition-colors duration-300 animate-bounce"
                   aria-label="Scroll to next section">
                    <span className="text-sm font-medium tracking-wide">Scroll</span>
                    <svg className="w-6 h-6 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </a>
            </div>
        </section>

        {/* Features Section */}
        <section id="features-section" className="relative py-20 px-8 z-10">
            <div className="max-w-5xl mx-auto">
                <h2 className="text-4xl font-bold text-center mb-16 text-slate-700">A Private Space to Nurture Your Mind</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white/40 backdrop-blur-lg p-6 rounded-2xl border border-white/50 shadow-lg flex flex-col transition-transform duration-300 hover:-translate-y-2">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                                <Icon name={feature.icon} className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                            <p className="text-slate-600 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="relative py-20 px-8 z-10 bg-slate-50">
             <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-sm font-bold tracking-wider uppercase text-violet-600">How It Works</span>
                    <h2 className="text-4xl font-bold mt-2 text-slate-700">Your Journey in 3 Simple Steps</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {howItWorksSteps.map((step, index) => (
                        <div key={index} className="p-6">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-white shadow-md">
                                <Icon name={step.icon} className="w-8 h-8 text-violet-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                            <p className="text-slate-600">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Interface Mockup Section */}
        <section className="relative py-20 px-8 z-10 bg-slate-50">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-sm font-bold tracking-wider uppercase text-violet-600">Sneak Peek</span>
                    <h2 className="text-4xl font-bold mt-2 text-slate-700">An Interface for Inner Calm</h2>
                </div>
                <div className="bg-white rounded-2xl shadow-2xl p-4 border border-slate-200/50 max-w-3xl mx-auto">
                    <div className="flex items-center gap-1.5 mb-3">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[350px] md:h-[400px] bg-slate-100 rounded-lg p-2">
                        <div className="bg-gradient-to-br from-violet-50 via-fuchsia-50 to-blue-50 rounded-md p-4 relative overflow-hidden flex flex-col">
                            <h3 className="font-bold text-sm text-slate-700 mb-2 flex-shrink-0">Today's Garden</h3>
                            <div className="flex-grow relative">
                                <div className="absolute w-12 h-12 bg-green-400/50 rounded-full blur-lg top-1/4 left-1/4 animate-gentle-sway" style={{animationDuration: '8s'}}></div>
                                <div className="absolute w-16 h-16 bg-violet-400/50 rounded-full blur-lg top-1/2 left-1/2 animate-gentle-sway" style={{animationDuration: '10s'}}></div>
                                <div className="absolute w-10 h-10 bg-sky-400/50 rounded-full blur-lg bottom-1/4 right-1/4 animate-gentle-sway" style={{animationDuration: '12s'}}></div>
                            </div>
                        </div>
                        <div className="bg-slate-200 rounded-md p-4 flex flex-col gap-3">
                            <div className="p-2 px-3 rounded-xl rounded-bl-none bg-slate-300 self-start text-sm max-w-[80%]">How are you feeling today?</div>
                            <div className="p-2 px-3 rounded-xl rounded-br-none bg-violet-500 text-white self-end text-sm max-w-[80%]">A little stressed today.</div>
                            <div className="p-2 px-3 rounded-xl rounded-bl-none bg-slate-300 self-start text-sm max-w-[80%]">That's okay. Sometimes it's good to just acknowledge it.</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="relative py-20 px-8 z-10">
             <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <span className="text-sm font-bold tracking-wider uppercase text-violet-600">Testimonials</span>
                    <h2 className="text-4xl font-bold mt-2 text-slate-700">From Our Community</h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white/40 backdrop-blur-lg p-6 rounded-2xl border border-white/50 shadow-lg flex flex-col">
                            <p className="text-slate-600 italic flex-grow">"{testimonial.quote}"</p>
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="font-semibold">{testimonial.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 bg-slate-100 text-slate-600">
            <div className="max-w-5xl mx-auto px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-2">
                        <div className="flex items-center mb-4">
                            <Icon name="Flower" className="h-8 w-8 text-violet-500" />
                            <span className="self-center text-xl font-bold whitespace-nowrap text-slate-800 ml-2">MindBloom</span>
                        </div>
                        <p className="text-sm max-w-sm">A private and culturally-sensitive space for your mental wellness. Grow, reflect, and find calm.</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-4">Product</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-violet-500">Features</a></li>
                            <li><a href="#" className="hover:text-violet-500">How It Works</a></li>
                            <li><a href="#" className="hover:text-violet-500">Testimonials</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-4">Company</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-violet-500">About Us</a></li>
                            <li><a href="#" className="hover:text-violet-500">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-violet-500">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-sm">
                    <p>&copy; {new Date().getFullYear()} MindBloom. All Rights Reserved.</p>
                    <div className="flex space-x-4 mt-4 sm:mt-0">
                        <a href="#" aria-label="Twitter" className="hover:text-violet-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.223.085a4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path></svg></a>
                        <a href="#" aria-label="Instagram" className="hover:text-violet-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.689-.073-4.948-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44 1.441-.645 1.441-1.44-.645-1.44-1.441-1.44z"></path></svg></a>
                        <a href="#" aria-label="LinkedIn" className="hover:text-violet-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg></a>
                    </div>
                </div>
            </div>
        </footer>
    </div>
  );
};

export default LandingPage;