import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "C:/Users/USER/sponza/project/my-app/src/components/ui/button";
import { Card } from "C:/Users/USER/sponza/project/my-app/src/components/ui/card";
import { 
    ArrowRight, Target, Users, TrendingUp, Shield, 
    Building2, GraduationCap, Zap
} from 'lucide-react';
import { createPageUrl } from 'C:/Users/USER/sponza/project/my-app/src/utils';
import Navbar from '../components/shared/Navbar';
import Footer from '../components/shared/Footer';
import { dummyEvents, dummySponsorshipRequests, allUsers } from 'C:/Users/USER/sponza/project/my-app/src/components/data/dummyData';
import EventCard from '../components/shared/EventCard';

// ─── Creepy Button CSS ────────────────────────────────────────────────────────
const creepyCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');

  .creepy-btn {
    background-color: #000;
    border-radius: 1.25em;
    border: 1.5px solid white;
    color: #2c4f77;
    cursor: pointer;
    letter-spacing: 0.05em;
    min-width: 9em;
    outline: 0.1875em solid transparent;
    transition: outline 0.1s linear;
    -webkit-tap-highlight-color: transparent;
    position: relative;
    font-family: "Poppins", sans-serif;
    font-size: 1.25em;
    font-weight: 500;
    text-transform: uppercase;
  }

  .creepy-btn__cover,
  .creepy-btn__pupil {
    border-radius: inherit;
    display: block;
  }

  .creepy-btn__cover,
  .creepy-btn__eye {
    position: relative;
  }

  .creepy-btn__cover {
    background-color: #ffffff;
    padding: 0.55em 1.2em;
    inset: 0;
    transform-origin: 1.25em 50%;
    transition:
      background-color 0.3s,
      transform 0.3s cubic-bezier(0.65, 0, 0.35, 1);
  }

  .creepy-btn__eyes {
    position: absolute;
    display: flex;
    align-items: center;
    gap: 0.375em;
    right: 1em;
    bottom: 0.5em;
    height: 0.75em;
  }

  .creepy-btn__eye {
    animation: creepy-eye-blink 3s infinite;
    background-color: hsl(223deg 10% 95%);
    border-radius: 50%;
    overflow: hidden;
    width: 0.75em;
    height: 0.75em;
  }

  .creepy-btn__pupil {
    background-color: #000;
    aspect-ratio: 1;
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0.375em;
    transform: translate(-50%, -50%);
    border-radius: 50%;
  }

  .creepy-btn:focus-visible {
    outline: 0.1875em solid #93c5fd;
  }

  .creepy-btn:hover .creepy-btn__cover {
    background-color: #ffffff;
  }

  .creepy-btn:focus-visible .creepy-btn__cover,
  .creepy-btn:hover .creepy-btn__cover {
    transform: rotate(-12deg);
    transition-timing-function: cubic-bezier(0.65, 0, 0.35, 1.65);
  }

  .creepy-btn:active .creepy-btn__cover {
    transform: rotate(0);
    transition-timing-function: cubic-bezier(0.65, 0, 0.35, 1);
  }

  @keyframes creepy-eye-blink {
    0%, 92%, 100% {
      animation-timing-function: cubic-bezier(0.32, 0, 0.67, 0);
      height: 0.75em;
    }
    96% {
      animation-timing-function: cubic-bezier(0.33, 1, 0.68, 1);
      height: 0;
    }
  }
