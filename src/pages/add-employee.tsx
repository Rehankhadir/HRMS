import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  Briefcase,
  DollarSign,
  FileText,
  Eye,
} from 'lucide-react'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

const steps = [
  { id: 1, label: 'Basic Details', shortLabel: 'Basic', icon: User },
  { id: 2, label: 'Employment', shortLabel: 'Employ.', icon: Briefcase },
  { id: 3, label: 'Salary', shortLabel: 'Salary', icon: DollarSign },
  { id: 4, label: 'Documents', shortLabel: 'Docs', icon: FileText },
  { id: 5, label: 'Review', shortLabel: 'Review', icon: Eye },
]

export function AddEmployee() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    department: '',
    designation: '',
    joiningDate: '',
    salary: '',
  })

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  id="gender"
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                  placeholder="Select gender"
                  value={formData.gender}
                  onChange={(e) => updateFormData('gender', e.target.value)}
                />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select
                  id="department"
                  options={[
                    { value: 'Engineering', label: 'Engineering' },
                    { value: 'Design', label: 'Design' },
                    { value: 'Marketing', label: 'Marketing' },
                    { value: 'Sales', label: 'Sales' },
                    { value: 'Human Resources', label: 'Human Resources' },
                    { value: 'Finance', label: 'Finance' },
                    { value: 'Operations', label: 'Operations' },
                  ]}
                  placeholder="Select department"
                  value={formData.department}
                  onChange={(e) => updateFormData('department', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Select
                  id="designation"
                  options={[
                    { value: 'Software Engineer', label: 'Software Engineer' },
                    { value: 'Senior Software Engineer', label: 'Senior Software Engineer' },
                    { value: 'Product Designer', label: 'Product Designer' },
                    { value: 'Marketing Manager', label: 'Marketing Manager' },
                    { value: 'HR Specialist', label: 'HR Specialist' },
                  ]}
                  placeholder="Select designation"
                  value={formData.designation}
                  onChange={(e) => updateFormData('designation', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="joiningDate">Joining Date</Label>
              <Input
                id="joiningDate"
                type="date"
                value={formData.joiningDate}
                onChange={(e) => updateFormData('joiningDate', e.target.value)}
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="salary">Annual Salary (USD)</Label>
              <Input
                id="salary"
                type="number"
                placeholder="Enter annual salary"
                value={formData.salary}
                onChange={(e) => updateFormData('salary', e.target.value)}
              />
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="rounded-lg border-2 border-dashed border-border p-6 sm:p-8 text-center">
              <FileText className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-text-secondary" />
              <h3 className="mt-3 sm:mt-4 text-xs sm:text-sm font-medium text-text-primary">Upload Documents</h3>
              <p className="mt-2 text-xs sm:text-sm text-text-secondary">
                Drag and drop files here, or click to browse
              </p>
              <Button variant="outline" className="mt-3 sm:mt-4">
                Choose Files
              </Button>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
              {[
                { label: 'Name', value: `${formData.firstName} ${formData.lastName}` },
                { label: 'Email', value: formData.email || '—' },
                { label: 'Phone', value: formData.phone || '—' },
                { label: 'Department', value: formData.department || '—' },
                { label: 'Designation', value: formData.designation || '—' },
                { label: 'Salary', value: formData.salary ? `$${Number(formData.salary).toLocaleString()}` : '—' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs sm:text-sm text-text-secondary">{field.label}</label>
                  <p className="mt-1 text-xs font-medium">{field.value}</p>
                </div>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-4 sm:space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={item}>
        <Button variant="ghost" asChild className="gap-2">
          <Link to="/employees">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Employees</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </Button>
      </motion.div>

      {/* Page Header */}
      <motion.div variants={item}>
        <h1 className="text-sm sm:text-base font-bold text-text-primary">Add New Employee</h1>
        <p className="mt-1 text-xs sm:text-sm text-text-secondary">Fill in the details to add a new team member.</p>
      </motion.div>

      {/* Progress Indicator */}
      <motion.div variants={item}>
        <Card>
          <CardContent className="p-4 sm:p-6">
            {/* Mobile Progress */}
            <div className="sm:hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-text-primary">
                  Step {currentStep} of {steps.length}
                </span>
                <span className="text-xs text-text-secondary">
                  {steps[currentStep - 1].label}
                </span>
              </div>
              <div className="h-2 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Desktop Progress */}
            <div className="hidden sm:flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                        currentStep > step.id
                          ? 'bg-success text-white'
                          : currentStep === step.id
                          ? 'bg-primary text-white'
                          : 'bg-background text-text-secondary'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-text-primary">
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="mx-4 h-0.5 w-12 bg-border" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Form Content */}
      <motion.div variants={item}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs sm:text-sm">{steps[currentStep - 1].label}</CardTitle>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div variants={item} className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        {currentStep < steps.length ? (
          <Button
            onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
            className="w-full sm:w-auto"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              if (!formData.firstName || !formData.lastName || !formData.email) {
                toast('Please fill in all required fields', 'error')
                return
              }
              toast(`Employee ${formData.firstName} ${formData.lastName} created successfully!`, 'success')
              setTimeout(() => navigate('/employees'), 1000)
            }}
          >
            <Check className="mr-2 h-4 w-4" />
            Create Employee
          </Button>
        )}
      </motion.div>
    </motion.div>
  )
}
