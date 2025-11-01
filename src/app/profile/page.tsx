"use client"
import Svg from "@/commons/Svg";
import Appbar from "@/components/Appbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { seatAPI, userAPI } from "@/commons/Api";
import ProtectedRoute from "@/components/ProtectedRoute";

function Profile() {
    const [isNotificationOn, setIsNotificationOn] = useState(true);
    const [activeSection, setActiveSection] = useState("profile-details");

    // Password visibility states
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // User profile data
    const [userProfile, setUserProfile] = useState<any>(null);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);

    // Form data state
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        website: "",
        dribbble: "",
        behance: "",
        linkedin: "",
        instagram: "",
        facebook: ""
    });

    const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isUpdatingSocial, setIsUpdatingSocial] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Seat management states
    const [seatStatus, setSeatStatus] = useState<any>(null);
    const [sentInvitations, setSentInvitations] = useState<any[]>([]);
    const [receivedInvitations, setReceivedInvitations] = useState<any[]>([]);
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [isAssignedSeat, setIsAssignedSeat] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [isLoadingSeats, setIsLoadingSeats] = useState(false);
    const [seatMessage, setSeatMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Check if Team & Seats section should be shown
    const shouldShowTeamSeats = (seatStatus && (seatStatus.planType !== 'none' || isAssignedSeat)) || receivedInvitations.length > 0;
    
    // Navigation items data - conditionally include Security (hide for Google users) and Team & Seats
    const navigationItems = [
        { id: "profile-details", label: "Profile", icon: "profile" as const },
        ...(userProfile && !userProfile.isGoogleUser ? [{ id: "security", label: "Security", icon: "security" as const }] : []),
        ...(shouldShowTeamSeats ? [{ id: "team-seats", label: "Team & Seats", icon: "social" as const }] : []),
        { id: "social-profile", label: "Social Profile", icon: "social" as const },
        { id: "notifications", label: "Notifications", icon: "notifications" as const },
        { id: "delete-account", label: "Delete Account", icon: "deleteAccount" as const }
    ];

    // Fetch user profile
    const fetchUserProfile = async () => {
        try {
            setIsLoadingProfile(true);
            const response = await userAPI.getProfile();
            if (response.success) {
                setUserProfile(response.user);
                // Populate social profiles
                setFormData(prev => ({
                    ...prev,
                    website: response.user.socialProfiles?.website || "",
                    dribbble: response.user.socialProfiles?.dribbble || "",
                    behance: response.user.socialProfiles?.behance || "",
                    linkedin: response.user.socialProfiles?.linkedin || "",
                    instagram: response.user.socialProfiles?.instagram || "",
                    facebook: response.user.socialProfiles?.facebook || ""
                }));
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setIsLoadingProfile(false);
        }
    };

    // Handle form input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Fetch seat data
    const fetchSeatData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await seatAPI.getStatus();
            if (response.success) {
                setSeatStatus(response.seatStatus);
                
                // Filter sent invitations to show only the most recent one per email
                const uniqueInvitations = filterUniqueInvitations(response.sentInvitations);
                setSentInvitations(uniqueInvitations);
                
                setReceivedInvitations(response.receivedInvitations);
                setIsAssignedSeat(response.isAssignedSeat);
            }

            // Fetch team members if user has seats
            if (response.seatStatus?.usedSeats > 0) {
                const teamResponse = await seatAPI.getTeamMembers();
                if (teamResponse.success) {
                    setTeamMembers(teamResponse.teamMembers);
                }
            }
        } catch (error) {
            console.error("Error fetching seat data:", error);
        }
    };

    // Filter invitations to show only the most recent one per email address
    const filterUniqueInvitations = (invitations: any[]) => {
        const emailMap = new Map();
        
        invitations.forEach(invitation => {
            const email = invitation.receiverEmail;
            const existing = emailMap.get(email);
            
            // Keep the most recent invitation (by updatedAt or createdAt)
            if (!existing || 
                new Date(invitation.updatedAt || invitation.createdAt) > new Date(existing.updatedAt || existing.createdAt)) {
                emailMap.set(email, invitation);
            }
        });
        
        return Array.from(emailMap.values());
    };

    // Send invitation
    const handleSendInvitation = async () => {
        if (!inviteEmail.trim()) {
            setSeatMessage({ type: 'error', text: 'Please enter an email address' });
            return;
        }

        setIsLoadingSeats(true);
        setSeatMessage(null);

        try {
            const response = await seatAPI.invite(inviteEmail.trim());
            if (response.success) {
                setSeatMessage({ type: 'success', text: 'Invitation sent successfully!' });
                setInviteEmail("");
                fetchSeatData(); // Refresh data
            } else {
                setSeatMessage({ type: 'error', text: response.message || 'Failed to send invitation' });
            }
        } catch (error: any) {
            setSeatMessage({ type: 'error', text: error.message || 'Failed to send invitation' });
        } finally {
            setIsLoadingSeats(false);
        }
    };

    // Accept invitation
    const handleAcceptInvitation = async (invitationId: string) => {
        setIsLoadingSeats(true);
        setSeatMessage(null);

        try {
            const response = await seatAPI.accept(invitationId);
            if (response.success) {
                setSeatMessage({ type: 'success', text: 'Invitation accepted! You now have premium access.' });
                fetchSeatData(); // Refresh data
                // Reload page to update premium status
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setSeatMessage({ type: 'error', text: response.message || 'Failed to accept invitation' });
            }
        } catch (error: any) {
            setSeatMessage({ type: 'error', text: error.message || 'Failed to accept invitation' });
        } finally {
            setIsLoadingSeats(false);
        }
    };

    // Reject invitation
    const handleRejectInvitation = async (invitationId: string) => {
        setIsLoadingSeats(true);
        setSeatMessage(null);

        try {
            const response = await seatAPI.reject(invitationId);
            if (response.success) {
                setSeatMessage({ type: 'success', text: 'Invitation rejected' });
                fetchSeatData(); // Refresh data
            } else {
                setSeatMessage({ type: 'error', text: response.message || 'Failed to reject invitation' });
            }
        } catch (error: any) {
            setSeatMessage({ type: 'error', text: error.message || 'Failed to reject invitation' });
        } finally {
            setIsLoadingSeats(false);
        }
    };

    // Cancel sent invitation
    const handleCancelInvitation = async (invitationId: string) => {
        setIsLoadingSeats(true);
        setSeatMessage(null);

        try {
            const response = await seatAPI.cancel(invitationId);
            if (response.success) {
                setSeatMessage({ type: 'success', text: 'Invitation cancelled' });
                fetchSeatData(); // Refresh data
            } else {
                setSeatMessage({ type: 'error', text: response.message || 'Failed to cancel invitation' });
            }
        } catch (error: any) {
            setSeatMessage({ type: 'error', text: error.message || 'Failed to cancel invitation' });
        } finally {
            setIsLoadingSeats(false);
        }
    };

    // Cancel accepted invitation (remove shared seat from user)
    const handleCancelAcceptedInvitation = async (userId: string, userEmail: string) => {
        if (!confirm(`Are you sure you want to remove the shared seat from ${userEmail}? They will lose premium access and return to a free account.`)) {
            return;
        }

        setIsLoadingSeats(true);
        setSeatMessage(null);

        try {
            const response = await seatAPI.removeUser(userId);
            if (response.success) {
                setSeatMessage({ type: 'success', text: 'Shared seat removed successfully. User returned to free account.' });
                fetchSeatData(); // Refresh data
            } else {
                setSeatMessage({ type: 'error', text: response.message || 'Failed to remove shared seat' });
            }
        } catch (error: any) {
            setSeatMessage({ type: 'error', text: error.message || 'Failed to remove shared seat' });
        } finally {
            setIsLoadingSeats(false);
        }
    };

    // Remove team member
    const handleRemoveTeamMember = async (userId: string, username: string) => {
        if (!confirm(`Are you sure you want to remove ${username} from your team? They will lose premium access and you can re-invite them later.`)) {
            return;
        }

        setIsLoadingSeats(true);
        setSeatMessage(null);

        try {
            const response = await seatAPI.removeUser(userId);
            if (response.success) {
                setSeatMessage({ type: 'success', text: 'Team member removed. You can re-invite them from Sent Invitations.' });
                fetchSeatData(); // Refresh data
            } else {
                setSeatMessage({ type: 'error', text: response.message || 'Failed to remove team member' });
            }
        } catch (error: any) {
            setSeatMessage({ type: 'error', text: error.message || 'Failed to remove team member' });
        } finally {
            setIsLoadingSeats(false);
        }
    };

    // Re-invite (renew) a cancelled or rejected invitation
    const handleReinvite = async (email: string) => {
        if (!email.trim()) {
            setSeatMessage({ type: 'error', text: 'Invalid email address' });
            return;
        }

        setIsLoadingSeats(true);
        setSeatMessage(null);

        try {
            const response = await seatAPI.invite(email.trim());
            if (response.success) {
                setSeatMessage({ type: 'success', text: 'Re-invitation sent successfully!' });
                fetchSeatData(); // Refresh data
            } else {
                setSeatMessage({ type: 'error', text: response.message || 'Failed to send re-invitation' });
            }
        } catch (error: any) {
            setSeatMessage({ type: 'error', text: error.message || 'Failed to send re-invitation' });
        } finally {
            setIsLoadingSeats(false);
        }
    };

    // Cancel shared seat (for users using someone else's seat)
    const handleCancelSharedSeat = async () => {
        if (!confirm('Are you sure you want to leave this shared seat? You will lose premium access.')) {
            return;
        }

        setIsLoadingSeats(true);
        setSeatMessage(null);

        try {
            const response = await seatAPI.cancelSharedSeat();
            if (response.success) {
                setSeatMessage({ type: 'success', text: 'Shared seat cancelled. Reloading...' });
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setSeatMessage({ type: 'error', text: response.message || 'Failed to cancel shared seat' });
            }
        } catch (error: any) {
            setSeatMessage({ type: 'error', text: error.message || 'Failed to cancel shared seat' });
        } finally {
            setIsLoadingSeats(false);
        }
    };

    // Cancel main subscription (for subscription owners)
    const handleCancelSubscription = async () => {
        if (!confirm('⚠️ WARNING: This will cancel your subscription and remove premium access for all team members using your seats. Are you sure?')) {
            return;
        }

        if (!confirm('This action cannot be undone. All shared seats will be removed immediately. Continue?')) {
            return;
        }

        setIsLoadingSeats(true);
        setSeatMessage(null);

        try {
            const response = await seatAPI.cancelSubscription();
            if (response.success) {
                setSeatMessage({ type: 'success', text: 'Subscription cancelled. Reloading...' });
                setTimeout(() => window.location.reload(), 2000);
            } else {
                setSeatMessage({ type: 'error', text: response.message || 'Failed to cancel subscription' });
            }
        } catch (error: any) {
            setSeatMessage({ type: 'error', text: error.message || 'Failed to cancel subscription' });
        } finally {
            setIsLoadingSeats(false);
        }
    };

    // Update social profiles
    const handleUpdateSocial = async () => {
        setIsUpdatingSocial(true);
        setProfileMessage(null);

        try {
            const response = await userAPI.updateSocial({
                website: formData.website || null,
                dribbble: formData.dribbble || null,
                behance: formData.behance || null,
                linkedin: formData.linkedin || null,
                instagram: formData.instagram || null,
                facebook: formData.facebook || null
            });

            if (response.success) {
                setProfileMessage({ type: 'success', text: 'Social profiles updated successfully!' });
                fetchUserProfile(); // Refresh profile data
            } else {
                setProfileMessage({ type: 'error', text: response.message || 'Failed to update social profiles' });
            }
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: error.message || 'Failed to update social profiles' });
        } finally {
            setIsUpdatingSocial(false);
        }
    };

    // Change password
    const handleChangePassword = async () => {
        if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
            setProfileMessage({ type: 'error', text: 'All password fields are required' });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setProfileMessage({ type: 'error', text: 'New password and confirm password do not match' });
            return;
        }

        if (formData.newPassword.length < 6) {
            setProfileMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
            return;
        }

        setIsChangingPassword(true);
        setProfileMessage(null);

        try {
            const response = await userAPI.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmNewPassword: formData.confirmPassword
            });

            if (response.success) {
                setProfileMessage({ type: 'success', text: 'Password changed successfully!' });
                setFormData(prev => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                }));
            } else {
                setProfileMessage({ type: 'error', text: response.message || 'Failed to change password' });
            }
        } catch (error: any) {
            setProfileMessage({ type: 'error', text: error.message || 'Failed to change password' });
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Load user profile and seat data on mount
    useEffect(() => {
        fetchUserProfile();
        fetchSeatData();
    }, []);

    // Scroll detection to update active section
    useEffect(() => {
        const handleScroll = () => {
            // Build sections array based on what's visible
            const sections = navigationItems.map(item => item.id);
            const scrollPosition = window.scrollY + 200; // Offset for better detection

            for (const sectionId of sections) {
                const element = document.getElementById(sectionId);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    const elementTop = rect.top + window.scrollY;
                    const elementBottom = elementTop + rect.height;

                    if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [shouldShowTeamSeats, userProfile]);

    return <>
        <Appbar />
        <div className="px-4 md:px-[122px] py-4 md:py-[80px] flex flex-col md:flex-row gap-4 md:gap-[80px] w-[100%] max-w-[1440px] mx-auto">
            <div className="hidden md:flex flex-col gap-[32px] sticky top-[120px] self-start">
                <h1 className="text-[#0E0E0E] font-[700] text-[32px] leading-[48px]">Account Settings</h1>
                <div className="flex flex-col gap-[12px]">
                    {navigationItems.map((item) => (
                        <Link key={item.id} href={`#${item.id}`}>
                            <button className={`w-[200px] h-[48px] font-[700] py-[10px] px-[16px] rounded-[12px] flex items-center gap-[8px] text-[14px] leading-[20px] transition-all duration-300 ${activeSection === item.id
                                ? "bg-[#0E0E0E] text-[#ffffff]"
                                : "bg-[#f6f6f6] text-[#B7B7B7] hover:bg-[#e5e5e5]"
                                }`}>
                                <Svg icon={item.icon} stroke={activeSection === item.id ? "#ffffff" : "#b7b7b7"} />
                                {item.label}
                            </button>
                        </Link>
                    ))}
                </div>
            </div>
            <div className="w-full md:w-[480px] flex flex-col gap-[40px] rounded-[12px] overflow-y-auto scroll-smooth pt-[20px] md:pt-[80px]">
                {/* profile detail section */}
                <div id="profile-details" className="w-[100%] flex flex-col gap-[12px]">
                    <h1 className="text-[#0E0E0E] font-[700] text-[18px] leading-[32px]">Profile Details</h1>
                    <div className="flex items-center justify-start gap-[32px]">
                        {/* Profile Image or Initials */}
                        {isLoadingProfile ? (
                            <div className="w-[120px] h-[120px] rounded-full bg-[#f6f6f6] animate-pulse" />
                        ) : userProfile?.profileImage ? (
                            <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-[#f6f6f6]">
                                <Image
                                    src={userProfile.profileImage}
                                    alt="Profile"
                                    width={120}
                                    height={120}
                                    className="w-full h-full object-cover"
                                    unoptimized={userProfile.isGoogleUser}
                                />
                            </div>
                        ) : (
                            <div className="w-[120px] h-[120px] rounded-full bg-[#E84C88] flex items-center justify-center text-white font-bold text-[40px]">
                                {userProfile?.username?.substring(0, 2).toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-[24px]">
                    <div className="flex flex-col gap-[12px]">
                        <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Username</h1>
                        <input
                            className="outline-none bg-[#e5e5e5] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] text-[#6b7280] cursor-not-allowed"
                            value={isLoadingProfile ? "Loading..." : userProfile?.username || ""}
                            readOnly
                            disabled
                        />
                        <p className="text-[#B7B7B7] text-[11px]">Username cannot be changed</p>
                    </div>
                    <div className="flex flex-col gap-[12px] w-[100%]">
                        <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Email</h1>
                        <input
                            className="outline-none bg-[#e5e5e5] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] text-[#6b7280] cursor-not-allowed"
                            value={isLoadingProfile ? "Loading..." : userProfile?.email || ""}
                            readOnly
                            disabled
                        />
                        <p className="text-[#B7B7B7] text-[11px]">Email cannot be changed</p>
                    </div>
                </div>
                {/* security section - Only show for non-Google users */}
                {userProfile && !userProfile.isGoogleUser && (
                <div id="security" className="flex flex-col gap-[12px] w-[100%]">
                    <h1 className="text-[#0E0E0E] font-[700] text-[18px] leading-[32px]">Security</h1>
                    
                    {/* Message display */}
                    {profileMessage && (
                        <div className={`p-[16px] rounded-[12px] ${profileMessage.type === 'success' ? 'bg-[#7AE684]/20 text-[#2D6332]' : 'bg-[#E84C88]/20 text-[#0e0e0e]'}`}>
                            <p className="text-[14px] font-[600]">{profileMessage.text}</p>
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-[24px]">
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Current Password</h1>
                            <div className="relative">
                                <input
                                    className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] pr-[48px] rounded-[12px] font-[600] text-[14px] w-full"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-[12px] top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#e5e5e5] rounded-[6px] transition-all duration-200 group"
                                >
                                    <div className="relative w-4 h-4 overflow-hidden">
                                        <div className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${showCurrentPassword
                                            ? 'opacity-0 scale-50 rotate-45 translate-y-1'
                                            : 'opacity-100 scale-100 rotate-0 translate-y-0'
                                            }`}>
                                            <Svg
                                                icon="eyeOpen"
                                                w="16"
                                                h="16"
                                                stroke="#B7B7B7"
                                                className="group-hover:scale-110 transition-all duration-300"
                                            />
                                        </div>
                                        <div className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${showCurrentPassword
                                            ? 'opacity-100 scale-100 rotate-0 translate-y-0'
                                            : 'opacity-0 scale-50 -rotate-45 -translate-y-1'
                                            }`}>
                                            <Svg
                                                icon="eyeClosed"
                                                w="16"
                                                h="16"
                                                stroke="#B7B7B7"
                                                className="group-hover:scale-110 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">New Password</h1>
                            <div className="relative">
                                <input
                                    className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] pr-[48px] rounded-[12px] font-[600] text-[14px] w-full"
                                    type={showNewPassword ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-[12px] top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#e5e5e5] rounded-[6px] transition-all duration-200 group"
                                >
                                    <div className="relative w-4 h-4 overflow-hidden">
                                        <div className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${showNewPassword
                                            ? 'opacity-0 scale-50 rotate-45 translate-y-1'
                                            : 'opacity-100 scale-100 rotate-0 translate-y-0'
                                            }`}>
                                            <Svg
                                                icon="eyeOpen"
                                                w="16"
                                                h="16"
                                                stroke="#B7B7B7"
                                                className="group-hover:scale-110 transition-all duration-300"
                                            />
                                        </div>
                                        <div className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${showNewPassword
                                            ? 'opacity-100 scale-100 rotate-0 translate-y-0'
                                            : 'opacity-0 scale-50 -rotate-45 -translate-y-1'
                                            }`}>
                                            <Svg
                                                icon="eyeClosed"
                                                w="16"
                                                h="16"
                                                stroke="#B7B7B7"
                                                className="group-hover:scale-110 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Confirm New Password</h1>
                            <div className="relative">
                                <input
                                    className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] pr-[48px] rounded-[12px] font-[600] text-[14px] w-full"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-[12px] top-1/2 transform -translate-y-1/2 p-1 hover:bg-[#e5e5e5] rounded-[6px] transition-all duration-200 group"
                                >
                                    <div className="relative w-4 h-4 overflow-hidden">
                                        <div className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${showConfirmPassword
                                            ? 'opacity-0 scale-50 rotate-45 translate-y-1'
                                            : 'opacity-100 scale-100 rotate-0 translate-y-0'
                                            }`}>
                                            <Svg
                                                icon="eyeOpen"
                                                w="16"
                                                h="16"
                                                stroke="#B7B7B7"
                                                className="group-hover:scale-110 transition-all duration-300"
                                            />
                                        </div>
                                        <div className={`absolute inset-0 transition-all duration-400 ease-in-out transform ${showConfirmPassword
                                            ? 'opacity-100 scale-100 rotate-0 translate-y-0'
                                            : 'opacity-0 scale-50 -rotate-45 -translate-y-1'
                                            }`}>
                                            <Svg
                                                icon="eyeClosed"
                                                w="16"
                                                h="16"
                                                stroke="#B7B7B7"
                                                className="group-hover:scale-110 transition-all duration-300"
                                            />
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                        {/* Change Password Button */}
                        <button
                            onClick={handleChangePassword}
                            disabled={isChangingPassword}
                            className="w-full h-[48px] bg-[#E84C88] text-white font-[700] rounded-[12px] text-[14px] hover:bg-[#d43d75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isChangingPassword ? 'Changing Password...' : 'Change Password'}
                        </button>
                    </div>
                </div>
                )}
                
                {/* Team & Seats section - Only show if user has premium OR shared seat OR invitations */}
                {shouldShowTeamSeats ? (
                <div id="team-seats" className="flex flex-col gap-[24px] w-[100%]">
                    <h1 className="text-[#0E0E0E] font-[700] text-[18px] leading-[32px]">Team & Seats</h1>
                    
                    {/* Message display */}
                    {seatMessage && (
                        <div className={`p-[16px] rounded-[12px] ${seatMessage.type === 'success' ? 'bg-[#7AE684]/20 text-[#2D6332]' : 'bg-[#E84C88]/20 text-[#0e0e0e]'}`}>
                            <p className="text-[14px] font-[600]">{seatMessage.text}</p>
                        </div>
                    )}

                    {/* If user is using someone else's seat */}
                    {isAssignedSeat && seatStatus && (
                        <div className="p-[16px] bg-[#f6f6f6] rounded-[12px] border-2 border-[#E84C88]">
                            <div className="flex items-start gap-[12px] mb-[16px]">
                                <span className="text-[24px]">🎁</span>
                                <div className="flex-1">
                                    <h3 className="text-[#0e0e0e] font-[600] text-[14px] mb-[4px]">You're using a shared seat!</h3>
                                    <p className="text-[#b7b7b7] text-[12px]">You have premium access shared by another user. Thank you for being part of the team!</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleCancelSharedSeat()}
                                disabled={isLoadingSeats}
                                className="w-full h-[40px] bg-[#E84C88] text-white font-[600] rounded-[8px] text-[13px] hover:bg-[#d43d75] transition-colors disabled:opacity-50"
                            >
                                {isLoadingSeats ? 'Canceling...' : 'Leave Shared Seat'}
                            </button>
                        </div>
                    )}

                    {/* Free Plan Status - Only show if user has pending invitations but no premium */}
                    {!isAssignedSeat && seatStatus && seatStatus.planType === 'none' && receivedInvitations.length > 0 && (
                        <div className="p-[24px] bg-[#f6f6f6] rounded-[12px] border-2 border-[#b7b7b7]">
                            <div className="flex items-center gap-[16px] mb-[16px]">
                                <div className="w-[60px] h-[60px] rounded-full bg-[#E84C88]/20 flex items-center justify-center">
                                    <span className="text-[28px]">🆓</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[#0e0e0e] font-[700] text-[18px] mb-[4px]">Free Plan</h3>
                                    <p className="text-[#b7b7b7] text-[14px]">You're currently on the free plan</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-[12px] mb-[16px]">
                                <div className="p-[12px] bg-white rounded-[8px]">
                                    <p className="text-[#b7b7b7] text-[11px] mb-[4px]">Plan Type</p>
                                    <p className="text-[#0e0e0e] font-[600] text-[14px]">Free</p>
                                </div>
                                <div className="p-[12px] bg-white rounded-[8px]">
                                    <p className="text-[#b7b7b7] text-[11px] mb-[4px]">Seats</p>
                                    <p className="text-[#0e0e0e] font-[600] text-[14px]">0</p>
                                </div>
                            </div>
                            <p className="text-[#b7b7b7] text-[12px] mb-[12px]">
                                Upgrade to premium to get multiple seats and invite team members to share your subscription!
                            </p>
                            <Link href="/pricing">
                                <button className="w-full h-[48px] bg-[#E84C88] text-white font-[700] rounded-[12px] text-[14px] hover:bg-[#d43d75] transition-colors">
                                    Upgrade to Premium
                                </button>
                            </Link>
                        </div>
                    )}

                    {/* Premium Plan Status (for subscription owners) - Show for ANY premium plan */}
                    {seatStatus && !isAssignedSeat && seatStatus.planType !== 'none' && (
                        <div className="flex flex-col gap-[12px]">
                            <div className="p-[16px] bg-gradient-to-r from-[#E84C88]/10 to-[#7AE684]/10 rounded-[12px] border-2 border-[#E84C88]">
                                <div className="flex items-center gap-[12px] mb-[12px]">
                                    <div className="w-[40px] h-[40px] rounded-full bg-[#E84C88] flex items-center justify-center">
                                        <span className="text-[20px]">⭐</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-[#0e0e0e] font-[700] text-[16px]">Premium Plan</h3>
                                        <p className="text-[#b7b7b7] text-[12px]">
                                            {seatStatus.planType === 'yearly' ? 'Yearly Subscription' : 'Lifetime Access'}
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCancelSubscription}
                                        disabled={isLoadingSeats}
                                        className="px-[16px] h-[36px] bg-[#E84C88] text-white font-[600] rounded-[8px] text-[12px] hover:bg-[#d43d75] transition-colors disabled:opacity-50"
                                    >
                                        Cancel Plan
                                    </button>
                                </div>
                            </div>
                            
                            {/* Only show seat management if user has multiple seats */}
                            {seatStatus.totalSeats > 1 && (
                                <>
                                    <h2 className="text-[#0E0E0E] font-[600] text-[16px] mt-[8px]">Your Seats</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-[12px]">
                                        <div className="p-[16px] bg-[#f6f6f6] rounded-[12px]">
                                            <p className="text-[#b7b7b7] text-[12px] mb-[4px]">Total</p>
                                            <p className="text-[#0e0e0e] font-[700] text-[24px]">{seatStatus.totalSeats}</p>
                                        </div>
                                        <div className="p-[16px] bg-[#7AE684]/20 rounded-[12px]">
                                            <p className="text-[#2D6332] text-[12px] mb-[4px]">Used</p>
                                            <p className="text-[#2D6332] font-[700] text-[24px]">{seatStatus.usedSeats}</p>
                                        </div>
                                        <div className="p-[16px] bg-[#F59E0B]/20 rounded-[12px]">
                                            <p className="text-[#92400E] text-[12px] mb-[4px]">Pending</p>
                                            <p className="text-[#92400E] font-[700] text-[24px]">{seatStatus.pendingInvitations}</p>
                                        </div>
                                        <div className="p-[16px] bg-[#E84C88]/20 rounded-[12px]">
                                            <p className="text-[#0e0e0e] text-[12px] mb-[4px]">Available</p>
                                            <p className="text-[#0e0e0e] font-[700] text-[24px]">{seatStatus.availableSeats}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Invite Team Member - Show for all premium users */}
                    {seatStatus && !isAssignedSeat && seatStatus.planType !== 'none' && (
                        <div className="flex flex-col gap-[12px]">
                            <h2 className="text-[#0E0E0E] font-[600] text-[16px]">Invite Team Member</h2>
                            
                            {/* Show input for multi-seat users with available seats */}
                            {seatStatus.totalSeats > 1 && seatStatus.availableSeats > 0 ? (
                                <>
                                    <div className="flex flex-col md:flex-row gap-[12px]">
                                        <input
                                            type="email"
                                            placeholder="teammate@example.com"
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="flex-1 outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                            disabled={isLoadingSeats}
                                        />
                                        <button
                                            onClick={handleSendInvitation}
                                            disabled={isLoadingSeats || !inviteEmail.trim()}
                                            className="px-[24px] h-[48px] bg-[#E84C88] text-white font-[700] rounded-[12px] text-[14px] hover:bg-[#d43d75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoadingSeats ? 'Sending...' : 'Send Invite'}
                                        </button>
                                    </div>
                                    <p className="text-[#b7b7b7] text-[12px]">
                                        {seatStatus.availableSeats} {seatStatus.availableSeats === 1 ? 'seat' : 'seats'} available to invite team members
                                    </p>
                                </>
                            ) : seatStatus.totalSeats > 1 && seatStatus.availableSeats === 0 ? (
                                /* No available seats - all seats are used/pending */
                                <div className="p-[20px] bg-[#FEF3C7] rounded-[12px] border border-[#F59E0B]">
                                    <div className="flex items-start gap-[12px]">
                                        <span className="text-[20px]">⚠️</span>
                                        <div className="flex-1">
                                            <p className="text-[#92400E] text-[14px] font-[600] mb-[4px]">
                                                All Seats Occupied
                                            </p>
                                            <p className="text-[#92400E] text-[12px]">
                                                You have {seatStatus.totalSeats} seats: {seatStatus.usedSeats} in use and {seatStatus.pendingInvitations} pending. 
                                                Cancel pending invitations or remove team members to free up seats, or upgrade your plan to add more seats.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Single seat - show upgrade prompt with disabled input */
                                <div className="flex flex-col gap-[12px]">
                                    <div className="flex flex-col md:flex-row gap-[12px]">
                                        <input
                                            type="email"
                                            placeholder="Upgrade to multi-seat plan to invite team members"
                                            className="flex-1 outline-none bg-[#e5e5e5] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#9ca3af] cursor-not-allowed"
                                            disabled
                                        />
                                        <Link href="/pricing">
                                            <button className="px-[24px] h-[48px] bg-[#E84C88] text-white font-[700] rounded-[12px] text-[14px] hover:bg-[#d43d75] transition-colors whitespace-nowrap">
                                                Upgrade Plan
                                            </button>
                                        </Link>
                                    </div>
                                    <div className="p-[16px] bg-[#f0fdf4] rounded-[12px] border border-[#7AE684]">
                                        <div className="flex items-start gap-[12px]">
                                            <span className="text-[20px]">💡</span>
                                            <div className="flex-1">
                                                <p className="text-[#166534] text-[13px] font-[600] mb-[4px]">
                                                    Want to share your premium access?
                                                </p>
                                                <p className="text-[#166534] text-[12px]">
                                                    Upgrade to a multi-seat plan to invite team members and share your premium benefits. Plans start with 2 seats and go up to 10+ seats.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Received Invitations */}
                    {receivedInvitations.length > 0 && (
                        <div className="flex flex-col gap-[12px]">
                            <h2 className="text-[#0E0E0E] font-[600] text-[16px]">Pending Invitations</h2>
                            {receivedInvitations
                                .filter(inv => inv.status === 'pending')
                                .map((invitation) => (
                                    <div key={invitation._id} className="p-[16px] bg-[#f6f6f6] rounded-[12px] flex flex-col gap-[12px]">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-[#0e0e0e] font-[600] text-[14px]">
                                                    From: {invitation.senderId?.username || invitation.senderName}
                                                </p>
                                                <p className="text-[#b7b7b7] text-[12px]">{invitation.senderEmail}</p>
                                                <p className="text-[#b7b7b7] text-[12px] mt-[4px]">
                                                    Plan: <span className="font-[600] text-[#0e0e0e]">{invitation.planType === 'yearly' ? 'Yearly Premium' : 'Lifetime Premium'}</span>
                                                </p>
                                                <p className="text-[#F59E0B] text-[11px] mt-[4px]">
                                                    Expires: {new Date(invitation.expiryDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-[8px]">
                                            <button
                                                onClick={() => handleAcceptInvitation(invitation._id)}
                                                disabled={isLoadingSeats}
                                                className="flex-1 h-[40px] bg-[#7AE684] text-[#2D6332] font-[700] rounded-[8px] text-[13px] hover:bg-[#6bd674] transition-colors disabled:opacity-50"
                                            >
                                                ✓ Accept
                                            </button>
                                            <button
                                                onClick={() => handleRejectInvitation(invitation._id)}
                                                disabled={isLoadingSeats}
                                                className="flex-1 h-[40px] bg-[#E84C88] text-white font-[700] rounded-[8px] text-[13px] hover:bg-[#d43d75] transition-colors disabled:opacity-50"
                                            >
                                                ✗ Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}

                    {/* Sent Invitations - Always show for premium users */}
                    {seatStatus && !isAssignedSeat && seatStatus.planType !== 'none' && (
                        <div className="flex flex-col gap-[12px]">
                            <h2 className="text-[#0E0E0E] font-[600] text-[16px]">Sent Invitations</h2>
                            {sentInvitations.length > 0 ? (
                                sentInvitations.map((invitation) => (
                                <div key={invitation._id} className="p-[16px] bg-[#f6f6f6] rounded-[12px] flex items-center justify-between">
                                    <div className="flex-1">
                                        <p className="text-[#0e0e0e] font-[600] text-[14px]">{invitation.receiverEmail}</p>
                                        <p className="text-[#b7b7b7] text-[12px] mt-[2px]">
                                            Status: <span className={`font-[600] ${
                                                invitation.status === 'accepted' ? 'text-[#7AE684]' :
                                                invitation.status === 'pending' ? 'text-[#F59E0B]' :
                                                invitation.status === 'rejected' ? 'text-[#E84C88]' :
                                                'text-[#b7b7b7]'
                                            }`}>
                                                {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                                            </span>
                                        </p>
                                        <p className="text-[#b7b7b7] text-[11px] mt-[2px]">
                                            Sent: {new Date(invitation.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {invitation.status === 'pending' && (
                                        <button
                                            onClick={() => handleCancelInvitation(invitation._id)}
                                            disabled={isLoadingSeats}
                                            className="px-[16px] h-[36px] bg-[#E84C88] text-white font-[600] rounded-[8px] text-[12px] hover:bg-[#d43d75] transition-colors disabled:opacity-50"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    {invitation.status === 'accepted' && invitation.receiverId && (
                                        <button
                                            onClick={() => handleCancelAcceptedInvitation(invitation.receiverId, invitation.receiverEmail)}
                                            disabled={isLoadingSeats}
                                            className="px-[16px] h-[36px] bg-[#E84C88] text-white font-[600] rounded-[8px] text-[12px] hover:bg-[#d43d75] transition-colors disabled:opacity-50"
                                        >
                                            Remove Seat
                                        </button>
                                    )}
                                    {(invitation.status === 'cancelled' || invitation.status === 'rejected') && (
                                        <button
                                            onClick={() => handleReinvite(invitation.receiverEmail)}
                                            disabled={isLoadingSeats || (seatStatus && seatStatus.availableSeats === 0)}
                                            className="px-[16px] h-[36px] bg-[#7AE684] text-[#166534] font-[600] rounded-[8px] text-[12px] hover:bg-[#6bd674] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title={seatStatus && seatStatus.availableSeats === 0 ? 'No available seats' : 'Send new invitation'}
                                        >
                                            {isLoadingSeats ? 'Sending...' : '↻ Renew'}
                                        </button>
                                    )}
                            </div>
                                ))
                            ) : (
                                <div className="p-[24px] bg-[#f6f6f6] rounded-[12px] text-center">
                                    <p className="text-[#b7b7b7] text-[14px]">
                                        No invitations sent yet.
                                        {seatStatus.totalSeats > 1 && seatStatus.availableSeats > 0 
                                            ? " Invite team members above to share your premium access!" 
                                            : " Upgrade to a multi-seat plan to invite team members."}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Team Members - Always show for premium users with multiple seats */}
                    {seatStatus && !isAssignedSeat && seatStatus.planType !== 'none' && seatStatus.totalSeats > 1 && (
                        <div className="flex flex-col gap-[12px]">
                            <h2 className="text-[#0E0E0E] font-[600] text-[16px]">Active Team Members ({teamMembers.length})</h2>
                            {teamMembers.length > 0 ? (
                                teamMembers.map((member) => (
                                <div key={member._id} className="p-[16px] bg-[#f6f6f6] rounded-[12px] flex items-center justify-between">
                                    <div className="flex items-center gap-[12px] flex-1">
                                        {member.profileImage ? (
                                            <img
                                                src={member.profileImage}
                                                alt={member.username}
                                                className="w-[40px] h-[40px] rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-[40px] h-[40px] rounded-full bg-[#E84C88] flex items-center justify-center text-white font-bold text-[14px]">
                                                {member.username?.substring(0, 2).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <p className="text-[#0e0e0e] font-[600] text-[14px]">{member.username}</p>
                                            <p className="text-[#b7b7b7] text-[12px]">{member.email}</p>
                                            {member.subscription?.startDate && (
                                                <p className="text-[#b7b7b7] text-[11px] mt-[2px]">
                                                    Since: {new Date(member.subscription.startDate).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveTeamMember(member._id, member.username)}
                                        disabled={isLoadingSeats}
                                        className="px-[16px] h-[36px] bg-[#E84C88] text-white font-[600] rounded-[8px] text-[12px] hover:bg-[#d43d75] transition-colors disabled:opacity-50"
                                    >
                                        Remove
                                    </button>
                                </div>
                                ))
                            ) : (
                                <div className="p-[24px] bg-[#f6f6f6] rounded-[12px] text-center">
                                    <p className="text-[#b7b7b7] text-[14px]">
                                        No active team members yet. Invite team members to share your premium seats!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                </div>
                ) : null}

                {/* social profile section */}
                <div id="social-profile" className="flex flex-col gap-[12px] w-[100%]">
                    <h1 className="text-[#0E0E0E] font-[700] text-[18px] leading-[32px]">Social Profile</h1>
                    
                    {/* Message display */}
                    {profileMessage && (
                        <div className={`p-[16px] rounded-[12px] ${profileMessage.type === 'success' ? 'bg-[#7AE684]/20 text-[#2D6332]' : 'bg-[#E84C88]/20 text-[#0e0e0e]'}`}>
                            <p className="text-[14px] font-[600]">{profileMessage.text}</p>
                        </div>
                    )}
                    <div className="flex flex-col md:flex-row gap-[16px]">
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Website</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                placeholder="https://yoursite.com"
                                value={formData.website}
                                onChange={(e) => handleInputChange('website', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Dribbble</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                placeholder="x.com/username"
                                value={formData.dribbble}
                                onChange={(e) => handleInputChange('dribbble', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-[16px]">
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Behance</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                placeholder="behance.com/username"
                                value={formData.behance}
                                onChange={(e) => handleInputChange('behance', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">LinkedIn</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                placeholder="linkedin.com/username"
                                value={formData.linkedin}
                                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row gap-[16px]">
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Instagram</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                placeholder="Instagram.com/username"
                                value={formData.instagram}
                                onChange={(e) => handleInputChange('instagram', e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col gap-[12px] w-[100%]">
                            <h1 className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Facebook</h1>
                            <input
                                className="outline-none bg-[#f6f6f6] h-[48px] py-[10px] px-[16px] rounded-[12px] font-[600] text-[14px] placeholder:text-[#B7B7B7]"
                                placeholder="facebook.com/username"
                                value={formData.facebook}
                                onChange={(e) => handleInputChange('facebook', e.target.value)}
                            />
                        </div>
                    </div>
                    {/* Save Social Profiles Button */}
                    <button
                        onClick={handleUpdateSocial}
                        disabled={isUpdatingSocial}
                        className="w-full h-[48px] bg-[#E84C88] text-white font-[700] rounded-[12px] text-[14px] hover:bg-[#d43d75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUpdatingSocial ? 'Saving...' : 'Save Social Profiles'}
                    </button>
                </div>
                {/* notifications section */}
                <div id="notifications" className="flex flex-col gap-[12px] w-[100%]">
                    <h1 className="text-[#0E0E0E] font-[700] text-[18px] leading-[32px]">Notification</h1>
                    <div className="flex justify-between items-center w-[100%]">
                        <p className="text-[#0E0E0E] font-[600] text-[14px] leading-[20px]">Turn on your notification</p>
                        <svg className="cursor-pointer transition-all duration-300 ease-in-out" onClick={() => setIsNotificationOn(!isNotificationOn)} width="64" height="28" viewBox="0 0 64 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="64" height="28" rx="14" fill={isNotificationOn ? "#34C759" : "#E5E5E5"} className="transition-all duration-300 ease-in-out" />
                            <rect x={isNotificationOn ? "23" : "2"} y="2" width="39" height="24" rx="12" fill="white" className="transition-all duration-300 ease-in-out" />
                        </svg>
                    </div>
                </div>
                {/* delete account section */}
                <div id="delete-account" className="w-[100%] flex flex-col gap-[12px]">
                    <h1 className="text-[#0E0E0E] font-[700] text-[18px] leading-[32px]">Delete Account</h1>
                    <button className="w-[100%] h-[48px] bg-[#0e0e0e] text-[#f6f6f6] font-[700] rounded-[12px] text-[14px] leading-[20px]">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
        <Footer />
    </>;
}

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <Profile />
        </ProtectedRoute>
    );
}