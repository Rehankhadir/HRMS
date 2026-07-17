import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
  Users,
  BarChart3,
  Loader2,
  Crown,
  Briefcase,
  User,
  Calculator,
} from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Employee Management',
    description: 'Manage your entire workforce from one place',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    description: 'Real-time insights into your organization',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'Bank-grade security for your data',
  },
  {
    icon: Zap,
    title: 'Automated Workflows',
    description: 'Streamline HR processes effortlessly',
  },
]

const demoAccounts = [
  {
    role: 'Admin',
    icon: Crown,
    email: 'admin@acme.com',
    password: 'admin123',
    description: 'Full access to all modules',
    color: 'from-amber-500 to-orange-600',
  },
  {
    role: 'HR Manager',
    icon: Briefcase,
    email: 'hr@acme.com',
    password: 'hr123',
    description: 'Employee & payroll management',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    role: 'Manager',
    icon: Users,
    email: 'david@acme.com',
    password: 'mgr123',
    description: 'Team approvals & leave management',
    color: 'from-cyan-500 to-blue-600',
  },
  {
    role: 'Accounts',
    icon: Calculator,
    email: 'accounts@zenith.com',
    password: 'acc123',
    description: 'Payroll processing & compliance',
    color: 'from-violet-500 to-purple-600',
  },
  {
    role: 'Employee',
    icon: User,
    email: 'sarah@acme.com',
    password: 'emp123',
    description: 'Self-service portal access',
    color: 'from-emerald-500 to-teal-600',
  },
]

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        navigate('/')
      } else {
        setError(result.error || 'Invalid credentials. Please try again.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setError('')
    setIsLoading(true)
    try {
      const result = await login(demoEmail, demoPassword)
      if (result.success) {
        navigate('/')
      } else {
        setError(result.error || 'Invalid credentials. Please try again.')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Hero/Features (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-primary via-primary-dark to-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/20 blur-3xl"
                style={{
                  width: `${300 + i * 100}px`,
                  height: `${300 + i * 100}px`,
                  top: `${10 + i * 15}%`,
                  left: `${-10 + i * 20}%`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Grid Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-primary font-bold text-sm shadow-lg">
                Z
              </div>
              <span className="text-sm font-bold text-white">Zenith HRMS</span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
              Modern HR Management
              <br />
              <span className="text-white/80">Made Simple</span>
            </h1>
            <p className="text-xs text-white/70 max-w-lg">
              Streamline your human resources operations with our intuitive platform.
              Trusted by 10,000+ companies worldwide.
            </p>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-4 rounded-lg bg-white/10 backdrop-blur-sm p-4 border border-white/10"
              >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{feature.title}</h3>
                  <p className="text-xs text-white/60 mt-0.5">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-12 flex gap-8"
          >
            {[
              { value: '10K+', label: 'Companies' },
              { value: '2M+', label: 'Employees' },
              { value: '99.9%', label: 'Uptime' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-sm font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/60">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden mb-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
                Z
              </div>
              <span className="text-sm font-bold text-text-primary">Zenith HRMS</span>
            </div>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-sm sm:text-base font-bold text-text-primary">Welcome back</h2>
            <p className="mt-2 text-text-secondary">
              Sign in to your account to continue
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onSubmit={handleLogin}
            className="space-y-5"
          >
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-text-primary">
                Email address
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-12 text-xs rounded-lg border-border"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-text-primary">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:text-primary-light transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-secondary" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-12 pr-12 text-xs rounded-lg border-border"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-danger-50 border border-danger/20 p-3 text-xs text-danger">
                {error}
              </div>
            )}

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`relative h-5 w-5 rounded-md border-2 transition-all duration-200 ${
                  rememberMe
                    ? 'bg-primary border-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {rememberMe && (
                  <CheckCircle2 className="h-4 w-4 text-white absolute -top-0.5 -left-0.5" />
                )}
              </button>
              <span className="text-xs text-text-secondary">Remember me for 30 days</span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-xs font-semibold rounded-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </motion.form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative my-8"
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-4 text-text-secondary">Quick login with demo accounts</span>
            </div>
          </motion.div>

          {/* Demo Accounts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {demoAccounts.map((demo) => (
              <button
                key={demo.role}
                onClick={() => handleDemoLogin(demo.email, demo.password)}
                disabled={isLoading}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${demo.color} shadow-md shrink-0`}>
                  <demo.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-xs text-text-primary group-hover:text-primary transition-colors truncate">
                    {demo.role}
                  </p>
                  <p className="text-[10px] text-text-secondary truncate">{demo.email}</p>
                </div>
              </button>
            ))}
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-text-secondary">
              By signing in, you agree to our{' '}
              <button className="text-primary hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button className="text-primary hover:underline">Privacy Policy</button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
