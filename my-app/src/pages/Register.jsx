import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Building2, GraduationCap } from 'lucide-react';
import { createPageUrl } from '../utils';
import { api, setAuthToken } from '../api/client';
import logoSrc from '/img/a-sleek-modern-logo-design-featuring-the_goDenOD7TPS-KtuXM3BUnA_RzVYVD7bSjiL0zKDsLJ0uw-Photoroom.png';

const THEME = {
    start: "#004e92",
    stop: "#000d7a",
    bgColor: "#00052d",
    color: "rgba(255,255,255,0.8)",
    inputBg: "rgba(0,0,0,0.4)",
    inputFocusBg: "rgba(0,0,0,0.5)",
    placeholderColor: "rgba(255,255,255,0.7)",
};

// --- Styled Input ---
function StyledInput({ type = "text", placeholder, icon, value, onChange, showToggle, onToggle, showPassword }) {
    const [focused, setFocused] = useState(false);
    const inputType = showToggle ? (showPassword ? 'text' : 'password') : type;
    const uid = `reg-input-${placeholder?.replace(/\s+/g, '-')}`;

    return (
        <div style={{ position: "relative", width: "100%" }}>
            <style>{`.${uid}::placeholder { color: ${THEME.placeholderColor}; opacity: 1; }`}</style>
            {icon && (
                <span style={{
                    position: "absolute", left: 12, top: "50%",
                    transform: "translateY(-50%)", pointerEvents: "none",
                    display: "flex", alignItems: "center", zIndex: 1,
                }}>
                    {icon}
                </span>
            )}
            <input
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={uid}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: "100%",
                    backgroundColor: focused ? THEME.inputFocusBg : THEME.inputBg,
                    border: `1px solid ${focused ? 'rgba(36,183,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 6,
                    color: THEME.color,
                    fontSize: 14,
                    padding: icon ? "11px 40px 11px 38px" : "11px 14px",
                    fontFamily: "Poppins, sans-serif",
                    outline: "none",
                    transition: "all 250ms ease-in-out",
                    boxSizing: "border-box",
                }}
            />
            {showToggle && (
                <button type="button" onClick={onToggle} style={{
                    position: "absolute", right: 12, top: "50%",
                    transform: "translateY(-50%)", background: "none",
                    border: "none", cursor: "pointer", display: "flex",
                    alignItems: "center", color: "rgba(255,255,255,0.4)",
                }}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            )}
        </div>
    );
}

// --- Styled Select ---
function StyledSelect({ value, onChange, options, placeholder }) {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ position: "relative", width: "100%" }}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={{
                    width: "100%",
                    backgroundColor: focused ? THEME.inputFocusBg : THEME.inputBg,
                    border: `1px solid ${focused ? 'rgba(36,183,255,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 6,
                    color: value ? THEME.color : THEME.placeholderColor,
                    fontSize: 14,
                    padding: "11px 14px",
                    fontFamily: "Poppins, sans-serif",
                    outline: "none",
                    transition: "all 250ms ease-in-out",
                    boxSizing: "border-box",
                    appearance: "none",
                    cursor: "pointer",
                }}
            >
                <option value="" disabled style={{ color: "#999", background: "#00052d" }}>{placeholder}</option>
                {options.map(o => (
                    <option key={o} value={o} style={{ background: "#00052d", color: "#fff" }}>{o}</option>
                ))}
            </select>
            <span style={{
                position: "absolute", right: 12, top: "50%",
                transform: "translateY(-50%)", pointerEvents: "none",
                color: "rgba(255,255,255,0.3)", fontSize: 10,
            }}>▼</span>
        </div>
    );
}

// --- Field wrapper ---
function Field({ label, error, children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {label && (
                <label style={{
                    color: "rgba(255,255,255,0.5)", fontSize: 12,
                    fontFamily: "Poppins, sans-serif", fontWeight: 600,
                    textTransform: "uppercase", letterSpacing: "0.05em",
                }}>
                    {label}
                </label>
            )}
            {children}
            {error && <p style={{ color: "#f87171", fontSize: 12, margin: 0 }}>{error}</p>}
        </div>
    );
}

const ArrowIcon = ({ color, dir = "right" }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={color}
        style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }}>
        <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" />
    </svg>
);