`;

// ─── Creepy Button Component ──────────────────────────────────────────────────
function CreepyButton({ onClick, children }) {
    const eyesRef = useRef(null);
    const [eyeCoords, setEyeCoords] = useState({ x: 0, y: 0 });

    const translateX = `${-50 + eyeCoords.x * 50}%`;
    const translateY = `${-50 + eyeCoords.y * 50}%`;
    const eyeStyle = { transform: `translate(${translateX}, ${translateY})` };

    const updateEyes = (e) => {
        const userEvent = 'touches' in e ? e.touches[0] : e;
        const eyesRect = eyesRef.current?.getBoundingClientRect();
        if (!eyesRect) return;

        const eyes = {
            x: eyesRect.left + eyesRect.width / 2,
            y: eyesRect.top + eyesRect.height / 2,
        };
        const cursor = { x: userEvent.clientX, y: userEvent.clientY };

        const dx = cursor.x - eyes.x;
        const dy = cursor.y - eyes.y;
        const angle = Math.atan2(-dy, dx) + Math.PI / 2;

        const visionRangeX = 180;
        const visionRangeY = 75;
        const distance = Math.hypot(dx, dy);
        const x = Math.sin(angle) * distance / visionRangeX;
        const y = Math.cos(angle) * distance / visionRangeY;

        setEyeCoords({ x, y });
    };

    return (
        <button
            className="creepy-btn"
            type="button"
            onClick={onClick}
            onMouseMove={updateEyes}
            onTouchMove={updateEyes}
        >
            <span className="creepy-btn__eyes" ref={eyesRef}>
                <span className="creepy-btn__eye">
                    <span className="creepy-btn__pupil" style={eyeStyle} />
                </span>
                <span className="creepy-btn__eye">
                    <span className="creepy-btn__pupil" style={eyeStyle} />
                </span>
            </span>
            <span className="creepy-btn__cover">{children}</span>
        </button>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatFunds(amount) {
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000)     return `$${(amount / 1_000).toFixed(0)}K`;
    return `$${amount}`;
}

function getFromStorage(key) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

// Statuses that count as "funded / successful"
const FUNDED_STATUSES = ['approved', 'paid', 'completed', 'active'];

function computeStats() {
    // ── Pull from localStorage (newly created records) ────────────────────
    // Adjust these keys to match whatever your app saves under
    const localEvents   = getFromStorage('sponza_events');    // events created by colleges
    const localRequests = getFromStorage('sponza_requests');  // sponsorship applications
    const localUsers    = getFromStorage('sponza_users');     // newly registered users

    // ── Merge with dummy data ─────────────────────────────────────────────
    const allEventsData   = [...dummyEvents,              ...localEvents];
    const allRequestsData = [...dummySponsorshipRequests, ...localRequests];
    const allUsersData    = [
        ...allUsers,
        ...localUsers,
    ];

    // 1. Total events
    const totalEvents = allEventsData.length;

    // 2. Sponsorship raised — sum of all approved/paid request amounts
    const totalFundsRaised = allRequestsData
        .filter(r => FUNDED_STATUSES.includes(r.status))
        .reduce((sum, r) => sum + Number(r.amount ?? 0), 0);

    // 3. Active sponsors — unique sponsor names from requests + sponsor-role users
    const sponsorSet = new Set();
    allRequestsData.forEach(r => { if (r.sponsor) sponsorSet.add(r.sponsor); });
    allUsersData
        .filter(u => u.role === 'sponsor' && u.status !== 'suspended')
        .forEach(u => sponsorSet.add(u.name ?? u.companyName));
    const activeSponsors = sponsorSet.size;

    // 4. Success rate — % of events that have at least one approved/paid request
    const fundedEventIds = new Set(
        allRequestsData
            .filter(r => FUNDED_STATUSES.includes(r.status))
            .map(r => r.eventId)
    );
    const successRate = totalEvents > 0
        ? Math.round((fundedEventIds.size / totalEvents) * 100)
        : 0;

    return [
        { value: `${totalEvents}+`,             label: 'College Events' },
        { value: formatFunds(totalFundsRaised),  label: 'Sponsorship Raised' },
        { value: `${activeSponsors}+`,           label: 'Active Sponsors' },
        { value: `${successRate}%`,              label: 'Success Rate' },
    ];
}

export default function Home() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);
    const [userRole, setUserRole] = React.useState(null);
    const [stats, setStats] = React.useState(() => computeStats());

    React.useEffect(() => {
        // Auth check
        const auth = localStorage.getItem('sponza_auth');
        if (auth) {
            const parsed = JSON.parse(auth);
            setIsAuthenticated(true);
            setUserRole(parsed.role);
        }

        // Recompute stats on mount so any new localStorage data is reflected
        setStats(computeStats());

        // Also recompute if localStorage changes in another tab
        const onStorage = () => setStats(computeStats());
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('sponza_auth');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('base44_access_token');
        localStorage.removeItem('user_role');
        setIsAuthenticated(false);
        setUserRole(null);
    };

    // Featured events: merge dummy + locally created, take first 3 featured ones
    const localEvents    = getFromStorage('sponza_events');
    const allEventsData  = [...dummyEvents, ...localEvents];
    const featuredEvents = allEventsData.filter(e => e.featured).slice(0, 3);

    const features = [
        {
            icon: Target,
            title: 'Smart Matching',
            description: 'Our AI-powered algorithm connects sponsors with events that align with their brand values and target audience.',
            color: 'bg-blue-50 text-[#1E3A8A]'
        },
        {
            icon: Shield,
            title: 'Secure Transactions',
            description: 'Safe and transparent payment processing with escrow protection for both parties.',
            color: 'bg-green-50 text-[#22C55E]'
        },
        {
            icon: TrendingUp,
            title: 'Analytics & ROI',
            description: 'Track your sponsorship performance with detailed analytics and ROI measurements.',
            color: 'bg-orange-50 text-[#F97316]'
        },
        {
            icon: Users,
            title: 'Network Growth',
            description: 'Build lasting relationships with colleges and sponsors across the country.',
            color: 'bg-purple-50 text-purple-600'
        },
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <style>{creepyCSS}</style>
            <Navbar isAuthenticated={isAuthenticated} onLogout={handleLogout} userRole={userRole} />

            {/* ── Hero ── */}
            <section className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#1E3A8A] to-[#22C55E]/30" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1920&h=1080&fit=crop')] opacity-10 bg-cover bg-center" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-white">
                            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                                SPONZA — Connecting
                                <span className="text-[skyblue]"> Ideas </span>
                                with Sponsors
                            </h1>
                            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                                The premier platform connecting college event organizers with sponsors.
                                Create memorable events with the backing they deserve.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <CreepyButton onClick={() => navigate(createPageUrl('BrowseEvents'))}>
                                    Browse Events
                                </CreepyButton>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 lg:gap-6">
                            {stats.map((stat, index) => (
                                <Card key={index} className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-shadow">
                                    <p className="text-3xl lg:text-4xl font-bold text-[#1E3A8A]">{stat.value}</p>
                                    <p className="text-slate-600 mt-1">{stat.label}</p>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── How it works ── */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2937] mb-4">How Sponza Works</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Simple, transparent, and effective sponsorship matching in three easy steps
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: GraduationCap, title: 'Create Event',    desc: 'Colleges list their events with sponsorship packages and reach requirements.' },
                            { icon: Building2,     title: 'Match & Connect', desc: 'Sponsors discover events that align with their brand and apply for packages.' },
                            { icon: Zap,           title: 'Collaborate',     desc: 'Seamless communication and secure payments make partnerships a breeze.' },
                        ].map((step, index) => (
                            <div key={index} className="relative">
                                <div className="flex flex-col items-center text-center">
                                    <div className="w-20 h-20 bg-[#1E3A8A]/10 rounded-2xl flex items-center justify-center mb-6 relative">
                                        <step.icon className="w-10 h-10 text-[#1E3A8A]" />
                                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#22C55E] rounded-full flex items-center justify-center text-white font-bold">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-[#1F2937] mb-3">{step.title}</h3>
                                    <p className="text-slate-600">{step.desc}</p>
                                </div>
                                {index < 2 && (
                                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#1E3A8A]/20 to-transparent" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Why Sponza ── */}
            <section className="py-24 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2937] mb-4">Why Choose Sponza?</h2>
                        <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                            Everything you need to create successful sponsorship partnerships
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="p-6 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-5`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg font-semibold text-[#1F2937] mb-2">{feature.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Events ── */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2937] mb-2">Featured Events</h2>
                            <p className="text-slate-600">Discover top sponsorship opportunities</p>
                        </div>
                        <Link to={createPageUrl('BrowseEvents')}>
                            <Button variant="outline" className="border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white">
                                View All Events
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredEvents.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 bg-gradient-to-br from-[#1E3A8A] to-[#1E3A8A]/80">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                        Ready to Transform Your Event Sponsorship?
                    </h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join hundreds of colleges and sponsors already using Sponza to create meaningful partnerships.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to={createPageUrl('About')}>
                            <Button size="lg" variant="outline" className="border-white text-blue-500 hover:bg-white hover:text-[#1E3A8A] px-8 h-14 text-lg">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}