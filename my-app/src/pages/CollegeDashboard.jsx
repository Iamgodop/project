import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    LayoutDashboard, Calendar, PlusCircle, FileText, 
    CreditCard, Settings, TrendingUp, Clock, CheckCircle
} from 'lucide-react';
import { createPageUrl } from 'C:/Users/USER/sponza/project/my-app/src/utils';
import Sidebar from '../components/shared/Sidebar';
import DashboardHeader from '../components/shared/DashboardHeader';
import StatsCard from '../components/shared/StatsCard';
import { Card } from "C:/Users/USER/sponza/project/my-app/src/components/ui/card";
import { Button } from "C:/Users/USER/sponza/project/my-app/src/components/ui/button";
import { Badge } from "C:/Users/USER/sponza/project/my-app/src/components/ui/badge";
import { dummyEvents, dummySponsorshipRequests } from 'C:/Users/USER/sponza/project/my-app/src/components/data/dummyData';

function loadAllEvents() {
    try {
        const saved = localStorage.getItem('sponza_events');
        const collegeEvents = saved ? JSON.parse(saved) : [];
        return [...dummyEvents, ...collegeEvents];
    } catch { return dummyEvents; }
}

export default function CollegeDashboard() {
    const navigate = useNavigate();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [user, setUser] = useState(null);
    const [allEvents, setAllEvents] = useState([]);

    useEffect(() => {
        const auth = localStorage.getItem('sponza_auth');
        if (!auth) { navigate(createPageUrl('SignIn')); return; }
        const parsed = JSON.parse(auth);
        if (parsed.role !== 'college') { navigate(createPageUrl('Home')); return; }
        setUser(parsed);
        setAllEvents(loadAllEvents());
    }, [navigate]);

    useEffect(() => {
        const sync = () => setAllEvents(loadAllEvents());
        window.addEventListener('focus', sync);
        return () => window.removeEventListener('focus', sync);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('sponza_auth');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('base44_access_token');
        localStorage.removeItem('user_role');
        navigate(createPageUrl('Home'));
    };

    const sidebarItems = [
        { label: 'Dashboard',           icon: LayoutDashboard, page: 'CollegeDashboard' },
        { label: 'Create Event',         icon: PlusCircle,      page: 'CollegeCreateEvent' },
        { label: 'Manage Events',        icon: Calendar,        page: 'CollegeManageEvents' },
        { label: 'Sponsorship Requests', icon: FileText,        page: 'CollegeSponsorshipRequests' },
        { label: 'Payment Records',      icon: CreditCard,      page: 'CollegePayments' },
        { label: 'Profile Settings',     icon: Settings,        page: 'CollegeSettings' },
    ];

    // ✅ Live computed stats
    const myEvents         = allEvents.filter(e => e.id?.toString().startsWith('college_') || true); // show all
    const totalEvents      = allEvents.length;
    const activeEvents     = allEvents.filter(e => e.status === 'Open').length;
    const pendingRequests  = dummySponsorshipRequests.filter(r => r.status === 'pending').length;
    const approvedRequests = dummySponsorshipRequests.filter(r => r.status === 'approved').length;
    const totalRevenue     = dummySponsorshipRequests
        .filter(r => r.status === 'approved')
        .reduce((sum, r) => sum + r.amount, 0);

    const stats = [
        { title: 'Total Events',        value: totalEvents.toString(),               change: `${activeEvents} open`, trend: 'up', icon: Calendar,     iconBg: 'bg-blue-100' },
        { title: 'Active Sponsorships', value: approvedRequests.toString(),          change: '+2',                  trend: 'up', icon: CheckCircle,   iconBg: 'bg-green-100' },
        { title: 'Total Revenue',       value: `₹${(totalRevenue/1000).toFixed(0)}K`, change: '+15%',              trend: 'up', icon: TrendingUp,    iconBg: 'bg-orange-100' },
        { title: 'Pending Requests',    value: pendingRequests.toString(),                                               icon: Clock,        iconBg: 'bg-purple-100' },
    ];

    const recentRequests = dummySponsorshipRequests.slice(0, 3);
    // ✅ Show newest college-created events first, then dummy events
    const collegeCreated = allEvents.filter(e => e.id?.toString().startsWith('college_')).reverse();
    const upcomingEvents = collegeCreated.length > 0 ? collegeCreated.slice(0, 2) : allEvents.slice(0, 2);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex">
            <Sidebar items={sidebarItems} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} userRole="college" />
            <div className="flex-1 flex flex-col min-h-screen">
                <DashboardHeader user={user} onLogout={handleLogout} onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} settingsPage="CollegeSettings" />
                <main className="flex-1 p-6 lg:p-8 overflow-auto">
                    <div className="max-w-7xl mx-auto">

                        {/* ✅ Live Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {stats.map((stat, i) => <StatsCard key={i} {...stat} />)}
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Recent Sponsorship Requests */}
                            <div className="lg:col-span-2">
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-[#1F2937]">Recent Sponsorship Requests</h2>
                                        <Link to={createPageUrl('CollegeSponsorshipRequests')}>
                                            <Button variant="ghost" className="text-[#1E3A8A]">View All</Button>
                                        </Link>
                                    </div>
                                    <div className="space-y-4">
                                        {recentRequests.map(request => (
                                            <div key={request.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                                <div className="flex items-center gap-4">
                                                    <img src={request.sponsorLogo} alt={request.sponsor} className="w-12 h-12 rounded-lg object-cover" />
                                                    <div>
                                                        <p className="font-semibold text-[#1F2937]">{request.sponsor}</p>
                                                        <p className="text-sm text-slate-500">{request.eventTitle} • {request.package}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-[#22C55E]">₹{request.amount.toLocaleString()}</p>
                                                    <Badge className={
                                                        request.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        request.status === 'pending'  ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                                    }>{request.status}</Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                {/* Quick Actions */}
                                <Card className="p-6">
                                    <h2 className="text-xl font-bold text-[#1F2937] mb-4">Quick Actions</h2>
                                    <div className="space-y-3">
                                        <Link to={createPageUrl('CollegeCreateEvent')}>
                                            <Button className="w-full justify-start bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                                                <PlusCircle className="w-5 h-5 mr-3" /> Create New Event
                                            </Button>
                                        </Link>
                                        <Link to={createPageUrl('CollegeManageEvents')}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <Calendar className="w-5 h-5 mr-3" /> Manage Events
                                            </Button>
                                        </Link>
                                        <Link to={createPageUrl('CollegeSponsorshipRequests')}>
                                            <Button variant="outline" className="w-full justify-start">
                                                <FileText className="w-5 h-5 mr-3" /> Review Requests
                                            </Button>
                                        </Link>
                                    </div>
                                </Card>

                                {/* ✅ Live Upcoming / Recent Events */}
                                <Card className="p-6">
                                    <h2 className="text-xl font-bold text-[#1F2937] mb-4">
                                        {collegeCreated.length > 0 ? 'Your Events' : 'Upcoming Events'}
                                    </h2>
                                    <div className="space-y-4">
                                        {upcomingEvents.map(event => (
                                            <div key={event.id} className="p-4 border border-slate-200 rounded-xl">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h3 className="font-semibold text-[#1F2937] text-sm">{event.title}</h3>
                                                    {event.id?.toString().startsWith('college_') && (
                                                        <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full whitespace-nowrap">Your Event</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-500 mt-1">{event.date}</p>
                                                <div className="flex items-center justify-between mt-3">
                                                    <Badge className={event.status === 'Ended' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                                                        {event.status || 'Open'}
                                                    </Badge>
                                                    <span className="text-sm text-slate-500">{(event.expectedAttendees || 0).toLocaleString()} attendees</span>
                                                </div>
                                            </div>
                                        ))}
                                        {collegeCreated.length === 0 && (
                                            <p className="text-sm text-slate-400 text-center py-2">
                                                No events created yet.{' '}
                                                <Link to={createPageUrl('CollegeCreateEvent')} className="text-[#1E3A8A] hover:underline">Create one!</Link>
                                            </p>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}