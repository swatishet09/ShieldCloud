import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, User, Activity, Phone, Mail, Home, AlertTriangle, Pill as Pills, FileText } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TextArea from '../../components/ui/TextArea';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/helpers';

function PatientDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { getPatientById, updatePatient } = useData();
  
  const [patient, setPatient] = useState<ReturnType<typeof getPatientById>>();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [editedData, setEditedData] = useState({
    diagnosis: '',
    medications: '',
    notes: '',
  });
  
  useEffect(() => {
    if (id) {
      const patientData = getPatientById(id);
      if (patientData) {
        setPatient(patientData);
        setEditedData({
          diagnosis: patientData.diagnosis,
          medications: patientData.medications,
          notes: patientData.notes || '',
        });
      } else {
        setError('Patient not found');
      }
    }
  }, [id, getPatientById]);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (id) {
        updatePatient(id, editedData);
        const updatedPatient = getPatientById(id);
        setPatient(updatedPatient);
        setIsEditing(false);
      }
    } catch (err) {
      setError('An error occurred while updating the patient record');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!patient) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium text-gray-900 mb-4">
          {error || 'Loading patient information...'}
        </h2>
        <Button
          onClick={() => navigate('/doctor')}
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Patient Details
        </h1>
        <div className="flex space-x-3">
          <Button
            onClick={() => navigate('/doctor')}
            variant="outline"
            leftIcon={<ArrowLeft size={16} />}
          >
            Back to Dashboard
          </Button>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="primary"
            >
              Edit Record
            </Button>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <Card.Header>
              <h2 className="text-lg font-medium">Patient Information</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 text-primary-600 text-2xl font-bold">
                    {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Patient ID: {patient.id.slice(0, 8)}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <dl className="space-y-3">
                    <div className="flex items-center text-sm">
                      <dt className="flex items-center w-1/3 text-gray-500">
                        <Calendar size={16} className="mr-2" />
                        Age
                      </dt>
                      <dd className="w-2/3">
                        {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
                        <span className="text-gray-500 text-xs ml-1">
                          (DOB: {formatDate(patient.dateOfBirth)})
                        </span>
                      </dd>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <dt className="flex items-center w-1/3 text-gray-500">
                        <User size={16} className="mr-2" />
                        Gender
                      </dt>
                      <dd className="w-2/3 capitalize">{patient.gender}</dd>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <dt className="flex items-center w-1/3 text-gray-500">
                        <Activity size={16} className="mr-2" />
                        Blood Type
                      </dt>
                      <dd className="w-2/3">{patient.bloodType || 'Not recorded'}</dd>
                    </div>
                  </dl>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Information</h4>
                  <dl className="space-y-3">
                    <div className="flex items-center text-sm">
                      <dt className="flex items-center w-1/3 text-gray-500">
                        <Phone size={16} className="mr-2" />
                        Phone
                      </dt>
                      <dd className="w-2/3">{patient.contactNumber}</dd>
                    </div>
                    
                    {patient.email && (
                      <div className="flex items-center text-sm">
                        <dt className="flex items-center w-1/3 text-gray-500">
                          <Mail size={16} className="mr-2" />
                          Email
                        </dt>
                        <dd className="w-2/3 break-all">{patient.email}</dd>
                      </div>
                    )}
                    
                    <div className="flex items-start text-sm">
                      <dt className="flex items-center w-1/3 text-gray-500 pt-1">
                        <Home size={16} className="mr-2" />
                        Address
                      </dt>
                      <dd className="w-2/3">{patient.address}</dd>
                    </div>
                    
                    <div className="flex items-start text-sm">
                      <dt className="flex items-center w-1/3 text-gray-500 pt-1">
                        <Phone size={16} className="mr-2" />
                        Emergency
                      </dt>
                      <dd className="w-2/3">{patient.emergencyContact}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {isEditing ? (
            <Card>
              <Card.Header>
                <h2 className="text-lg font-medium">Edit Medical Information</h2>
              </Card.Header>
              <Card.Body>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <TextArea
                    label="Diagnosis"
                    id="diagnosis"
                    name="diagnosis"
                    value={editedData.diagnosis}
                    onChange={handleChange}
                    required
                    rows={3}
                  />
                  
                  <TextArea
                    label="Medications"
                    id="medications"
                    name="medications"
                    value={editedData.medications}
                    onChange={handleChange}
                    required
                    rows={3}
                    helperText="Current medications with dosage"
                  />
                  
                  <TextArea
                    label="Additional Notes"
                    id="notes"
                    name="notes"
                    value={editedData.notes}
                    onChange={handleChange}
                    rows={4}
                  />
                  
                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <Button
                      type="button"
                      variant="outline"
                      className="mr-4"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isLoading}
                      leftIcon={<Save size={16} />}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card.Body>
            </Card>
          ) : (
            <>
              <Card className="mb-6">
                <Card.Header className="flex justify-between">
                  <h2 className="text-lg font-medium">Health Issue</h2>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {patient.healthIssue}
                  </span>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                        <FileText size={16} className="mr-2" />
                        Diagnosis
                      </h3>
                      <p className="text-gray-900 whitespace-pre-line">{patient.diagnosis}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                        <AlertTriangle size={16} className="mr-2" />
                        Allergies
                      </h3>
                      <p className="text-gray-900 whitespace-pre-line">{patient.allergies}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center">
                        <Pills size={16} className="mr-2" />
                        Medications
                      </h3>
                      <p className="text-gray-900 whitespace-pre-line">{patient.medications}</p>
                    </div>
                    
                    {patient.notes && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Notes</h3>
                        <p className="text-gray-900 whitespace-pre-line">{patient.notes}</p>
                      </div>
                    )}
                  </div>
                </Card.Body>
                <Card.Footer className="bg-gray-50 text-sm text-gray-500">
                  <div className="flex flex-col sm:flex-row sm:justify-between">
                    <div>Last updated by: {patient.lastUpdatedBy === user?.id ? 'You' : patient.lastUpdatedBy}</div>
                    <div>Date: {formatDate(patient.updatedAt)}</div>
                  </div>
                </Card.Footer>
              </Card>
              
              <Card>
                <Card.Header>
                  <h2 className="text-lg font-medium">Record History</h2>
                </Card.Header>
                <div className="px-4 py-5 sm:p-6">
                  <ol className="relative border-l border-gray-200 ml-3">
                    <li className="mb-6 ml-6">
                      <span className="absolute flex items-center justify-center w-6 h-6 bg-primary-100 rounded-full -left-3 ring-8 ring-white">
                        <User size={12} className="text-primary-600" />
                      </span>
                      <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
                        Patient record created
                      </h3>
                      <time className="block mb-2 text-sm font-normal leading-none text-gray-500">
                        {formatDate(patient.createdAt)}
                      </time>
                      <p className="text-sm text-gray-600">
                        Initial record created by {patient.createdBy}
                      </p>
                    </li>
                    {patient.createdAt !== patient.updatedAt && (
                      <li className="ml-6">
                        <span className="absolute flex items-center justify-center w-6 h-6 bg-secondary-100 rounded-full -left-3 ring-8 ring-white">
                          <FileText size={12} className="text-secondary-600" />
                        </span>
                        <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
                          Record updated
                        </h3>
                        <time className="block mb-2 text-sm font-normal leading-none text-gray-500">
                          {formatDate(patient.updatedAt)}
                        </time>
                        <p className="text-sm text-gray-600">
                          Updated by {patient.lastUpdatedBy === user?.id ? 'you' : patient.lastUpdatedBy}
                        </p>
                      </li>
                    )}
                  </ol>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDetails;