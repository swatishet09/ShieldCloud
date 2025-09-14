import { useState } from 'react';
import { 
  Download, BarChart2, Users, PieChart,
  FileText, Database
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { downloadCSV, categorizePatientsByHealthIssue } from '../../utils/helpers';

function ResearcherDashboard() {
  const { user } = useAuth();
  const { patients } = useData();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const patientCategories = categorizePatientsByHealthIssue(patients);
  const categories = Object.keys(patientCategories).sort();
  
  const handleExportCategory = (category: string) => {
    if (category && patientCategories[category]) {
      const patientsToExport = patientCategories[category].map(patient => {
        // Create a sanitized copy of patient data for research
        // Remove/anonymize personal identifiers but keep medical data
        const { 
          id, firstName, lastName, email, address, contactNumber, emergencyContact,
          ...anonymizedData 
        } = patient;
        
        return {
          patientId: id.slice(0, 8), // Use only part of ID for anonymization
          age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
          gender: patient.gender,
          healthIssue: patient.healthIssue,
          diagnosis: patient.diagnosis,
          bloodType: patient.bloodType || 'Unknown',
          allergies: patient.allergies,
          medications: patient.medications,
          notes: patient.notes,
        };
      });
      
      downloadCSV(patientsToExport, `${category.toLowerCase().replace(/\s+/g, '-')}-patients.csv`);
    }
  };
  
  const handleExportAll = () => {
    const allAnonymizedPatients = patients.map(patient => {
      const { 
        id, firstName, lastName, email, address, contactNumber, emergencyContact,
        ...anonymizedData 
      } = patient;
      
      return {
        patientId: id.slice(0, 8),
        age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
        gender: patient.gender,
        healthIssue: patient.healthIssue,
        diagnosis: patient.diagnosis,
        bloodType: patient.bloodType || 'Unknown',
        allergies: patient.allergies,
        medications: patient.medications,
        notes: patient.notes,
      };
    });
    
    downloadCSV(allAnonymizedPatients, 'all-patient-research-data.csv');
  };
  
  // Get counts for different data visualizations
  const healthIssueDistribution = categories.map(category => ({
    category,
    count: patientCategories[category].length
  }));
  
  const genderDistribution = {
    male: patients.filter(p => p.gender === 'male').length,
    female: patients.filter(p => p.gender === 'female').length,
    other: patients.filter(p => p.gender === 'other').length,
  };
  
  const ageGroups = {
    'Under 18': patients.filter(p => (new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()) < 18).length,
    '18-30': patients.filter(p => {
      const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
      return age >= 18 && age <= 30;
    }).length,
    '31-45': patients.filter(p => {
      const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
      return age >= 31 && age <= 45;
    }).length,
    '46-60': patients.filter(p => {
      const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear();
      return age >= 46 && age <= 60;
    }).length,
    '61+': patients.filter(p => (new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()) > 60).length,
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Research Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome, {user?.name}. Access anonymized patient data for research purposes.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
        <Card>
          <Card.Body className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
              <Database size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patient Records</p>
              <p className="text-xl font-semibold">{patients.length}</p>
            </div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-600 mr-4">
              <BarChart2 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Health Categories</p>
              <p className="text-xl font-semibold">{categories.length}</p>
            </div>
          </Card.Body>
        </Card>
        
        <Card>
          <Card.Body className="flex flex-col">
            <p className="text-sm font-medium text-gray-600 mb-3">Export All Data</p>
            <Button 
              onClick={handleExportAll}
              variant="primary"
              leftIcon={<Download size={16} />}
            >
              Download All Data (CSV)
            </Button>
          </Card.Body>
        </Card>
      </div>
      
      <div className="mb-8">
        <Card>
          <Card.Header>
            <h2 className="text-lg font-medium">Export Data by Health Category</h2>
          </Card.Header>
          <Card.Body>
            <div className="flex flex-col md:flex-row gap-4">
              <Select
                label="Select Health Category"
                id="category"
                name="category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="max-w-xs"
                options={[
                  { value: '', label: 'Select a category' },
                  ...categories.map(category => ({
                    value: category,
                    label: `${category} (${patientCategories[category].length} patients)`
                  }))
                ]}
              />
              
              <div className="flex items-end">
                <Button
                  onClick={() => handleExportCategory(selectedCategory)}
                  variant="primary"
                  leftIcon={<Download size={16} />}
                  disabled={!selectedCategory}
                >
                  Export Selected Category
                </Button>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Available Categories</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                  <div key={category} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                    <div>
                      <span className="font-medium">{category}</span>
                      <span className="text-sm text-gray-500 ml-2">
                        {patientCategories[category].length} patients
                      </span>
                    </div>
                    <Button
                      onClick={() => handleExportCategory(category)}
                      variant="outline"
                      size="sm"
                      leftIcon={<FileText size={14} />}
                    >
                      Export
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Overview</h2>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <Card.Header className="flex items-center">
            <BarChart2 size={20} className="mr-2 text-primary-600" />
            <h3 className="text-lg font-medium">Distribution by Health Issue</h3>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {healthIssueDistribution.map(item => (
                <div key={item.category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{item.category}</span>
                    <span className="text-sm text-gray-500">{item.count} patients</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full"
                      style={{ width: `${(item.count / patients.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <Card.Header className="flex items-center">
              <Users size={20} className="mr-2 text-secondary-600" />
              <h3 className="text-lg font-medium">Gender Distribution</h3>
            </Card.Header>
            <Card.Body>
              <div className="flex justify-around text-center">
                <div>
                  <div className="text-3xl font-bold text-secondary-600 mb-1">
                    {genderDistribution.male}
                  </div>
                  <div className="text-sm text-gray-500">Male</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary-600 mb-1">
                    {genderDistribution.female}
                  </div>
                  <div className="text-sm text-gray-500">Female</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-secondary-600 mb-1">
                    {genderDistribution.other}
                  </div>
                  <div className="text-sm text-gray-500">Other</div>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header className="flex items-center">
              <PieChart size={20} className="mr-2 text-accent-600" />
              <h3 className="text-lg font-medium">Age Group Distribution</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {Object.entries(ageGroups).map(([ageGroup, count]) => (
                  <div key={ageGroup}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{ageGroup}</span>
                      <span className="text-sm text-gray-500">{count} patients</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-accent-600 h-2.5 rounded-full"
                        style={{ width: `${(count / patients.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ResearcherDashboard;