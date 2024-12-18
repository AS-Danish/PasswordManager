import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const PasswordGenerator = ({ isOpen, onClose, onSelectPassword }) => {
  const [options, setOptions] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
  })
  const [generatedPassword, setGeneratedPassword] = useState('')

  const generatePassword = () => {
    let charset = ''
    let password = ''
    
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
    const numberChars = '0123456789'
    const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
    const similarChars = 'il1Lo0O'

    if (options.uppercase) charset += uppercaseChars
    if (options.lowercase) charset += lowercaseChars
    if (options.numbers) charset += numberChars
    if (options.symbols) charset += symbolChars

    if (options.excludeSimilar) {
      charset = charset.split('')
        .filter(char => !similarChars.includes(char))
        .join('')
    }

    if (charset.length === 0) return ''

    // Ensure at least one character from each selected type
    if (options.uppercase) {
      password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length))
    }
    if (options.lowercase) {
      password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length))
    }
    if (options.numbers) {
      password += numberChars.charAt(Math.floor(Math.random() * numberChars.length))
    }
    if (options.symbols) {
      password += symbolChars.charAt(Math.floor(Math.random() * symbolChars.length))
    }

    // Fill the rest randomly
    for (let i = password.length; i < options.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    // Shuffle the password
    password = password.split('')
      .sort(() => Math.random() - 0.5)
      .join('')

    setGeneratedPassword(password)
  }

  const handleStrengthCheck = (password) => {
    let strength = 0
    if (password.length >= 12) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    return strength
  }

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0: return 'bg-red-500'
      case 1: return 'bg-orange-500'
      case 2: return 'bg-yellow-500'
      case 3: return 'bg-lime-500'
      case 4:
      case 5: return 'bg-green-500'
      default: return 'bg-gray-200'
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl p-6 m-4 max-w-md w-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Password Generator</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Generated Password Display */}
              <div className="relative">
                <input
                  type="text"
                  value={generatedPassword}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-50 rounded-lg border focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(generatedPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-indigo-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>

              {/* Password Strength Indicator */}
              {generatedPassword && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Password Strength</span>
                    <span>{['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'][handleStrengthCheck(generatedPassword)]}</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getStrengthColor(handleStrengthCheck(generatedPassword))} transition-all duration-300`}
                      style={{ width: `${(handleStrengthCheck(generatedPassword) + 1) * 20}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="space-y-4">
                {/* Password Length */}
                <div>
                  <label className="flex justify-between text-sm font-medium text-gray-700">
                    Password Length: {options.length}
                  </label>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={options.length}
                    onChange={(e) => setOptions({ ...options, length: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* Character Options */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.uppercase}
                      onChange={(e) => setOptions({ ...options, uppercase: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Include Uppercase Letters</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.lowercase}
                      onChange={(e) => setOptions({ ...options, lowercase: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Include Lowercase Letters</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.numbers}
                      onChange={(e) => setOptions({ ...options, numbers: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Include Numbers</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.symbols}
                      onChange={(e) => setOptions({ ...options, symbols: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Include Symbols</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.excludeSimilar}
                      onChange={(e) => setOptions({ ...options, excludeSimilar: e.target.checked })}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Exclude Similar Characters</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={generatePassword}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Generate Password
                </button>
                <button
                  onClick={() => {
                    if (generatedPassword) {
                      onSelectPassword(generatedPassword)
                      onClose()
                    }
                  }}
                  disabled={!generatedPassword}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Use Password
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default PasswordGenerator 