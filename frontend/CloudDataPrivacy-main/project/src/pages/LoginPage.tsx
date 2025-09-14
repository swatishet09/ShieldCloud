import { useState, useEffect, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Heart, KeyRound } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { UserRole,LoginCredentials } from '../types';

interface LocationState {
  role?: UserRole;
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, error } = useAuth();
  
  const { role } = (location.state as LocationState) || {};
  
  const [formData, setFormData] = useState({
    loginInput: '',
    password: '',
  });
  const [mfaCode, setMfaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'mfa'>('login');

  // ✅ Clear localStorage on component mount
  useEffect(() => {
    localStorage.clear();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if ((role === 'doctor' || role === 'patient') && step === 'login') {
      console.log('Trigger MFA for:', formData.loginInput);
      setStep('mfa');
      setIsLoading(false);
      return;
    }

    // let demoEmail = '';
    // let demoPassword = '';
    
    // if (role === 'admin') {
    //   demoEmail = 'admin@hospital.com';
    //   demoPassword = 'admin123';
    // } else if (role === 'doctor' || role === 'patient') {
    //   demoEmail = 'doctor@hospital.com';
    //   demoPassword = 'doctor123';
    // } else if (role === 'researcher') {
    //   demoEmail = 'researcher@hospital.com';
    //   demoPassword = 'research123';
    // }

   const loginPayload: LoginCredentials = {
  loginInput: formData.loginInput,   // could be email or username
  password: formData.password,
  mfaCode: role !== "admin" ? mfaCode : undefined
};

const success = await login(loginPayload);


    if (success) {
      if (role === 'admin') navigate('/admin');
      else if (role === 'doctor' || role === 'patient') navigate('/doctor');
      else if (role === 'researcher') navigate('/researcher');
      else navigate('/');
    }
  };
  
  const getRoleTitle = () => {
    if (role === 'admin') return 'Administrator';
    if (role === 'doctor' || role === 'patient') return 'Doctor & Staff';
    if (role === 'researcher') return 'Researcher';
    return '';
  };
  
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <Card className="w-full max-w-md">
        <Card.Body>
          <div className="flex justify-center">
            <Heart className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-4 text-center text-3xl font-bold text-gray-900">
            {role ? `Login as ${getRoleTitle()}` : 'Log in to your account'}
          </h2>
          
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                label="Email Address or username"
                id="loginInput"
                name="loginInput"
                type="text"
                autoComplete="off"
                required
                 placeholder={
                role === 'admin'
                  ? "Enter your username (IAM) + email required at registration"
                  : "Enter your email"
              }
                value={formData.loginInput}
                onChange={handleChange}
              />
              
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder={role ? "Demo password available" : "Password"}
                value={formData.password}
                onChange={handleChange}
              />

              {step === 'mfa' && (role === 'doctor' || role === 'patient') && (
                <Input
                  label="Enter MFA Code"
                  id="mfaCode"
                  name="mfaCode"
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="Enter the code sent to your email/phone"
                  required
                />
              )}
            </div>
            
            {role && (
              <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-md">
                <p>
                  <strong>Demo Credentials:</strong> You can use the following credentials for demo purposes:
                </p>
                <p className="mt-1">
                  Email: <code className="bg-blue-100 px-1 py-0.5 rounded">{role}@hospital.com</code>
                </p>
                <p>
                  Password: <code className="bg-blue-100 px-1 py-0.5 rounded">
                    {role === 'admin' ? 'admin123' : role === 'researcher' ? 'research123' : 'doctor123'}
                  </code>
                </p>
              </div>
            )}
            
            <div>
              {role === 'doctor' || role === 'patient' ? (
                step === 'login' ? (
                  <Button
                    type="button"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                    onClick={() => setStep('mfa')}
                    leftIcon={<KeyRound size={16} />}
                  >
                    Get MFA
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    isLoading={isLoading}
                    leftIcon={<KeyRound size={16} />}
                  >
                    Sign in
                  </Button>
                )
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  leftIcon={<KeyRound size={16} />}
                >
                  Sign in
                </Button>
              )}
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/register', { state: { role } })}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Register
              </button>
            </p>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default LoginPage;


