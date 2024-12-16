import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useUser, UserButton } from '@clerk/clerk-react'
import axios from 'axios'
import { useSession } from '@clerk/clerk-react'

// Dashboard Navbar Component
const DashboardNavbar = () => {

  const { session } = useSession();

  const fetchUserId = async () => {
    if (!session) {
      console.log("No Session is there")
    }
    const id = session.user.id;
    const response = await axios.post('https://passwordmanager-mtph.onrender.com/api/clerkUsers', {
      userId: id
    });
  }

  useEffect(() => {
    fetchUserId();
  }, []);

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
const DashboardStats = ({ totalPasswords }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="text-sm font-medium text-gray-500">Total Passwords</div>
        <div className="mt-2 text-3xl font-bold text-gray-900">{totalPasswords}</div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="text-sm font-medium text-gray-500">Weak Passwords</div>
        <div className="mt-2 text-3xl font-bold text-red-600">0</div>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="text-sm font-medium text-gray-500">Strong Passwords</div>
        <div className="mt-2 text-3xl font-bold text-green-600">{totalPasswords}</div>
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

const PasswordManager = () => {
  const [passwords, setPasswords] = useState([])
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    siteLink: ''
  })
  const [showPassword, setShowPassword] = useState({})
  const [editingId, setEditingId] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingId !== null) {
      setPasswords(passwords.map(pass =>
        pass.id === editingId ? { ...formData, id: editingId } : pass
      ))
      setEditingId(null)
    } else {
      setPasswords([...passwords, { ...formData, id: Date.now() }])
    }
    setFormData({ email: '', username: '', password: '', siteLink: '' })
  }

  const handleEdit = (password) => {
    setFormData(password)
    setEditingId(password.id)
  }

  const handleDelete = (id) => {
    setPasswords(passwords.filter(pass => pass.id !== id))
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`
    } catch {
      return 'https://via.placeholder.com/32'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardNavbar />

      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardStats totalPasswords={passwords.length} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
          >
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
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter password"
                />
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
                  {passwords.map((password) => (
                    <tr key={password.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={getFaviconUrl(password.siteLink)}
                            alt=""
                          />
                          <a
                            href={password.siteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 text-sm text-indigo-600 hover:text-indigo-900"
                          >
                            {new URL(password.siteLink).hostname}
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {password.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {password.username || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {showPassword[password.id] ? password.password : '••••••••'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowPassword({
                            ...showPassword,
                            [password.id]: !showPassword[password.id]
                          })}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {showPassword[password.id] ? 'Hide' : 'View'}
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
                          onClick={() => handleDelete(password.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </motion.button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {passwords.length === 0 && (
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
    </div>
  )
}

export default PasswordManager 