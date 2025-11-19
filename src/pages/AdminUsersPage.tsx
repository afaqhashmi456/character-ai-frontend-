import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { usersApi } from '@/features/users/utils/usersApi';
import { personalitiesApi } from '@/features/personalities/utils/personalitiesApi';
import type { User, PersonalityTrait } from '@/shared/types';

export const AdminUsersPage = () => {
  const { logout, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [personalities, setPersonalities] = useState<PersonalityTrait[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPersonalityForm, setShowPersonalityForm] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'MEMBER' as 'ADMIN' | 'MEMBER',
  });
  const [personalityForm, setPersonalityForm] = useState({
    trait: '',
    description: '',
    examples: [''],
  });

  // Load users on mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load personalities when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadPersonalities(selectedUser.id);
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalities = async (userId: string) => {
    try {
      const data = await personalitiesApi.getAll(userId);
      setPersonalities(data);
    } catch (err: any) {
      console.error('Failed to load personalities:', err);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await usersApi.create(userForm);
      setUserForm({ name: '', email: '', password: '', role: 'MEMBER' });
      setShowUserForm(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setLoading(true);
      await usersApi.delete(userId);
      if (selectedUser?.id === userId) {
        setSelectedUser(null);
        setPersonalities([]);
      }
      await loadUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePersonality = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError(null);
      await personalitiesApi.create(selectedUser.id, {
        trait: personalityForm.trait,
        description: personalityForm.description,
        examples: personalityForm.examples.filter(ex => ex.trim() !== ''),
      });
      setPersonalityForm({ trait: '', description: '', examples: [''] });
      setShowPersonalityForm(false);
      await loadPersonalities(selectedUser.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create personality');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePersonality = async (personalityId: string) => {
    if (!selectedUser || !confirm('Are you sure you want to delete this personality trait?')) return;

    try {
      setLoading(true);
      await personalitiesApi.delete(selectedUser.id, personalityId);
      await loadPersonalities(selectedUser.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete personality');
    } finally {
      setLoading(false);
    }
  };

  const addExampleField = () => {
    setPersonalityForm(prev => ({
      ...prev,
      examples: [...prev.examples, ''],
    }));
  };

  const updateExample = (index: number, value: string) => {
    setPersonalityForm(prev => ({
      ...prev,
      examples: prev.examples.map((ex, i) => i === index ? value : ex),
    }));
  };

  const removeExample = (index: number) => {
    setPersonalityForm(prev => ({
      ...prev,
      examples: prev.examples.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-gray-200/50 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">Manage team members and their funny personalities 🎭</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Team Members</span>
              </h2>
              <button
                onClick={() => setShowUserForm(!showUserForm)}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                {showUserForm ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Cancel</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add Member</span>
                  </>
                )}
              </button>
            </div>

            {/* Add User Form */}
            {showUserForm && (
              <form onSubmit={handleCreateUser} className="mb-6 p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl space-y-4 border border-indigo-100">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-400"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-400"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:border-gray-400"
                    placeholder="Min. 8 characters"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {loading ? 'Creating...' : 'Create Member'}
                </button>
              </form>
            )}

            {/* Users List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {loading && users.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
                  <p className="text-gray-500 mt-4">Loading...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-gray-500">No team members yet</p>
                </div>
              ) : (
                users.map((user) => (
                  <div
                    key={user.id}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedUser?.id === user.id
                        ? 'border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg'
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-md bg-white'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <span className="inline-block mt-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
                            {user.role}
                          </span>
                        </div>
                      </div>
                      {user.id !== currentUser?.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.id);
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Personalities Panel */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-gray-200/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{selectedUser ? `${selectedUser.name}'s Personalities` : 'Select a Member'}</span>
              </h2>
              {selectedUser && (
                <button
                  onClick={() => setShowPersonalityForm(!showPersonalityForm)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  {showPersonalityForm ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Trait</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {!selectedUser ? (
              <div className="text-center py-16">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                <p className="text-gray-500 text-lg">
                  Select a team member to manage their personality traits
                </p>
              </div>
            ) : (
              <>
                {/* Add Personality Form */}
                {showPersonalityForm && (
                  <form onSubmit={handleCreatePersonality} className="mb-6 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl space-y-4 border border-purple-100">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Trait Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Sarcastic Office Comedian"
                        value={personalityForm.trait}
                        onChange={(e) => setPersonalityForm({ ...personalityForm, trait: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="Describe this funny characteristic..."
                        value={personalityForm.description}
                        onChange={(e) => setPersonalityForm({ ...personalityForm, description: e.target.value })}
                        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Examples (optional)</label>
                      {personalityForm.examples.map((example, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Example response..."
                            value={example}
                            onChange={(e) => updateExample(index, e.target.value)}
                            className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:border-gray-400"
                          />
                          {personalityForm.examples.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeExample(index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addExampleField}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Add Example</span>
                      </button>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {loading ? 'Adding...' : 'Add Personality Trait'}
                    </button>
                  </form>
                )}

                {/* Personalities List */}
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {personalities.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-500">No personality traits yet</p>
                      <p className="text-sm text-gray-400 mt-2">Add some funny characteristics!</p>
                    </div>
                  ) : (
                    personalities.map((personality) => (
                      <div key={personality.id} className="p-5 border-2 border-gray-200 rounded-xl bg-white hover:border-purple-300 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-900 text-lg flex items-center space-x-2">
                            <span className="text-2xl">🎭</span>
                            <span>{personality.trait}</span>
                          </h3>
                          <button
                            onClick={() => handleDeletePersonality(personality.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed mb-3">{personality.description}</p>
                        {personality.examples && personality.examples.length > 0 && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
                            <p className="text-xs font-bold text-purple-700 mb-2 uppercase tracking-wide">Examples:</p>
                            <ul className="space-y-1.5">
                              {personality.examples.map((example, idx) => (
                                <li key={idx} className="text-sm text-gray-700 flex items-start space-x-2">
                                  <span className="text-purple-500 mt-0.5">•</span>
                                  <span className="flex-1 italic">"{example}"</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};