import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  // Password complexity states
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { signup, loading, error: authError, setError } = useAuth();
  const navigate = useNavigate();

  // Clear residual authentication errors on screen mount
  useEffect(() => {
    if (setError) setError(null);
  }, [setError]);

  // Update password complexity checklists on change
  useEffect(() => {
    setPasswordCriteria({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[\W_]/.test(password),
    });
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!name || !email || !password) {
      setLocalError('All fields are required.');
      return;
    }

    // Verify email format client-side
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    // Verify password criteria
    const allCriteriaMet = Object.values(passwordCriteria).every(Boolean);
    if (!allCriteriaMet) {
      setLocalError('Please ensure your password meets all complexity rules.');
      return;
    }

    const result = await signup(name, email, password);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-2xl shadow-md border border-stone-200">
        <div className="text-center">
          <Link to="/" className="text-3xl font-black tracking-widest text-stone-950 font-serif">
            AURA
          </Link>
          <h2 className="mt-4 text-2xl font-bold text-stone-900">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-stone-500">
            Join us to experience curated premium fashion.
          </p>
        </div>

        {(localError || authError) && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {localError || authError}
                </p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-stone-300 rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 sm:text-sm text-stone-900 bg-white"
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2.5 border border-stone-300 rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 sm:text-sm text-stone-900 bg-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onFocus={() => setIsPasswordFocused(true)}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-3 pr-10 py-2.5 border border-stone-300 rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-900 focus:border-stone-900 sm:text-sm text-stone-900 bg-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Dynamic complexity hints */}
              {isPasswordFocused && (
                <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-1">
                  <p className="font-semibold text-stone-700 mb-1">Password must contain:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={passwordCriteria.length ? "text-green-600" : "text-stone-400"}>
                        {passwordCriteria.length ? '✓' : '○'}
                      </span>
                      <span className={passwordCriteria.length ? "text-green-700" : "text-stone-500"}>Min 8 characters</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={passwordCriteria.uppercase ? "text-green-600" : "text-stone-400"}>
                        {passwordCriteria.uppercase ? '✓' : '○'}
                      </span>
                      <span className={passwordCriteria.uppercase ? "text-green-700" : "text-stone-500"}>1 Uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={passwordCriteria.number ? "text-green-600" : "text-stone-400"}>
                        {passwordCriteria.number ? '✓' : '○'}
                      </span>
                      <span className={passwordCriteria.number ? "text-green-700" : "text-stone-500"}>1 Number</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={passwordCriteria.special ? "text-green-600" : "text-stone-400"}>
                        {passwordCriteria.special ? '✓' : '○'}
                      </span>
                      <span className={passwordCriteria.special ? "text-green-700" : "text-stone-500"}>1 Special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              required
              className="h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300 rounded"
            />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-stone-600">
              I agree to the{' '}
              <a href="#" className="underline font-medium hover:text-stone-950">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="underline font-medium hover:text-stone-950">
                Privacy Policy
              </a>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-stone-950 bg-[#c5a880] hover:bg-[#b4976f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-stone-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-stone-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#c5a880] hover:text-[#b4976f] hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
