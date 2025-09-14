import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Home } from 'lucide-react';

function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-4xl font-bold text-gray-900 mt-4">Page not found</h2>
        <p className="text-lg text-gray-600 mt-4 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. The page might have been moved or doesn't exist.
        </p>
        <div className="mt-8">
          <Button 
            onClick={() => navigate('/')}
            variant="primary"
            size="lg"
            leftIcon={<Home size={20} />}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;