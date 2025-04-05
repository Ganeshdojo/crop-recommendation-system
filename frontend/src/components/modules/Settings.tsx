import { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";

export const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  
  // Profile Information State
  const [firstName, setFirstName] = useState("John");
  const [lastName, setLastName] = useState("Farmer");
  const [email, setEmail] = useState("john.farmer@example.com");
  const [phoneNumber, setPhoneNumber] = useState("+1 (555) 123-4567");
  const [bio, setBio] = useState("Third-generation farmer specializing in sustainable wheat and corn production with 15 years of experience.");
  
  // Security State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const handleProfileSave = () => {
    alert("Profile changes saved");
  };
  
  const handlePasswordUpdate = () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords don't match");
      return;
    }
    
    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    
    alert("Password updated successfully");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };
  
  const handleAccountDelete = () => {
    const confirmation = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (confirmation) {
      alert("Account deletion request submitted");
    }
  };
  
  const handleExportData = () => {
    alert("Data export initiated. You will receive an email with your data shortly.");
  };
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-gray-50 dark:bg-[#040404]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your profile information and preferences</p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <Card className="mb-6">
            <div className="p-6 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500 mb-4">
                <img 
                  src="https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=3131&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold">{firstName} {lastName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">{email}</p>
              
              <button className="mt-4 text-sm text-green-600 dark:text-green-500 flex items-center">
                <svg className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Change photo
              </button>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700">
              <button 
                className={`flex items-center w-full px-6 py-3 text-left ${activeTab === 'profile' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Profile Information
              </button>
              
              <button 
                className={`flex items-center w-full px-6 py-3 text-left ${activeTab === 'security' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => setActiveTab('security')}
              >
                <svg className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Security
              </button>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <button className="flex items-center text-red-600 dark:text-red-400">
                <svg className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm9 3a1 1 0 11-2 0 1 1 0 012 0zm-.5 5.984v-3.97a.5.5 0 00-1 0v3.97a.5.5 0 001 0z" clipRule="evenodd" />
                </svg>
                Logout
              </button>
            </div>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Information Section */}
          {activeTab === 'profile' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#161616]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#161616]"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#161616]"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#161616]"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#161616]"
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleProfileSave}>
                  Save Changes
                </Button>
              </div>
            </Card>
          )}
          
          {/* Security Section */}
          {activeTab === 'security' && (
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#161616]"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#161616]"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#161616]"
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button onClick={handlePasswordUpdate}>
                    Update Password
                  </Button>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-semibold mb-6">Account</h2>
                
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg p-4 mb-6">
                  <h3 className="text-red-600 dark:text-red-400 font-medium mb-2">Delete Account</h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button 
                    variant="outline" 
                    className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={handleAccountDelete}
                  >
                    Delete My Account
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}; 