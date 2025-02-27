import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useUser, UserButton } from '@clerk/clerk-react'
import PasswordGenerator from './PasswordGenerator'
import { checkPasswordStrength } from '../utils/passwordStrength'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DeleteConfirmationModal from './DeleteConfirmationModal'

// Dashboard Navbar Component
const DashboardNavbar = () => {

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                SecurePass
              </span>
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Welcome back, <span className="font-medium text-gray-900">{useUser().user?.firstName || 'User'}</span>
            </div>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox: "w-10 h-10"
                }
              }}
              afterSignOutUrl="/"
            />
          </div>
        </div>
      </div>
    </nav>
  )
}

// Dashboard Stats Component
const DashboardStats = ({ passwords }) => {
  const passwordStrengths = passwords.reduce((acc, curr) => {
    const strength = checkPasswordStrength(curr.password)
    acc[strength] = (acc[strength] || 0) + 1
    return acc
  }, { weak: 0, medium: 0, strong: 0 })

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="text-sm font-medium text-gray-500">Total Passwords</div>
        <div className="mt-2 text-3xl font-bold text-gray-900">{passwords.length}</div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="text-sm font-medium text-gray-500">Weak Passwords</div>
        <div className="mt-2 text-3xl font-bold text-red-600">{passwordStrengths.weak}</div>
        {passwordStrengths.weak > 0 && (
          <div className="mt-1 text-sm text-red-500">
            Consider updating these passwords
          </div>
        )}
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="text-sm font-medium text-gray-500">Strong Passwords</div>
        <div className="mt-2 text-3xl font-bold text-green-600">{passwordStrengths.strong}</div>
        {passwordStrengths.medium > 0 && (
          <div className="mt-1 text-sm text-yellow-500">
            {passwordStrengths.medium} passwords could be stronger
          </div>
        )}
      </div>
    </div>
  )
}

