import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Building2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { createPageUrl } from '../utils';
import { setAuthToken } from '../api/client';
import logoSrc from '/img/a-sleek-modern-logo-design-featuring-the_goDenOD7TPS-KtuXM3BUnA_RzVYVD7bSjiL0zKDsLJ0uw-Photoroom.png';

const THEME = {
    start: "#004e92",
    stop: "#000d7a",
    bgColor: "#00052d",
    color: "rgba(255,255,255,0.8)",
    inputBg: "rgba(0,0,0,0.4)",
    inputIconColor: "rgba(255,255,255,0.3)",
    inputFocusIconColor: "#24b7ff",
    inputFocusBg: "rgba(0,0,0,0.5)",
    placeholderColor: "rgba(255,255,255,0.7)",
};

const ArrowIcon = ({ color }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
        <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
    </svg>
);

function StyledInput({ type, placeholder, icon, value, onChange, showToggle, onToggle, showPassword }) {
    const [focused, setFocused] = useState(false);
    const inputType = showToggle ? (showPassword ? 'text' : 'password') : type;

    return (
        <div style={{ marginBottom: 15, position: "relative" }}>
            <style>{`.styled-input-${type}::placeholder { color: ${THEME.placeholderColor}; opacity: 1; }`}</style>
            <span style={{
                position: "absolute", left: 13, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
                display: "flex", alignItems: "center", zIndex: 1,
            }}>
                {icon}
            </span>
            <input
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`styled-input-${type}`}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                required
                style={{
                    width: "100%",
                    backgroundColor: focused ? THEME.inputFocusBg : THEME.inputBg,
                    border: "none",
                    borderRadius: 6,
                    color: THEME.color,
                    fontSize: 16,
                    padding: "14px 44px",
                    fontFamily: "Poppins, sans-serif",
                    outline: "none",
                    transition: "all 250ms ease-in-out",
                    boxSizing: "border-box",
                }}
            />
            {showToggle && (
                <button
                    type="button"
                    onClick={onToggle}
                    style={{
                        position: "absolute", right: 13, top: "50%",
                        transform: "translateY(-50%)", background: "none",
                        border: "none", cursor: "pointer", display: "flex",
                        alignItems: "center", color: "rgba(255,255,255,0.4)",
                    }}
                >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            )}
        </div>
    );
}

