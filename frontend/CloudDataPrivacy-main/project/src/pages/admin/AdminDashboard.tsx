// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   Users, Database, Search, Edit, Trash2, 
//   FileText, FilePlus, Download 
// } from 'lucide-react';
// import Card from '../../components/ui/Card';
// import Button from '../../components/ui/Button';
// import Input from '../../components/ui/Input';
// import { useData } from '../../hooks/useData';
// import { useAuth } from '../../hooks/useAuth';
// import { formatDate, filterPatients, downloadCSV } from '../../utils/helpers';

// function AdminDashboard() {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const { patients,  deletePatient } = useData();
//   const [searchTerm, setSearchTerm] = useState('');
  
//   const filteredPatients = filterPatients(patients, searchTerm);
  
//   const handleDelete = (id: string) => {
//     if (window.confirm('Are you sure you want to delete this patient record?')) {
//       deletePatient(id);
//     }
//   };
  
//   const handleExportAll = () => {
//     downloadCSV(patients, 'all-patients.csv');
//   };
  
//   return (
//     <div>
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
//         <p className="text-gray-600 mt-1">
//           Welcome back, {user?.name}. Manage patient records and staff accounts.
//         </p>
//       </div>
      
//       <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
//         <Card>
//           <Card.Body className="flex items-center">
//             <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
//               <Database size={24} />
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Patients</p>
//               <p className="text-xl font-semibold">{patients.length}</p>
//             </div>
//           </Card.Body>
//         </Card>
        
//         <Card>
//           <Card.Body className="flex items-center">
//             <div className="p-3 rounded-full bg-secondary-100 text-secondary-600 mr-4">
//               <Users size={24} />
//             </div>
//             {/* <div>
//               <p className="text-sm font-medium text-gray-600">Staff Members</p>
//               <p className="text-xl font-semibold">{staffMembers.length}</p>
//             </div> */}
//           </Card.Body>
//         </Card>
        
//         <Card>
//           <Card.Body className="flex flex-col">
//             <p className="text-sm font-medium text-gray-600 mb-3">Quick Actions</p>
//             <div className="grid grid-cols-2 gap-2">
//               <Button 
//                 onClick={() => navigate('/admin/patients/new')}
//                 variant="primary"
//                 size="sm"
//                 leftIcon={<FilePlus size={16} />}
//               >
//                 Add Patient
//               </Button>
//               {/* <Button 
//                 onClick={() => navigate('/admin/staff')}
//                 variant="outline"
//                 size="sm"
//                 leftIcon={<Users size={16} />}
//               >
//                 Manage Staff
//               </Button> */}
//             </div>
//           </Card.Body>
//         </Card>
//       </div>
      
//       <Card>
//         <Card.Header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <h2 className="text-lg font-medium">Patient Records</h2>
//           <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
//             <div className="relative w-full sm:w-64">
//               <Input
//                 placeholder="Search patients..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10"
//               />
//               <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
//             </div>
//             <Button 
//               onClick={handleExportAll}
//               variant="outline"
//               size="sm"
//               leftIcon={<Download size={16} />}
//             >
//               Export All
//             </Button>
//           </div>
//         </Card.Header>
        
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Patient
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Health Issue
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Contact
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Date Added
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredPatients.length > 0 ? (
//                 filteredPatients.map((patient) => (
//                   <tr key={patient.id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="flex items-center">
//                         <div>
//                           <div className="text-sm font-medium text-gray-900">
//                             {patient.firstName} {patient.lastName}
//                           </div>
//                           <div className="text-sm text-gray-500">
//                             {patient.gender}, {new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} years
//                           </div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       <div className="text-sm text-gray-900">{patient.healthIssue}</div>
//                       <div className="text-sm text-gray-500">{patient.diagnosis}</div>
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {patient.contactNumber}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {formatDate(patient.createdAt)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <div className="flex space-x-2">
//                         <button
//                           onClick={() => navigate(`/admin/patients/edit/${patient.id}`)}
//                           className="text-primary-600 hover:text-primary-900"
//                           title="Edit patient"
//                         >
//                           <Edit size={18} />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(patient.id)}
//                           className="text-red-600 hover:text-red-900"
//                           title="Delete patient"
//                         >
//                           <Trash2 size={18} />
//                         </button>
//                         <button
//                           className="text-gray-600 hover:text-gray-900"
//                           title="View details"
//                         >
//                           <FileText size={18} />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
//                     {searchTerm
//                       ? 'No patients found matching your search criteria.'
//                       : 'No patient records available.'}
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </Card>
//     </div>
//   );
// }

// export default AdminDashboard;

//the above code is original code . U can replace the new code with the original in case of any issues.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Database, Search, Edit, Trash2, 
  FileText, FilePlus, Download, Upload 
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, filterPatients, downloadCSV } from '../../utils/helpers';
//import PatientForm from './PatientForm';

// ⬅️ NEW: Import service functions
import { uploadManualEntry, uploadCSV } from '../../api/dataService';

function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patients, deletePatient } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = filterPatients(patients, searchTerm);

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      deletePatient(id);
    }
  };

  const handleExportAll = () => {
    downloadCSV(patients, 'all-patients.csv');
  };

  // ------------------⬅️ NEW STATES FOR UPLOAD ------------------
  const [manualEntry, setManualEntry] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth:'',
    gender:'',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    bloddGroup:'',
    ethnicity: '',
    religion:'',
    drug:'',
    firstCareUnit:'',
    lastCareUnit:'',
    healthIssue:'',
    diagnosis:'',
    allergies:'',
    medications:'',
    notes:'',
    doctorName: '',
    doctorEmail: ''
  });
  const [file, setFile] = useState<File | null>(null);

  // handle input change
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualEntry({ ...manualEntry, [e.target.name]: e.target.value });
  };

  const handleManualSubmit = async () => {
    try {
      const res = await uploadManualEntry(manualEntry);
      alert(res.data?.message || 'Manual entry uploaded');
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // const handleFileUpload = async () => {
  //   if (!file) return alert('Please select a file');
  //   try {
  //     const res: any = await uploadCSV(file);
  //     alert(res.message || 'CSV uploaded successfully');
  //   } catch (err) {
  //     console.error(err);
  //     alert('CSV upload failed');
  //   }
//   // };
  const handleFileUpload = async () => {
  if (!file) return alert("Please select a file");

  try {
    const res: any = await uploadCSV(file); // calls the function above
    alert(res.message || "CSV uploaded successfully");
  } catch (err: any) {
    console.error("Upload failed:", err.response?.data || err.message);
    alert("CSV upload failed");
  }
};


  // -------------------------------------------------------------

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome back, {user?.name}. Manage patient records and staff accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
        <Card>
          <Card.Body className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600 mr-4">
              <Database size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-xl font-semibold">{patients.length}</p>
            </div>
          </Card.Body>
        </Card>
{/* 
        <Card>
          <Card.Body className="flex items-center">
            <div className="p-3 rounded-full bg-secondary-100 text-secondary-600 mr-4">
              <Users size={24} />
            </div>
          </Card.Body>
        </Card> */}

        <Card>
          <Card.Body className="flex flex-col">
            <p className="text-sm font-medium text-gray-600 mb-3">Quick Actions</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => navigate('/admin/patients/new')}
                variant="primary"
                size="sm"
                leftIcon={<FilePlus size={16} />}
              >
                Add Patient
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* ------------------⬅️ NEW: Manual entry + CSV upload ------------------ */}
      {/* <Card className="mb-8">
        <Card.Header>
          <h2 className="text-lg font-medium">Upload Data</h2>
        </Card.Header>
        <Card.Body>
          <div className="mb-6">
            <h3 className="text-md font-semibold mb-2">Manual Entry</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(manualEntry).map((field) => (
                <Input
                  key={field}
                  name={field}
                  placeholder={field}
                  value={(manualEntry as any)[field]}
                  onChange={handleManualChange}
                />
              ))}
            </div>
            <Button 
              onClick={handleManualSubmit}
              className="mt-3"
              variant="primary"
              leftIcon={<Upload size={16} />}
            >
              Submit Manual Entry
            </Button>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-2">Upload MIMIC CSV</h3>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <Button 
              onClick={handleFileUpload}
              className="ml-3"
              variant="secondary"
              leftIcon={<Upload size={16} />}
            >
              Upload CSV
            </Button>
          </div>
        </Card.Body>
      </Card> */}

      <Card>
        <Card.Header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-medium">Patient Records</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Input
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            <Button 
              onClick={handleExportAll}
              variant="outline"
              size="sm"
              leftIcon={<Download size={16} />}
            >
              Export All
            </Button>
          </div>
        </Card.Header>

        <div className="overflow-x-auto">
          {/* ... your existing patient table stays unchanged ... */}
        </div>
      </Card>
    </div>
  );
}

export default AdminDashboard;