// Dashboard Footer Component
const DashboardFooter = () => {
  return (
    <footer className="bg-white border-t mt-8">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            © 2024 SecurePass. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Update the EnhancedFilterSection component
const EnhancedFilterSection = ({ filters, setFilters, filterType, setFilterType, strengthFilter, setStrengthFilter }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      {/* Search Filters */}
      <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4 mb-4">
        <div className="flex-shrink-0 w-48">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter By
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="site">Website</option>
            <option value="email">Email</option>
            <option value="username">Username</option>
          </select>
        </div>
        
        <div className="flex-grow">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </label>
          <div className="relative">
            <input
              type="text"
              value={filters[filterType]}
              onChange={(e) => setFilters({ ...filters, [filterType]: e.target.value })}
              placeholder={`Search by ${filterType}...`}
              className="w-full px-4 py-2 pr-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {filters[filterType] && (
              <button
                onClick={() => setFilters({ ...filters, [filterType]: '' })}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Password Strength Filter and Clear All in one row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-t pt-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Password Strength:
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="strength"
                value="all"
                checked={strengthFilter === 'all'}
                onChange={(e) => setStrengthFilter(e.target.value)}
                className="form-radio h-4 w-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">All</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="strength"
                value="strong"
                checked={strengthFilter === 'strong'}
                onChange={(e) => setStrengthFilter(e.target.value)}
                className="form-radio h-4 w-4 text-green-600 focus:ring-green-500"
              />
              <span className="ml-2 text-sm text-gray-700">Strong</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="strength"
                value="medium"
                checked={strengthFilter === 'medium'}
                onChange={(e) => setStrengthFilter(e.target.value)}
                className="form-radio h-4 w-4 text-yellow-600 focus:ring-yellow-500"
              />
              <span className="ml-2 text-sm text-gray-700">Medium</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="strength"
                value="weak"
                checked={strengthFilter === 'weak'}
                onChange={(e) => setStrengthFilter(e.target.value)}
                className="form-radio h-4 w-4 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-sm text-gray-700">Weak</span>
            </label>
          </div>
        </div>

        {/* Clear All Button */}
        {(Object.values(filters).some(value => value) || strengthFilter !== 'all') && (
          <button
            onClick={() => {
              setFilters({ site: '', email: '', username: '' })
              setFilterType('site')
              setStrengthFilter('all')
            }}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 mt-4 md:mt-0"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear All Filters
          </button>
        )}
      </div>
    </div>
  )
}

const PasswordManager = () => {
  const { user } = useUser();
  
  // Group all state declarations together at the top
  const [passwords, setPasswords] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    siteLink: ''
  });
  const [filters, setFilters] = useState({
    site: '',
    email: '',
    username: ''
  });
  const [filterType, setFilterType] = useState('site');
  const [strengthFilter, setStrengthFilter] = useState('all');
  const [showPassword, setShowPassword] = useState({
    current: false,
    saved: {}
  });
  const [editingId, setEditingId] = useState(null);
  const [isPasswordGeneratorOpen, setIsPasswordGeneratorOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    passwordId: null
  });

  // Now define filteredPasswords after all state declarations
  const filteredPasswords = useMemo(() => {
    return passwords.filter(password => {
      const siteMatch = password.siteUrl.toLowerCase().includes(filters.site.toLowerCase());
      const emailMatch = password.email.toLowerCase().includes(filters.email.toLowerCase());
      const usernameMatch = password.Username?.toLowerCase().includes(filters.username.toLowerCase()) || false;
      
      // Add strength filtering
      const strength = checkPasswordStrength(password.password);
      const strengthMatch = strengthFilter === 'all' || strength === strengthFilter;

      return siteMatch && emailMatch && usernameMatch && strengthMatch;
    });
  }, [passwords, filters, strengthFilter]);

  const handleEdit = (password) => {
    setFormData({
      email: password.email,
      username: password.Username,
      password: password.password,
      siteLink: password.siteUrl
    });
    setEditingId(password._id); // Use _id from MongoDB
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`https://passwordmanager-mtph.onrender.com/api/passwords/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          clerkId: user.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete password');
      }

      const data = await response.json();
      if (data.success) {
        fetchPasswords(); // Refresh the passwords list
        toast.success('Password deleted successfully', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
        });
      }
    } catch (error) {
      console.error('Error deleting password:', error);
      toast.error(error.message || 'Failed to delete password', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
      });
    } finally {
      setDeleteModal({ isOpen: false, passwordId: null });
    }
  }

  const confirmDelete = (passwordId) => {
    setDeleteModal({ isOpen: true, passwordId });
  };

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Password Copied successfully', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
      });
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  // Fetch passwords when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchPasswords();
    }
  }, [user]);

  const fetchPasswords = async () => {
    try {
      const response = await fetch(`https://passwordmanager-mtph.onrender.com/api/passwords/${user.id}`, {
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setPasswords(data.data);
      }
    } catch (error) {
      console.error('Error fetching passwords:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId !== null) {
        // Update existing password
        const response = await fetch(`https://passwordmanager-mtph.onrender.com/api/passwords/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: user.id,
            email: formData.email,
            Username: formData.username,
            password: formData.password,
            siteUrl: formData.siteLink
          }),
        });
        const data = await response.json();
        if (data.success) {
          fetchPasswords(); // Refresh the passwords list
          toast.success('Password Updated successfully', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            draggable: true,
          });
          setEditingId(null);
        }
      } else {
        // Create new password
        const response = await fetch('https://passwordmanager-mtph.onrender.com/api/passwords', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            clerkId: user.id,
            email: formData.email,
            Username: formData.username,
            password: formData.password,
            siteUrl: formData.siteLink
          }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save password');
        }

        const data = await response.json();
        if (data.success) {
          fetchPasswords(); // Refresh the passwords list
          setFormData({ email: '', username: '', password: '', siteLink: '' });
          toast.success('Password Added successfully', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            draggable: true,
          });
        }
      }
      // Reset form
      setFormData({ email: '', username: '', password: '', siteLink: '' });
    } catch (error) {
      console.error('Error saving password:', error);
      alert(error.message || 'Failed to save password');
    }
  };

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    } catch {
      return 'https://via.placeholder.com/32'
    }
  }

  const getPasswordStrengthBadge = (password) => {
    const strength = checkPasswordStrength(password);
    const badges = {
      weak: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      strong: 'bg-green-100 text-green-800'
    };
    const labels = {
      weak: 'Weak',
      medium: 'Medium',
      strong: 'Strong'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[strength]}`}>
        {labels[strength]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNavbar />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardStats passwords={filteredPasswords} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
          >
            {/* Add Generate Password Button */}
            <div className="mb-8">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsPasswordGeneratorOpen(true)}
                className="inline-flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Generate Strong Password
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter username (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                  >
                    {showPassword.current ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.siteLink}
                  onChange={(e) => setFormData({ ...formData, siteLink: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter site URL"
                />
              </div>

              <div className="md:col-span-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-xl"
                >
                  {editingId !== null ? 'Update Password' : 'Add Password'}
                </motion.button>
              </div>
            </form>

            {/* Add Enhanced Filter Section above the table */}
            <EnhancedFilterSection 
              filters={filters}
              setFilters={setFilters}
              filterType={filterType}
              setFilterType={setFilterType}
              strengthFilter={strengthFilter}
              setStrengthFilter={setStrengthFilter}
            />

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Password</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPasswords.map((password) => (
                    <tr key={password._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={getFaviconUrl(password.siteUrl)}
                            alt=""
                          />
                          <a
                            href={password.siteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            {new URL(password.siteUrl).hostname}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {password.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {password.Username || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span>{showPassword[password._id] ? password.password : '••••••••'}</span>
                          {getPasswordStrengthBadge(password.password)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowPassword({
                            ...showPassword,
                            [password._id]: !showPassword[password._id]
                          })}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {showPassword[password._id] ? 'Hide' : 'View'}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleCopy(password.password)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Copy
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(password)}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => confirmDelete(password._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPasswords.length === 0 && (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No passwords</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by adding your first password.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      <DashboardFooter />

      <PasswordGenerator
        isOpen={isPasswordGeneratorOpen}
        onClose={() => setIsPasswordGeneratorOpen(false)}
        onSelectPassword={(password) => setFormData({ ...formData, password })}
      />

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, passwordId: null })}
        onConfirm={() => handleDelete(deleteModal.passwordId)}
      />

      <ToastContainer />
    </div>
  )
}

export default PasswordManager 