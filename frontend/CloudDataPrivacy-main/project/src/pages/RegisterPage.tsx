import { useState, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface LocationState {
  role?: UserRole;
}

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, error } = useAuth();

  const { role: preselectedRole } = (location.state as LocationState) || {};

  const [formData, setFormData] = useState({
    fullName: '',
    username: "",
    email: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    role: preselectedRole || 'admin' as UserRole,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError(null);
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords don't match");
      return false;
    }

    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }

     // 🔹 Admin must provide username
    if (formData.role === "admin" && !formData.username.trim()) {
      setValidationError("Username is required for Admins.");
      return false;
    }

    // // 🔹 Non-admin must provide email
    // if (formData.role !== "admin" && !formData.email.trim()) {
    //   setValidationError("Email is required for Doctors, Patients, and Researchers.");
    //   return false;
    // }
    if (!formData.email.trim()) {
  setValidationError("Email is required for all users.");
  return false;
}

    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const success = await register({
      fullName: formData.fullName,
      username:formData.username|| undefined,
      email: formData.email ,
      dateOfBirth: formData.dateOfBirth,
      password: formData.password,
      confirmPassword:formData.confirmPassword,
      role: formData.role,
    });

    setIsLoading(false);

    if (success) {
      // Navigate to appropriate dashboard based on role
      if (formData.role === 'admin') {
        navigate('/admin');
      } else if (formData.role === 'doctor' || formData.role === 'patient') {
        navigate('/doctor');
      } else if (formData.role === 'researcher') {
        navigate('/researcher');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <Card className="w-full max-w-md">
        <Card.Body>
          <div className="flex justify-center">
            <Heart className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-bold text-gray-900">
            {preselectedRole
              ? `Create ${preselectedRole === 'admin' ? 'an Admin' : `a ${preselectedRole}`} Account`
              : 'Create an account'}
          </h2>

          {(error || validationError) && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error || validationError}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Full Name"
                id="name"
                name="fullName"
                type="text"
                autoComplete="name"
                required
                placeholder="Guruprasad"
                value={formData.fullName}
                onChange={handleChange}
              />

             <Input
            label="Username"
            id="username"
            name="username"
            type="text"
            autoComplete="off"
            required={formData.role === "admin"}
            placeholder="guru123"
            value={formData.username || ''}
            onChange={handleChange}
          />

          <Input
            label="Email Address"
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            required
            placeholder="gurubhatkodani@gmail.com"
            value={formData.email}
            onChange={handleChange}
          />



              <Input
                label="Date of Birth"
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
              />

              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                helperText="Password must be at least 6 characters"
              />

              <Input
                label="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />

              {!preselectedRole && (
                <Select
                  label="Role"
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  options={[
                    { value: 'admin', label: 'Administrator' },
                    { value: 'doctor', label: 'Doctor' },
                    { value: 'patient', label: 'Patient' },
                    { value: 'researcher', label: 'Researcher' },
                  ]}
                />
              )}
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                leftIcon={<UserPlus size={16} />}
              >
                Register
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login', { state: { role: preselectedRole } })}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Log in
              </button>
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default RegisterPage;
