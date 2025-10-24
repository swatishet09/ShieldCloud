// import { useState, useEffect, FormEvent } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { ArrowLeft, Save } from 'lucide-react';
// import Card from '../../components/ui/Card';
// import Button from '../../components/ui/Button';
// import Input from '../../components/ui/Input';
// import TextArea from '../../components/ui/TextArea';
// import Select from '../../components/ui/Select';
// import { useData } from '../../hooks/useData';

// function PatientForm() {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const { getPatientById, addPatient, updatePatient } = useData();
//   const isEditMode = !!id;

//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     dateOfBirth: '',
//     gender: '',
//     phone: '',
//     email: '',
//     address: '',
//     emergencyContact: '',
//     bloodGroup: '',
//     ethnicity: '',
//     religion: '',
//     drug: '',
//     firstCareUnit: '',
//     lastCareUnit: '',
//     healthIssue: '',
//     diagnosis: '',
//     allergies: '',
//     medications: '',
//     notes: '',
//     doctorName: '',
//     doctorEmail: '',
//   });

//   const [pdfFile, setPdfFile] = useState<File | null>(null);
//   const [csvFile, setCsvFile] = useState<File | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     if (isEditMode && id) {
//       const patient = getPatientById(id);
//       if (patient) {
//         setFormData({
            
//           firstName: patient.firstName,
//           lastName: patient.lastName,
//           dateOfBirth: patient.dateOfBirth,
//           gender: patient.gender,
//           phone: patient.phone,
//           email: patient.email || '',
//           address: patient.address,
//           emergencyContact: patient.emergencyContact,
//           bloodGroup: patient.bloodGroup ,
//           ethnicity: patient.ethnicity || '',
//           religion: patient.religion || '',
//           drug: patient.drug || '',
//           firstCareUnit: patient.firstCareUnit || '',
//           lastCareUnit: patient.lastCareUnit || '',
//           healthIssue: patient.healthIssue || '',
//           diagnosis: patient.diagnosis || '',
//           allergies: patient.allergies || '',
//           medications: patient.medications || '',
//           notes: patient.notes || '',
//           doctorName: patient.doctorName || '',
//           doctorEmail: patient.doctorEmail || '',
//         });
//       } else {
//         setError('Patient not found');
//       }
//     }
//   }, [id, isEditMode, getPatientById]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       if (file.type !== 'application/pdf') {
//         setError('Only PDF files are allowed');
//         return;
//       }
//       setError(null);
//       setPdfFile(file);
//     }
//   };

//   const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       const file = e.target.files[0];
//       if (!file.name.endsWith('.csv')) {
//         setError('Only CSV files are allowed');
//         return;
//       }
//       setError(null);
//       setCsvFile(file);
//     }
//   };

//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError(null);
//     try {
//       const payload = {
//         ...formData,
//         pdfFile,
//         csvFile,
//       };
//       if (isEditMode && id) {
//         updatePatient(id, payload);
//       } else {
//         addPatient(payload as any);
//       }
//       navigate('/admin');
//     } catch (err) {
//       setError('An error occurred while saving the patient record');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">
//           {isEditMode ? 'Edit Patient Record' : 'Add New Patient'}
//         </h1>
//         <Button
//           onClick={() => navigate('/admin')}
//           variant="outline"
//           leftIcon={<ArrowLeft size={16} />}
//         >
//           Back to Dashboard
//         </Button>
//       </div>

//       {error && (
//         <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
//           {error}
//         </div>
//       )}

//       <Card>
//         <Card.Body>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//               <div>
//                 <h2 className="text-lg font-medium mb-4">Personal Information</h2>
//                 <div className="space-y-4">
//                   <Input label="First Name" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
//                   <Input label="Last Name" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
//                   <Input label="Date of Birth" id="dateOfBirth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
//                   <Select label="Gender" id="gender" name="gender" value={formData.gender} onChange={handleChange} required
//                     options={[
//                       { value: '', label: 'Select gender' },
//                       { value: 'male', label: 'Male' },
//                       { value: 'female', label: 'Female' },
//                       { value: 'other', label: 'Other' },
//                     ]}
//                   />
//                   <Input label="Blood Group" id="bloodGroup" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
//                   <Input label="Ethnicity" id="ethnicity" name="ethnicity" value={formData.ethnicity} onChange={handleChange} />
//                   <Input label="Religion" id="religion" name="religion" value={formData.religion} onChange={handleChange} />
//                 </div>

