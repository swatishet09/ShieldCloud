import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, FileText, ArrowRight, 
  Activity, User, Calendar
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, filterPatients } from '../../utils/helpers';

function DoctorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPatients = filterPatients(patients, searchTerm);
  
  const uniqueHealthIssues = [...new Set(patients.map(p => p.healthIssue))];
  
  const getPatientsByHealthIssue = (healthIssue: string) => {
    return patients.filter(p => p.healthIssue === healthIssue);
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medical Staff Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome, {user?.name}. Access and manage patient medical records.
        </p>
      </div>
      
      <div className="mb-8">
        <Card>
          <Card.Header className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Patient Search</h2>
          </Card.Header>
          <Card.Body>
            <div className="relative w-full max-w-2xl">
              <Input
                placeholder="Search by name, health issue, or diagnosis..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPatients.length > 0 ? (
                filteredPatients.slice(0, 6).map((patient) => (
                  <Card key={patient.id} hover className="h-full">
                    <Card.Body>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              {patient.healthIssue}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            {patient.diagnosis}
                          </p>
                        </div>
                        <Button
                          onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                          variant="outline"
                          size="sm"
                          rightIcon={<ArrowRight size={16} />}
                        >
                          View
                        </Button>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500 grid grid-cols-2 gap-2">
                        <div className="flex items-center">
                          <User size={14} className="mr-1" />
                          {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yrs,{' '}
                          {patient.gender}
                        </div>
                        <div className="flex items-center">
                          <Activity size={14} className="mr-1" />
                          {patient.bloodType || 'Unknown'}
                        </div>
                        <div className="flex items-center col-span-2">
                          <Calendar size={14} className="mr-1" />
                          Updated: {formatDate(patient.updatedAt)}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 p-4 text-center text-gray-500">
                  <p>No patients found matching your search criteria.</p>
                </div>
              )}
            </div>
            
            {filteredPatients.length > 6 && (
              <div className="mt-4 text-center">
                <Button variant="outline">
                  View All {filteredPatients.length} Results
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Patients by Health Condition</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {uniqueHealthIssues.slice(0, 4).map((healthIssue) => (
          <Card key={healthIssue}>
            <Card.Header>
              <h3 className="text-lg font-medium">{healthIssue}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {getPatientsByHealthIssue(healthIssue).length} patients
              </p>
            </Card.Header>
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diagnosis
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPatientsByHealthIssue(healthIssue).slice(0, 3).map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.firstName} {patient.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yrs, {patient.gender}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {patient.diagnosis}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => navigate(`/doctor/patients/${patient.id}`)}
                          className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                        >
                          <FileText size={16} className="mr-1" />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {getPatientsByHealthIssue(healthIssue).length > 3 && (
                <div className="px-4 py-3 bg-gray-50 text-right">
                  <button
                    onClick={() => setSearchTerm(healthIssue)}
                    className="text-sm text-primary-600 hover:text-primary-900 font-medium"
                  >
                    View all {getPatientsByHealthIssue(healthIssue).length} patients →
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default DoctorDashboard;