import { useNavigate } from 'react-router-dom';
import { UserPlus, KeyRound, Users, Stethoscope, Database } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const getDashboardUrl = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'doctor':
      case 'patient':
        return '/doctor';
      default:
        return '/';
    }
  };
  
  const roleCards = [
    {
      title: 'Administrator',
      description: 'Manage patient records, create staff accounts, and oversee system operations.',
      icon: <Users size={48} className="text-primary-600" />,
      actions: isAuthenticated && user?.role === 'admin' ? (
        <Button onClick={() => navigate('/admin')} variant="primary" fullWidth>
          Go to Dashboard
        </Button>
      ) : (
        <div className="space-y-2">
          <Button 
            onClick={() => navigate('/register', { state: { role: 'admin' } })} 
            leftIcon={<UserPlus size={16} />}
            variant="outline" 
            fullWidth
          >
            Create Account
          </Button>
          <Button 
            onClick={() => navigate('/login', { state: { role: 'admin' } })} 
            leftIcon={<KeyRound size={16} />}
            variant="primary" 
            fullWidth
          >
            Login
          </Button>
        </div>
      ),
    },
    {
      title: 'Doctor & patient',
      description: 'Access and manage patient medical records, update treatment information, and collaborate with the healthcare team.',
      icon: <Stethoscope size={48} className="text-secondary-600" />,
      actions: isAuthenticated && (user?.role === 'doctor' || user?.role === 'patient') ? (
        <Button onClick={() => navigate('/doctor')} variant="secondary" fullWidth>
          Go to Dashboard
        </Button>
      ) : (
        <Button 
          onClick={() => navigate('/login', { state: { role: 'doctor' } })} 
          leftIcon={<KeyRound size={16} />}
          variant="secondary" 
          fullWidth
        >
          Login
        </Button>
      ),
    },
    {
      title: 'Researchers',
      description: 'Access anonymized patient data organized by health conditions for research and analysis purposes.',
      icon: <Database size={48} className="text-accent-600" />,
      actions: (
        <Button 
          onClick={() => navigate('/researcher')} 
          variant="accent" 
          fullWidth
        >
          View Research Data
        </Button>
      ),
    },
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Safeguarding Sensitive Cloud Data using  ML-Driven Differential Privacy
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-500">
          A secure platform for healthcare data management with role-based access for administrators and medical staff, plus research data access.
        </p>
        
        {isAuthenticated && (
          <div className="mt-8">
            <Button
              onClick={() => navigate(getDashboardUrl())}
              size="lg"
              variant="primary"
            >
              Go to Your Dashboard
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {roleCards.map((card, index) => (
          <Card key={index} hover className="flex flex-col h-full transition-transform duration-300 transform hover:-translate-y-1">
            <Card.Body className="flex-grow">
              <div className="flex justify-center mb-6">
                {card.icon}
              </div>
              <h2 className="text-2xl font-semibold text-center mb-4">{card.title}</h2>
              <p className="text-gray-600 text-center mb-6">{card.description}</p>
              <div className="mt-auto">
                {card.actions}
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Features</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Data Storage</h3>
            <p className="text-gray-600">Encrypted storage ensuring patient data remains private and secure.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Role-Based Access</h3>
            <p className="text-gray-600">Tailored access controls for different healthcare professionals.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Patient Record Management</h3>
            <p className="text-gray-600">Comprehensive patient information management system.</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Research Data Access</h3>
            <p className="text-gray-600">Direct access to categorized patient data for research purposes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;