export default function Register() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [role, setRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    // ✅ NEW: success state to show confirmation before redirect
    const [registrationDone, setRegistrationDone] = useState(false);

    const [formData, setFormData] = useState({
        email: '', password: '', confirmPassword: '',
        name: '', phone: '',
        collegeName: '', collegeType: '', location: '', website: '', aisheCode: '',
        companyName: '', companyWebsite: '',
    });

    const [errors, setErrors] = useState({});

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validateStep1 = () => {
        const e = {};
        if (!role) e.role = 'Please select a role';
        if (!formData.email) {
            e.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            e.email = 'Enter a valid email address';
        }
        if (!formData.password) {
            e.password = 'Password is required';
        } else if (formData.password.length < 8) {
            e.password = 'Minimum 8 characters required';
        } else if (!/[A-Z]/.test(formData.password)) {
            e.password = 'Must contain at least one uppercase letter';
        } else if (!/[0-9]/.test(formData.password)) {
            e.password = 'Must contain at least one number';
        } else if (!/[!@#$%^&*]/.test(formData.password)) {
            e.password = 'Must contain at least one special character (!@#$%^&*)';
        }
        if (!formData.confirmPassword) {
            e.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            e.confirmPassword = 'Passwords do not match';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e = {};
        if (!formData.name) {
            e.name = 'Contact name is required';
        } else if (formData.name.trim().length < 3) {
            e.name = 'Name must be at least 3 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
            e.name = 'Name must contain only letters';
        }
        if (!formData.phone) {
            e.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
            e.phone = 'Enter a valid 10-digit Indian mobile number';
        }
        if (role === 'college') {
            if (!formData.collegeName) {
                e.collegeName = 'College name is required';
            } else if (formData.collegeName.trim().length < 3) {
                e.collegeName = 'College name must be at least 3 characters';
            }
            if (!formData.collegeType) e.collegeType = 'Please select college type';
            if (!formData.location) {
                e.location = 'Location is required';
            } else if (formData.location.trim().length < 3) {
                e.location = 'Enter a valid city and state';
            }
            if (formData.aisheCode && !/^[A-Z]-\d{5}$/.test(formData.aisheCode.toUpperCase())) {
                e.aisheCode = 'Invalid AISHE Code format (e.g. C-12345)';
            }
            if (formData.website && !/^https?:\/\/.+\..+/.test(formData.website)) {
                e.website = 'Enter a valid URL (e.g. https://college.edu)';
            }
        } else {
            if (!formData.companyName) {
                e.companyName = 'Company name is required';
            } else if (formData.companyName.trim().length < 2) {
                e.companyName = 'Company name must be at least 2 characters';
            }
            if (formData.companyWebsite && !/^https?:\/\/.+\..+/.test(formData.companyWebsite)) {
                e.companyWebsite = 'Enter a valid URL (e.g. https://company.com)';
            }
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => { if (validateStep1()) setStep(2); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep2()) return;
        setLoading(true);
        
        try {
            const endpoint = role === 'college' ? 'organizationRegister' : 'sponsorRegister';
            await api.auth[endpoint](formData.email, formData.password, formData.name);
            
            setLoading(false);
            setRegistrationDone(true);

            setTimeout(() => {
                navigate(createPageUrl('SignIn'));
            }, 2000);
        } catch (err) {
            setLoading(false);
            setErrors({ submit: err.message || 'Registration failed. Please try again.' });
        }
    };

    const collegeTypes = ['University', 'College', 'Institute', 'Academy', 'School'];

    // ✅ SUCCESS SCREEN — shown briefly before redirect
    if (registrationDone) {
        return (
            <>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
                <div style={{
                    backgroundColor: THEME.bgColor, minHeight: "100vh", width: "100%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "Poppins, sans-serif",
                }}>
                    <div style={{ textAlign: "center", padding: "40px" }}>
                        {/* Animated checkmark */}
                        <div style={{
                            width: 80, height: 80, borderRadius: "50%",
                            background: "rgba(34,197,94,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            margin: "0 auto 24px",
                            border: "2px solid rgba(34,197,94,0.4)",
                        }}>
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2 style={{ color: THEME.color, fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                            Account Created!
                        </h2>
                        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 6 }}>
                            Welcome to Sponza, <span style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{formData.name}</span>!
                        </p>
                        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
                            Redirecting you to Sign In...
                        </p>
                        {/* Loading dots */}
                        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
                            {[0, 1, 2].map(i => (
                                <div key={i} style={{
                                    width: 8, height: 8, borderRadius: "50%",
                                    background: "#24b7ff",
                                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                                }} />
                            ))}
                        </div>
                        <style>{`
                            @keyframes pulse {
                                0%, 100% { opacity: 0.3; transform: scale(0.8); }
                                50% { opacity: 1; transform: scale(1.2); }
                            }
                        `}</style>
                        <p style={{ marginTop: 24, color: "rgba(255,255,255,0.2)", fontSize: 12 }}>
                            Not redirecting?{" "}
                            <span
                                onClick={() => navigate(createPageUrl('SignIn'))}
                                style={{ color: "#24b7ff", cursor: "pointer", textDecoration: "underline" }}
                            >
                                Click here
                            </span>
                        </p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
            <style>{`
                *, *::before, *::after { box-sizing: border-box; }
                @keyframes float1 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-18px) scale(1.04)} }
                @keyframes float2 { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(14px) scale(0.97)} }
                .orb1{animation:float1 6s ease-in-out infinite}
                .orb2{animation:float2 8s ease-in-out infinite}
                .orb3{animation:float1 10s ease-in-out infinite 2s}
                .reg-btn:hover{opacity:0.85;transform:translateY(-1px)}
                .reg-btn{transition:opacity 200ms,transform 200ms}
                .role-btn:hover{border-color:rgba(255,255,255,0.3)!important}
                ::-webkit-scrollbar{width:4px}
                ::-webkit-scrollbar-track{background:transparent}
                ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:4px}
            `}</style>

            <div style={{
                backgroundColor: THEME.bgColor, minHeight: "100vh", width: "100%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Poppins, sans-serif", padding: "24px",
            }}>
                <div style={{
                    display: "flex", width: "min(980px, 100%)", minHeight: 600,
                    borderRadius: 16, overflow: "hidden",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.45)",
                }}>

                    {/* ── LEFT PANEL ── */}
                    <div style={{
                        flex: "0 0 38%",
                        background: `linear-gradient(225deg, ${THEME.start} 16%, ${THEME.stop} 100%)`,
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", padding: "48px 36px",
                        position: "relative", overflow: "hidden",
                    }}>
                        <div className="orb1" style={{ position:"absolute", top:"10%", left:"10%", width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.08)", filter:"blur(2px)" }} />
                        <div className="orb2" style={{ position:"absolute", bottom:"12%", right:"8%", width:220, height:220, borderRadius:"50%", background:"rgba(255,255,255,0.06)", filter:"blur(4px)" }} />
                        <div className="orb3" style={{ position:"absolute", top:"55%", left:"30%", width:90, height:90, borderRadius:"50%", background:"rgba(255,255,255,0.1)" }} />

                        <div style={{ position:"relative", zIndex:1, textAlign:"center" }}>
                            <Link to={createPageUrl('Home')}>
                                <img src={logoSrc} alt="Sponza logo" style={{ width:240, height:"auto", objectFit:"contain", display:"block", margin:"0 auto 16px" }} />
                            </Link>
                            <p style={{ color:"rgba(255,255,255,0.65)", fontSize:14, lineHeight:1.5, maxWidth:220, margin:"0 auto" }}>
                                Fueling Events. Empowering Ideas.
                            </p>
                            <div style={{ width:45, height:2, background:"rgba(255,255,255,0.3)", borderRadius:2, margin:"16px auto 0" }} />

                            {/* Step indicator */}
                            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginTop:36 }}>
                                {[1,2].map(s => (
                                    <React.Fragment key={s}>
                                        <div style={{
                                            width:32, height:32, borderRadius:"50%",
                                            background: step >= s ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.15)",
                                            display:"flex", alignItems:"center", justifyContent:"center",
                                            fontSize:13, fontWeight:700,
                                            color: step >= s ? THEME.stop : "rgba(255,255,255,0.4)",
                                            transition:"all 300ms",
                                        }}>{s}</div>
                                        {s < 2 && <div style={{ width:32, height:2, borderRadius:2, background: step >= 2 ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.2)", transition:"all 300ms" }} />}
                                    </React.Fragment>
                                ))}
                            </div>
                            <p style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginTop:10 }}>
                                Step {step} of 2 — {step === 1 ? 'Credentials' : 'Organization'}
                            </p>

                            <Link to={createPageUrl('Home')} style={{ display:"inline-block", marginTop:48, color:"rgba(255,255,255,0.5)", fontSize:15 }}>
                                ← Back to Home
                            </Link>
                        </div>
                    </div>

                    {/* ── RIGHT PANEL ── */}
                    <div style={{
                        flex:1, backgroundColor: THEME.bgColor,
                        display:"flex", flexDirection:"column", justifyContent:"center",
                        padding:"36px 44px", overflowY:"auto",
                    }}>

                        <h1 style={{ color:THEME.color, fontSize:26, fontWeight:700, letterSpacing:"-0.5px", marginBottom:4, textAlign:"center" }}>
                            {step === 1 ? 'Create Account' : (role === 'college' ? 'College Details' : 'Company Details')}
                        </h1>
                        <p style={{ color:"rgba(255,255,255,0.45)", fontSize:13, marginBottom:24, textAlign:"center" }}>
                            {step === 1 ? 'Choose your role and set up credentials' : 'Tell us more about your organization'}
                        </p>

                        {/* ── STEP 1 ── */}
                        {step === 1 && (
                            <div>
                                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                                    {[
                                        { id:'college', label:'College', sub:'Event Organizer', Icon: GraduationCap },
                                        { id:'sponsor', label:'Sponsor', sub:'Company', Icon: Building2 },
                                    ].map(({ id, label, sub, Icon }) => (
                                        <button key={id} type="button" className="role-btn" onClick={() => setRole(id)} style={{
                                            padding:"18px 8px", borderRadius:10,
                                            border:`2px solid ${role === id ? '#24b7ff' : 'rgba(255,255,255,0.1)'}`,
                                            background: role === id ? 'rgba(36,183,255,0.1)' : 'rgba(255,255,255,0.03)',
                                            cursor:"pointer", transition:"all 200ms", textAlign:"center",
                                        }}>
                                            <Icon size={28} color={role === id ? '#24b7ff' : 'rgba(255,255,255,0.35)'} style={{ margin:"0 auto 8px" }} />
                                            <p style={{ fontSize:14, fontWeight:600, margin:0, color: role === id ? '#24b7ff' : 'rgba(255,255,255,0.6)', fontFamily:"Poppins, sans-serif" }}>{label}</p>
                                            <p style={{ fontSize:11, margin:0, color:"rgba(255,255,255,0.3)", fontFamily:"Poppins, sans-serif" }}>{sub}</p>
                                        </button>
                                    ))}
                                </div>
                                {errors.role && <p style={{ color:"#f87171", fontSize:12, marginBottom:12 }}>{errors.role}</p>}

                                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                                    <Field label="Email" error={errors.email}>
                                        <StyledInput
                                            type="email"
                                            placeholder="Enter your email"
                                            icon={<Mail size={16} color="rgba(255,255,255,0.3)" />}
                                            value={formData.email}
                                            onChange={e => handleInputChange('email', e.target.value)}
                                        />
                                    </Field>
                                    <Field label="Password" error={errors.password}>
                                        <StyledInput
                                            type="password"
                                            placeholder="Min 8 chars, uppercase, number, special char"
                                            icon={<Lock size={16} color="rgba(255,255,255,0.3)" />}
                                            value={formData.password}
                                            onChange={e => handleInputChange('password', e.target.value)}
                                            showToggle
                                            onToggle={() => setShowPassword(!showPassword)}
                                            showPassword={showPassword}
                                        />
                                    </Field>
                                    <Field label="Confirm Password" error={errors.confirmPassword}>
                                        <StyledInput
                                            type="password"
                                            placeholder="Confirm your password"
                                            icon={<Lock size={16} color="rgba(255,255,255,0.3)" />}
                                            value={formData.confirmPassword}
                                            onChange={e => handleInputChange('confirmPassword', e.target.value)}
                                        />
                                    </Field>
                                </div>

                                <button type="button" onClick={handleNext} className="reg-btn" style={{
                                    marginTop:22, width:"100%",
                                    background:`linear-gradient(225deg, ${THEME.start}, ${THEME.stop})`,
                                    border:"none", borderRadius:8, color:"#fff",
                                    display:"flex", alignItems:"center", justifyContent:"center",
                                    fontSize:15, fontWeight:600, fontFamily:"Poppins, sans-serif",
                                    padding:"13px 10px", gap:8,
                                    boxShadow:"0 6px 20px rgba(0,0,0,0.25)", cursor:"pointer",
                                }}>
                                    Continue <ArrowIcon color="#fff" />
                                </button>
                            </div>
                        )}

                        {/* ── STEP 2 ── */}
                        {step === 2 && (
                            <form onSubmit={handleSubmit}>
                                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                                        <Field label="Contact Name *" error={errors.name}>
                                            <StyledInput
                                                placeholder="Full name (letters only)"
                                                value={formData.name}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                    handleInputChange('name', val);
                                                }}
                                            />
                                        </Field>
                                        <Field label="Phone *" error={errors.phone}>
                                            <StyledInput
                                                placeholder="10-digit mobile number"
                                                value={formData.phone}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    handleInputChange('phone', val);
                                                }}
                                            />
                                        </Field>
                                    </div>

                                    {role === 'college' ? (
                                        <>
                                            <Field label="College Name *" error={errors.collegeName}>
                                                <StyledInput
                                                    placeholder="Enter college name"
                                                    value={formData.collegeName}
                                                    onChange={e => handleInputChange('collegeName', e.target.value)}
                                                />
                                            </Field>
                                            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                                                <Field label="College Type *" error={errors.collegeType}>
                                                    <StyledSelect
                                                        value={formData.collegeType}
                                                        onChange={v => handleInputChange('collegeType', v)}
                                                        options={collegeTypes}
                                                        placeholder="Select type"
                                                    />
                                                </Field>
                                                <Field label="Location *" error={errors.location}>
                                                    <StyledInput
                                                        placeholder="City, State"
                                                        value={formData.location}
                                                        onChange={e => handleInputChange('location', e.target.value)}
                                                    />
                                                </Field>
                                            </div>
                                            <Field label="AISHE Code (Optional)" error={errors.aisheCode}>
                                                <StyledInput
                                                    placeholder="e.g. C-12345"
                                                    value={formData.aisheCode}
                                                    onChange={e => handleInputChange('aisheCode', e.target.value.toUpperCase())}
                                                />
                                            </Field>
                                            <Field label="Website (Optional)" error={errors.website}>
                                                <StyledInput
                                                    placeholder="https://yourcollege.edu"
                                                    value={formData.website}
                                                    onChange={e => handleInputChange('website', e.target.value)}
                                                />
                                            </Field>
                                        </>
                                    ) : (
                                        <>
                                            <Field label="Company Name *" error={errors.companyName}>
                                                <StyledInput
                                                    placeholder="Enter company name"
                                                    value={formData.companyName}
                                                    onChange={e => handleInputChange('companyName', e.target.value)}
                                                />
                                            </Field>
                                            <Field label="Company Website (Optional)" error={errors.companyWebsite}>
                                                <StyledInput
                                                    placeholder="https://yourcompany.com"
                                                    value={formData.companyWebsite}
                                                    onChange={e => handleInputChange('companyWebsite', e.target.value)}
                                                />
                                            </Field>
                                        </>
                                    )}
                                </div>

                                <div style={{ display:"flex", gap:12, marginTop:22 }}>
                                    <button type="button" onClick={() => setStep(1)} className="reg-btn" style={{
                                        flex:1, background:"rgba(255,255,255,0.06)",
                                        border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, color:"rgba(255,255,255,0.7)",
                                        display:"flex", alignItems:"center", justifyContent:"center",
                                        fontSize:15, fontWeight:600, fontFamily:"Poppins, sans-serif",
                                        padding:"13px 10px", gap:8, cursor:"pointer",
                                    }}>
                                        <ArrowIcon color="rgba(255,255,255,0.7)" dir="left" /> Back
                                    </button>
                                    <button type="submit" disabled={loading} className="reg-btn" style={{
                                        flex:2,
                                        background: loading ? "rgba(34,197,94,0.5)" : "linear-gradient(225deg, #16a34a, #15803d)",
                                        border:"none", borderRadius:8, color:"#fff",
                                        display:"flex", alignItems:"center", justifyContent:"center",
                                        fontSize:15, fontWeight:600, fontFamily:"Poppins, sans-serif",
                                        padding:"13px 10px", gap:8,
                                        boxShadow:"0 6px 20px rgba(0,0,0,0.25)",
                                        cursor: loading ? "not-allowed" : "pointer",
                                        opacity: loading ? 0.8 : 1,
                                    }}>
                                        {loading ? 'Creating Account...' : 'Create Account'}
                                        {!loading && <ArrowIcon color="#fff" />}
                                    </button>
                                </div>
                            </form>
                        )}

                        <p style={{ color:"rgba(255,255,255,0.3)", fontSize:13, textAlign:"center", marginTop:24 }}>
                            Already have an account?{" "}
                            <Link to={createPageUrl('SignIn')} style={{ color:"rgba(255,255,255,0.65)", textDecoration:"none", fontWeight:600 }}>
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}