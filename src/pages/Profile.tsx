import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Save, Camera } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [profileData, setProfileData] = useState({
    bio: user?.profile?.bio || '',
    skills: user?.profile?.skills?.join(', ') || '',
    hourlyRate: user?.profile?.hourlyRate || 0,
    company: user?.profile?.company || '',
    location: user?.profile?.location || ''
  });
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateProfile({
      ...profileData,
      skills: profileData.skills.split(',').map(s => s.trim()).filter(s => s.length > 0)
    });

    setMessage('Profile updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-8">
          <div className="flex items-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-white" />
              </div>
              <button className="absolute bottom-0 right-0 bg-white border-2 border-gray-300 rounded-full p-2 hover:bg-gray-50">
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
            </div>
            <div className="ml-6">
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                user?.userType === 'client' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {user?.userType === 'client' ? 'Client' : 'Freelancer'}
              </span>
            </div>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-6">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                rows={4}
                value={profileData.bio}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Tell us about yourself, your experience, and what makes you unique..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user?.userType === 'freelancer' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skills (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={profileData.skills}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="React, JavaScript, UI/UX Design, etc."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={profileData.hourlyRate}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                </>
              )}

              {user?.userType === 'client' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={profileData.company}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Your company name"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div className="pt-6 border-t">
              <button type="submit" className="btn-primary flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>Save Profile</span>
              </button>
            </div>
          </form>

          {/* Profile Completion Tips */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              {user?.userType === 'freelancer' ? 'Tips to Stand Out' : 'Profile Tips'}
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              {user?.userType === 'freelancer' ? (
                <>
                  <li>• Add a detailed bio highlighting your expertise and experience</li>
                  <li>• List relevant skills that match the projects you want</li>
                  <li>• Set a competitive hourly rate based on your experience level</li>
                  <li>• Include your location to attract local clients</li>
                  <li>• Consider adding a portfolio showcase (coming soon)</li>
                </>
              ) : (
                <>
                  <li>• Write a clear bio about your business or project needs</li>
                  <li>• Add your company information to build trust</li>
                  <li>• Include your location if you prefer local freelancers</li>
                  <li>• Be specific about your project requirements when posting</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;