//                 <h2 className="text-lg font-medium mt-8 mb-4">Contact Information</h2>
//                 <div className="space-y-4">
//                   <Input label="Phone" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
//                   <Input label="Email" type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
//                   <TextArea label="Address" id="address" name="address" value={formData.address} onChange={handleChange} required rows={3} />
//                   <Input label="Emergency Contact" id="emergencyContact" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} required />
//                 </div>
//               </div>

//               <div>
//                 <h2 className="text-lg font-medium mb-4">Medical Information</h2>
//                 <div className="space-y-4">
//                   <Input label="Health Issue" id="healthIssue" name="healthIssue" value={formData.healthIssue} onChange={handleChange} required />
//                   <TextArea label="Diagnosis" id="diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} required rows={2} />
//                   <TextArea label="Allergies" id="allergies" name="allergies" value={formData.allergies} onChange={handleChange} required rows={2} />
//                   <TextArea label="Medications" id="medications" name="medications" value={formData.medications} onChange={handleChange} required rows={3} />
//                   <Input label="Drug" id="drug" name="drug" value={formData.drug} onChange={handleChange} />
//                   <Input label="First Care Unit" id="firstCareUnit" name="firstCareUnit" value={formData.firstCareUnit} onChange={handleChange} />
//                   <Input label="Last Care Unit" id="lastCareUnit" name="lastCareUnit" value={formData.lastCareUnit} onChange={handleChange} />
//                   <Input label="Doctor's Name" id="doctorName" name="doctorName" value={formData.doctorName} onChange={handleChange} required />
//                   <Input label="Doctor's Email" type="email" id="doctorEmail" name="doctorEmail" value={formData.doctorEmail} onChange={handleChange} required />
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF</label>
//                     <input type="file" accept=".pdf" onChange={handlePdfChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer" />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Upload CSV</label>
//                     <input type="file" accept=".csv" onChange={handleCsvChange} className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer" />
//                   </div>
//                   <TextArea label="Additional Notes" id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} />
//                 </div>
//               </div>
//             </div>

//             <div className="flex justify-end pt-4 border-t border-gray-100">
//               <Button type="button" variant="outline" className="mr-4" onClick={() => navigate('/admin')}>
//                 Cancel
//               </Button>
//               <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Save size={16} />}>
//                 {isEditMode ? 'Update Patient' : 'Save Patient'}
//               </Button>
//             </div>
//           </form>
//         </Card.Body>
//       </Card>
//     </div>
//   );
// }

// export default PatientForm;



// The above commented code is original code if u find any issue with the new code then u can replace it with previous one.


import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Select from '../../components/ui/Select';
import { useData } from '../../hooks/useData';
import { uploadManualEntry, uploadCSV } from '../../api/dataService';

function PatientForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getPatientById, addPatient, updatePatient } = useData();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    ethnicity: '',
    religion: '',
    drug: '',
    firstCareUnit: '',
    lastCareUnit: '',
    healthIssue: '',
    diagnosis: '',
    allergies: '',
    medications: '',
    notes: '',
    doctorName: '',
    doctorEmail: '',
  });

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load patient data if editing
  useEffect(() => {
    if (isEditMode && id) {
      const patient = getPatientById(id);
      if (patient) setFormData({ ...formData, ...patient });
      else setError('Patient not found');
    }
  }, [id, isEditMode, getPatientById]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      setError(null);
      setPdfFile(file);
    }
  };

  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.csv')) {
        setError('Only CSV files are allowed');
        return;
      }
      setError(null);
      setCsvFile(file);
    }
  };

  // Handle manual entry submission
  const handleManualSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await uploadManualEntry(formData);
      if (isEditMode && id) updatePatient(id, formData);
      else addPatient(formData);
      alert('Manual patient entry saved successfully');
      navigate('/admin');
    } catch (err: any) {
      setError('Error saving manual entry: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle separate file upload
  // const handleFileUpload = async () => {
  //   setIsLoading(true);
  //   setError(null);
  //   try {
  //     if (csvFile) await uploadCSV(csvFile);
  //     if (pdfFile) await uploadCSV(pdfFile); // replace with uploadPDF if available
  //     alert('Files uploaded successfully');
  //     setCsvFile(null);
  //     setPdfFile(null);
  //   } catch (err: any) {
  //     setError('File upload failed: ' + (err.message || err));
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]); // remove "data:*/*;base64,"
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });


    const uploadCSV = async (base64Data: string) => {
  try {
    const res = await fetch(
      "https://oq8l79wl3m.execute-api.ap-south-1.amazonaws.com/store/store",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "file",
          fileContent: base64Data,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Failed to upload CSV");
    }
  } catch (err) {
    throw err; // propagate error to handleFileUpload
  }
};


      const handleFileUpload = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (csvFile) {
        const base64Csv = await fileToBase64(csvFile);
        await uploadCSV(base64Csv, csvFile.name);
      }

      alert("Files uploaded successfully");
      setCsvFile(null);
      setPdfFile(null);
    } catch (err: any) {
      setError("File upload failed: " + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Patient Record' : 'Add New Patient'}
        </h1>
        <Button
          onClick={() => navigate('/admin')}
          variant="outline"
          leftIcon={<ArrowLeft size={16} />}
        >
          Back to Dashboard
        </Button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* --- Manual Entry Form --- */}
      <Card className="mb-6">
        <Card.Body>
          <form onSubmit={handleManualSubmit} className="space-y-6">
            {/* Personal & Medical Information fields unchanged */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <h2 className="text-lg font-medium mb-4">Personal Information</h2>
                <div className="space-y-4">
                  <Input label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
                  <Input label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
                  <Input label="Date of Birth" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
                  <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} required
                    options={[
                      { value: '', label: 'Select gender' },
                      { value: 'male', label: 'Male' },
                      { value: 'female', label: 'Female' },
                      { value: 'other', label: 'Other' },
                    ]}
                  />
                  <Input label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
                  <Input label="Ethnicity" name="ethnicity" value={formData.ethnicity} onChange={handleChange} />
                  <Input label="Religion" name="religion" value={formData.religion} onChange={handleChange} />
                </div>

                <h2 className="text-lg font-medium mt-8 mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} required />
                  <Input label="Email" type="email" name="email" value={formData.email} onChange={handleChange} />
                  <TextArea label="Address" name="address" value={formData.address} onChange={handleChange} required rows={3} />
                  <Input label="Emergency Contact" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} required />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-medium mb-4">Medical Information</h2>
                <div className="space-y-4">
                  <Input label="Health Issue" name="healthIssue" value={formData.healthIssue} onChange={handleChange} required />
                  <TextArea label="Diagnosis" name="diagnosis" value={formData.diagnosis} onChange={handleChange} required rows={2} />
                  <TextArea label="Allergies" name="allergies" value={formData.allergies} onChange={handleChange} required rows={2} />
                  <TextArea label="Medications" name="medications" value={formData.medications} onChange={handleChange} required rows={3} />
                  <Input label="Drug" name="drug" value={formData.drug} onChange={handleChange} />
                  <Input label="First Care Unit" name="firstCareUnit" value={formData.firstCareUnit} onChange={handleChange} />
                  <Input label="Last Care Unit" name="lastCareUnit" value={formData.lastCareUnit} onChange={handleChange} />
                  <Input label="Doctor's Name" name="doctorName" value={formData.doctorName} onChange={handleChange} required />
                  <Input label="Doctor's Email" type="email" name="doctorEmail" value={formData.doctorEmail} onChange={handleChange} required />
                  <TextArea label="Additional Notes" name="notes" value={formData.notes} onChange={handleChange} rows={4} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" className="mr-4" onClick={() => navigate('/admin')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isLoading} leftIcon={<Save size={16} />}>
                {isEditMode ? 'Update Patient' : 'Save Patient'}
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>

      {/* --- Separate File Upload Section --- */}
      <Card>
        <Card.Body>
          <h2 className="text-lg font-medium mb-4">Upload Files (Independent)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload PDF</label>
              <input type="file" accept=".pdf" onChange={handlePdfChange} className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload CSV</label>
              <input type="file" accept=".csv" onChange={handleCsvChange} className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer" />
            </div>
            <Button type="button" variant="primary" isLoading={isLoading} leftIcon={<Upload size={16} />} onClick={handleFileUpload}>
              Upload Selected Files
            </Button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default PatientForm;
