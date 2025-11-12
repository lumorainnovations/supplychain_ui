import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, Shield, Download, Upload, FileText } from 'lucide-react';
import { User } from '../types';
import UserForm from './forms/UserForm';
import UserTable from './tables/UserTable';
import { apiService } from '../services/api';
import { useApiMutation } from '../hooks/useApi';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const { mutate: createUserMutation, loading: createLoading } = useApiMutation();
  const { mutate: updateUserMutation, loading: updateLoading } = useApiMutation();
  const { mutate: deleteUserMutation, loading: deleteLoading } = useApiMutation();
  const { mutate: toggleStatusMutation, loading: toggleLoading } = useApiMutation();

  const roleOptions = ['all', 'admin', 'manager', 'operator', 'viewer'];
  const statusOptions = ['all', 'active', 'inactive', 'suspended'];

  // Load users from API
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getUsers();
      const usersWithCamelCase = (response.users || []).map(user => ({
        ...user,
        hireDate: user.hireDate || user.hire_date,
        lastLogin: user.lastLogin || user.last_login,
      }));
      setUsers(usersWithCamelCase);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load users');
      console.error('Load users error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = async (newUser: Omit<User, 'id'> & { confirmPassword?: string; avatar?: string; jobTitle?: string; hireDate?: string; lastLogin?: string }) => {
    try {
      // Remove only confirmPassword, avatar, and lastLogin before sending to backend
      const { confirmPassword: _omit, avatar: _omitAvatar, lastLogin: _omitLastLogin, ...userData } = newUser;
      await createUserMutation(() => apiService.createUser(userData));
      await loadUsers(); // Reload users after creation
      setShowForm(false);
    } catch (error: any) {
      console.error('Create user error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleEditUser = async (updatedUser: User) => {
    try {
      await updateUserMutation(() => apiService.updateUser(updatedUser.id, updatedUser));
      await loadUsers(); // Reload users after update
      setEditingUser(null);
      setShowForm(false);
    } catch (error: any) {
      console.error('Update user error:', error);
      // Error is handled by the mutation hook
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUserMutation(() => apiService.deleteUser(id));
        await loadUsers(); // Reload users after deletion
      } catch (error: any) {
        console.error('Delete user error:', error);
        // Error is handled by the mutation hook
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatusMutation(() => apiService.toggleUserStatus(id));
      await loadUsers(); // Reload users after status change
    } catch (error: any) {
      console.error('Toggle user status error:', error);
      // Error is handled by the mutation hook
    }
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Department', 'Status', 'Job Title', 'Hire Date', 'Permissions'];
    const csvContent = [
      headers.join(','),
      ...users.map(user => [
        user.id,
        `"${user.name}"`,
        user.email,
        user.phone || '',
        user.role,
        `"${user.department}"`,
        user.status || 'active',
        `"${user.jobTitle || ''}"`,
        user.hireDate || '',
        `"${(user.permissions || []).join(';')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n');
      const headers = lines[0].split(',');
      
      const importedUsers = lines.slice(1)
        .filter(line => line.trim())
        .map((line) => {
          const values = line.split(',').map(val => val.replace(/"/g, ''));
          return {
            name: values[1] || '',
            email: values[2] || '',
            phone: values[3] || '',
            role: (values[4] as User['role']) || 'operator',
            department: values[5] || '',
            status: (values[6] as User['status']) || 'active',
            jobTitle: values[7] || '',
            hireDate: values[8] || '',
            permissions: values[9] ? values[9].split(';') : [],
            password: 'password123' // Default password for imported users
          };
        });

      // Import users one by one
      for (const userData of importedUsers) {
        try {
          await createUserMutation(() => apiService.createUser(userData));
        } catch (error) {
          console.error('Failed to import user:', userData.email, error);
        }
      }
      
      await loadUsers(); // Reload users after import
    };
    reader.readAsText(file);
    
    // Reset the input
    event.target.value = '';
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['ID', 'Name', 'Email', 'Phone', 'Role', 'Department', 'Status', 'Job Title', 'Hire Date', 'Permissions'],
      ['USR-001', 'John Smith', 'john.smith@company.com', '+1-555-0201', 'operator', 'Manufacturing', 'active', 'Production Operator', '2023-03-15', 'inventory.read;orders.read'],
      ['USR-002', 'Jane Doe', 'jane.doe@company.com', '+1-555-0202', 'manager', 'Operations', 'active', 'Operations Manager', '2022-08-10', 'inventory.read;inventory.write;orders.read;orders.write']
    ];

    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'users_sample.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusCounts = () => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      admins: users.filter(u => u.role === 'admin').length,
      managers: users.filter(u => u.role === 'manager').length
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={loadUsers}
                className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowForm(true)}
              disabled={createLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{createLoading ? 'Creating...' : 'Add User'}</span>
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="csv-import-users"
              />
              <label
                htmlFor="csv-import-users"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex items-center space-x-2"
              >
                <Upload className="w-4 h-4" />
                <span>Import CSV</span>
              </label>
            </div>
            <button
              onClick={exportToCSV}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={downloadSampleCSV}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Sample CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-red-600">{statusCounts.inactive}</p>
            </div>
            <Users className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-2xl font-bold text-orange-600">{statusCounts.suspended}</p>
            </div>
            <Users className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-purple-600">{statusCounts.admins}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Managers</p>
              <p className="text-2xl font-bold text-indigo-600">{statusCounts.managers}</p>
            </div>
            <Shield className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {roleOptions.map(role => (
                <option key={role} value={role}>
                  {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Import Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">CSV Import Instructions</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Download the sample CSV file to see the required format</p>
          <p>• Required fields: Name, Email, Role, Department</p>
          <p>• Default password 'password123' will be set for imported users</p>
          <p>• Permissions should be separated by semicolons (;)</p>
          <p>• Valid roles: admin, manager, operator, viewer</p>
          <p>• Valid status: active, inactive, suspended</p>
        </div>
      </div>

      {/* Role Permissions Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-red-600" />
              <h4 className="font-medium text-gray-900">Admin</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Full system access</li>
              <li>• User management</li>
              <li>• System configuration</li>
              <li>• All modules access</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-gray-900">Manager</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Department management</li>
              <li>• Reports and analytics</li>
              <li>• Order approval</li>
              <li>• Team oversight</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-gray-900">Operator</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Data entry</li>
              <li>• Order processing</li>
              <li>• Inventory updates</li>
              <li>• Basic reporting</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Shield className="w-5 h-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Viewer</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Read-only access</li>
              <li>• View reports</li>
              <li>• Dashboard access</li>
              <li>• No modifications</li>
            </ul>
          </div>
        </div>
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        onEdit={openEditForm}
        onDelete={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
      />

      {/* User Form Modal */}
      {showForm && (
        <UserForm
          user={editingUser}
          onSave={editingUser ? handleEditUser : handleAddUser}
          onCancel={closeForm}
        />
      )}

      {/* Loading overlay for operations */}
      {(updateLoading || deleteLoading || toggleLoading) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-900">
              {updateLoading && 'Updating user...'}
              {deleteLoading && 'Deleting user...'}
              {toggleLoading && 'Updating status...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;