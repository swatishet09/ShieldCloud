// import { useState, FormEvent } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, User, UserPlus, Phone, Mail, Trash2 } from 'lucide-react';
// import Card from '../../components/ui/Card';
// import Button from '../../components/ui/Button';
// import Input from '../../components/ui/Input';
// import Select from '../../components/ui/Select';
// import { useData } from '../../hooks/useData';
// import { useAuth } from '../../hooks/useAuth';
// import { formatDate } from '../../utils/helpers';
// import { UserRole } from '../../types';

// function StaffManagement() {
//   const navigate = useNavigate();
//   const { staffMembers, addStaffMember, deleteStaffMember } = useData();
//   const { createStaffAccount, error: authError } = useAuth();
  
//   const [isFormVisible, setIsFormVisible] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     role: 'doctor' as Exclude<UserRole, 'admin'>,
//     department: '',
//     specialization: '',
//     contactNumber: '',
//   });
  
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setError(null);
//   };
  
//   const validateForm = () => {
//     if (formData.password !== formData.confirmPassword) {
//       setError("Passwords don't match");
//       return false;
//     }
    
//     if (formData.password.length < 6) {
//       setError('Password must be at least 6 characters long');
//       return false;
//     }
    
//     return true;
//   };
  
//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
    
//     if (!validateForm()) {
//       return;
//     }
    
//     setIsLoading(true);
    
//     try {
//       // Create user account for authentication
//       const success = await createStaffAccount({
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//         role: formData.role,
//       });
      
//       if (!success) {
//         setError(authError || 'Failed to create staff account');
//         setIsLoading(false);
//         return;
//       }
      
//       // Add staff member details
//       addStaffMember({
//         name: formData.name,
//         email: formData.email,
//         role: formData.role,
//         department: formData.department,
//         specialization: formData.specialization,
//         contactNumber: formData.contactNumber,
//       });
      
//       // Reset form and hide it
//       setFormData({
//         name: '',
//         email: '',
//         password: '',
//         confirmPassword: '',
//         role: 'doctor',
//         department: '',
//         specialization: '',
//         contactNumber: '',
//       });
//       setIsFormVisible(false);
//     } catch (err) {
//       setError('An error occurred while creating the staff account');
//     } finally {
//       setIsLoading(false);
//     }
//   };
  
//   const handleDelete = (id: string) => {
//     if (window.confirm('Are you sure you want to remove this staff member?')) {
//       deleteStaffMember(id);
//     }
//   };
  
//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
//         <div className="flex space-x-3">
//           <Button
//             onClick={() => navigate('/admin')}
//             variant="outline"
//             leftIcon={<ArrowLeft size={16} />}
//           >
//             Back to Dashboard
//           </Button>
//           <Button
//             onClick={() => setIsFormVisible(!isFormVisible)}
//             variant="primary"
//             leftIcon={<UserPlus size={16} />}
//           >
//             {isFormVisible ? 'Cancel' : 'Add Staff Member'}
//           </Button>
//         </div>
//       </div>
      
//       {isFormVisible && (
//         <Card className="mb-8">
//           <Card.Header>
//             <h2 className="text-lg font-medium">Add New Staff Member</h2>
//           </Card.Header>
//           <Card.Body>
//             {error && (
//               <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
//                 {error}
//               </div>
//             )}
            
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                 <Input
//                   label="Full Name"
//                   id="name"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   required
//                 />
                
//                 <Input
//                   label="Email"
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                 />
                
//                 <Input
//                   label="Password"
//                   type="password"
//                   id="password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   required
//                   helperText="Minimum 6 characters"
//                 />
                
//                 <Input
//                   label="Confirm Password"
//                   type="password"
//                   id="confirmPassword"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   required
//                 />
                
//                 <Select
//                   label="Role"
//                   id="role"
//                   name="role"
//                   value={formData.role}
//                   onChange={handleChange}
//                   required
//                   options={[
//                     { value: 'doctor', label: 'Doctor' },
//                     { value: 'staff', label: 'Staff' }
//                   ]}
//                 />
                
//                 <Input
//                   label="Department"
//                   id="department"
//                   name="department"
//                   value={formData.department}
//                   onChange={handleChange}
//                   placeholder="e.g., Cardiology, Oncology"
//                 />
                
//                 <Input
//                   label="Specialization"
//                   id="specialization"
//                   name="specialization"
//                   value={formData.specialization}
//                   onChange={handleChange}
//                   placeholder="e.g., Pediatric, Surgery"
//                 />
                
//                 <Input
//                   label="Contact Number"
//                   id="contactNumber"
//                   name="contactNumber"
//                   value={formData.contactNumber}
//                   onChange={handleChange}
//                 />
//               </div>
              
//               <div className="flex justify-end pt-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   className="mr-4"
//                   onClick={() => setIsFormVisible(false)}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   type="submit"
//                   variant="primary"
//                   isLoading={isLoading}
//                 >
//                   Add Staff Member
//                 </Button>
//               </div>
//             </form>
//           </Card.Body>
//         </Card>
//       )}
      
//       <Card>
//         <Card.Header>
//           <h2 className="text-lg font-medium">Staff Directory</h2>
//         </Card.Header>
//         <div>
//           {staffMembers.length > 0 ? (
//             <ul className="divide-y divide-gray-200">
//               {staffMembers.map((staff) => (
//                 <li key={staff.id} className="p-4 hover:bg-gray-50">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-start">
//                       <div className="flex-shrink-0">
//                         <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
//                           <User size={20} />
//                         </div>
//                       </div>
//                       <div className="ml-4">
//                         <h3 className="text-lg font-medium text-gray-900">{staff.name}</h3>
//                         <div className="flex items-center mt-1">
//                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800 capitalize">
//                             {staff.role}
//                           </span>
//                           {staff.department && (
//                             <span className="ml-2 text-sm text-gray-500">
//                               {staff.department}
//                             </span>
//                           )}
//                         </div>
//                         {staff.specialization && (
//                           <p className="mt-1 text-sm text-gray-500">
//                             {staff.specialization}
//                           </p>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex flex-col items-end">
//                       <div className="flex items-center text-sm text-gray-500 mb-1">
//                         <Mail size={14} className="mr-1" />
//                         {staff.email}
//                       </div>
//                       {staff.contactNumber && (
//                         <div className="flex items-center text-sm text-gray-500">
//                           <Phone size={14} className="mr-1" />
//                           {staff.contactNumber}
//                         </div>
//                       )}
//                       <div className="mt-2 text-xs text-gray-400">
//                         Added: {formatDate(staff.createdAt)}
//                       </div>
//                       <button
//                         onClick={() => handleDelete(staff.id)}
//                         className="mt-2 text-red-600 hover:text-red-900 inline-flex items-center text-sm"
//                       >
//                         <Trash2 size={14} className="mr-1" />
//                         Remove
//                       </button>
//                     </div>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <div className="p-6 text-center text-gray-500">
//               <p>No staff members found. Add your first staff member using the button above.</p>
//             </div>
//           )}
//         </div>
//       </Card>
//     </div>
//   );
// }

// export default StaffManagement;