export default function SignIn() {
    const navigate = useNavigate();
    const [role, setRole] = useState('college');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const roles = [
        { id: 'college', label: 'College', icon: GraduationCap, desc: 'Event Organizer' },
        { id: 'sponsor', label: 'Sponsor', icon: Building2, desc: 'Company' },
    ];

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const endpoint = role === 'college' ? 'organizationLogin' : 'sponsorLogin';
            const { api } = await import('../api/client');
            const response = await api.auth[endpoint](email, password);
            
            if (response.token) {
                setAuthToken(response.token);
                localStorage.setItem('user_role', role);
                if (role === 'college') navigate(createPageUrl('CollegeDashboard'));
                else navigate(createPageUrl('SponsorDashboard'));
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
            <style>{`
                *, *::before, *::after { box-sizing: border-box; }
                @keyframes float1 {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-18px) scale(1.04); }
                }
                @keyframes float2 {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(14px) scale(0.97); }
                }
                .orb1 { animation: float1 6s ease-in-out infinite; }
                .orb2 { animation: float2 8s ease-in-out infinite; }
                .orb3 { animation: float1 10s ease-in-out infinite 2s; }
                .signin-btn:hover { opacity: 0.85; transform: translateY(-1px); }
                .signin-btn { transition: opacity 200ms, transform 200ms; }
                .role-btn:hover { border-color: rgba(255,255,255,0.3) !important; }
            `}</style>

            <div style={{
                backgroundColor: THEME.bgColor,
                minHeight: "100vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "Poppins, sans-serif",
                padding: "24px",
            }}>
                <div style={{
                    display: "flex",
                    width: "min(960px, 100%)",
                    minHeight: 580,
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.45)",
                }}>

                    {/* ── LEFT PANEL ── */}
                    <div style={{
                        flex: "0 0 42%",
                        background: `linear-gradient(225deg, ${THEME.start} 16%, ${THEME.stop} 100%)`,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "48px 40px",
                        position: "relative",
                        overflow: "hidden",
                    }}>
                        <div className="orb1" style={{
                            position: "absolute", top: "10%", left: "10%",
                            width: 160, height: 160, borderRadius: "50%",
                            background: "rgba(255,255,255,0.08)", filter: "blur(2px)",
                        }} />
                        <div className="orb2" style={{
                            position: "absolute", bottom: "12%", right: "8%",
                            width: 220, height: 220, borderRadius: "50%",
                            background: "rgba(255,255,255,0.06)", filter: "blur(4px)",
                        }} />
                        <div className="orb3" style={{
                            position: "absolute", top: "55%", left: "30%",
                            width: 90, height: 90, borderRadius: "50%",
                            background: "rgba(255,255,255,0.1)",
                        }} />

                        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
                            <Link to={createPageUrl('Home')}>
                                <img
                                    src={logoSrc}
                                    alt="Sponza logo"
                                    style={{
                                        width: 260,
                                        height: "auto",
                                        objectFit: "contain",
                                        display: "block",
                                        margin: "0 auto 16px",
                                    }}
                                />
                            </Link>

                            <p style={{
                                color: "rgba(255,255,255,0.65)", fontSize: 14,
                                lineHeight: 1.5, maxWidth: 240, margin: "0 auto",
                            }}>
                                Fueling Events. Empowering Ideas.
                            </p>

                            <div style={{
                                width: 45, height: 2,
                                background: "rgba(255,255,255,0.3)",
                                borderRadius: 2, margin: "16px auto 0",
                            }} />

                            <Link to={createPageUrl('Home')} style={{
                                display: "inline-block", marginTop: 48,
                                color: "rgba(255,255,255,0.5)", fontSize: 15
                            }}>
                                ← Back to Home
                            </Link>
                        </div>
                    </div>

                    {/* ── RIGHT PANEL ── */}
                    <div style={{
                        flex: 1,
                        backgroundColor: THEME.bgColor,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        padding: "40px 44px",
                        overflowY: "auto",
                    }}>
                        <h1 style={{
                            color: THEME.color, fontSize: 28, fontWeight: 700,
                            letterSpacing: "-0.5px", marginBottom: 4,
                            textAlign: "center",
                        }}>
                            Welcome Back
                        </h1>
                        <p style={{
                            color: "rgba(255,255,255,0.45)", fontSize: 14,
                            marginBottom: 28, textAlign: "center",
                        }}>
                            Login in to your account
                        </p>

                        <div style={{
                            display: "grid", gridTemplateColumns: "1fr 1fr",
                            gap: 12, marginBottom: 28,
                        }}>
                            {roles.map((r) => {
                                const Icon = r.icon;
                                const isActive = role === r.id;
                                return (
                                    <button
                                        key={r.id}
                                        type="button"
                                        className="role-btn"
                                        onClick={() => setRole(r.id)}
                                        style={{
                                            padding: "14px 8px",
                                            borderRadius: 10,
                                            border: `2px solid ${isActive ? '#24b7ff' : 'rgba(255,255,255,0.1)'}`,
                                            background: isActive ? 'rgba(36,183,255,0.1)' : 'rgba(255,255,255,0.03)',
                                            cursor: "pointer",
                                            transition: "all 200ms",
                                            textAlign: "center",
                                        }}
                                    >
                                        <Icon
                                            size={22}
                                            color={isActive ? '#24b7ff' : 'rgba(255,255,255,0.35)'}
                                            style={{ margin: "0 auto 6px" }}
                                        />
                                        <p style={{
                                            fontSize: 13, fontWeight: 600, margin: 0,
                                            color: isActive ? '#24b7ff' : 'rgba(255,255,255,0.55)',
                                            fontFamily: "Poppins, sans-serif",
                                        }}>{r.label}</p>
                                        <p style={{
                                            fontSize: 11, margin: 0,
                                            color: "rgba(255,255,255,0.3)",
                                            fontFamily: "Poppins, sans-serif",
                                        }}>{r.desc}</p>
                                    </button>
                                );
                            })}
                        </div>

                        <form onSubmit={handleLogin}>
                            <StyledInput
                                type="email"
                                placeholder="Enter your email"
                                icon={<Mail size={18} color="rgba(255,255,255,0.3)" />}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <StyledInput
                                type="password"
                                placeholder="Enter your password"
                                icon={<Lock size={18} color="rgba(255,255,255,0.3)" />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                showToggle={true}
                                onToggle={() => setShowPassword(!showPassword)}
                                showPassword={showPassword}
                            />

                            <div style={{
                                display: "flex", justifyContent: "space-between",
                                alignItems: "center", marginBottom: 24, marginTop: -4,
                            }}>
                                <label style={{
                                    display: "flex", alignItems: "center", gap: 8,
                                    color: "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer",
                                }}>
                                    <input type="checkbox" style={{ accentColor: "#24b7ff" }} />
                                    Remember me
                                </label>

                                {/* ✅ UPDATED: Forgot Password now uses Link for navigation */}
                                <Link to={createPageUrl('ForgotPassword')} style={{
                                    color: "rgba(255,255,255,0.45)",
                                    fontSize: 13,
                                    textDecoration: "none",
                                    display: "block",
                                    textAlign: "right",
                                    marginTop: 6,
                                }}>
                                    Forgot Password?
                                </Link>
                            </div>

                            {error && (
                                <div style={{
                                    padding: "10px 14px", marginBottom: 16,
                                    background: "rgba(239,68,68,0.1)",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    borderRadius: 8, color: "#f87171", fontSize: 14,
                                }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="signin-btn"
                                style={{
                                    background: `linear-gradient(225deg, ${THEME.start}, ${THEME.stop})`,
                                    border: "none", borderRadius: 8, color: "#fff",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: 16, fontWeight: 600, fontFamily: "Poppins, sans-serif",
                                    padding: "14px 10px", width: "100%", gap: 8,
                                    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                                    opacity: loading ? 0.7 : 1,
                                }}
                            >
                                {loading ? 'Signing in...' : 'Login In'}
                                {!loading && <ArrowIcon color="#fff" />}
                            </button>
                        </form>

                        <p style={{
                            color: "rgba(255,255,255,0.3)", fontSize: 13,
                            textAlign: "center", marginTop: 24,
                        }}>
                            Don't have an account?{" "}
                            <Link to={createPageUrl('Register')} style={{
                                color: "rgba(255,255,255,0.65)", cursor: "pointer",
                                textDecoration: "none", fontWeight: 600,
                            }}>
                                Sign up
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </>
    );
}