import React, { useState, useEffect } from 'react';
import { Search, Filter, Trash2, Edit, Crown, ArrowUp, ArrowDown, Clock, Check, X, Users, Eye, UserCheck, UserX, Shield, Calendar, Mail, School, BookOpen } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Modal } from '../../ui/Modal';
import { adminAPI } from '../../../utils/api';

/**
 * Users Table Component
 * Displays and manages all users in the system
 */

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  plan: 'free' | 'pro' | 'premium';
  createdAt: Date;
  expiresAt?: Date;
  status: 'active' | 'inactive' | 'suspended';
}

export const UsersTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof User>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedPlan, setSelectedPlan] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [extensionDays, setExtensionDays] = useState(30);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    role: 'teacher' as 'admin' | 'teacher' | 'student',
    plan: 'free' as 'free' | 'pro' | 'premium',
    schoolName: '',
    subject: '',
    gradeLevel: '',
    isActive: true
  });

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await adminAPI.getUsers();
        
        if (response.success) {
          // Transform API data to match component interface
          const transformedUsers: User[] = response.data.map((user: any) => ({
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role as 'admin' | 'teacher' | 'student',
            plan: user.plan_type as 'free' | 'pro' | 'premium',
            createdAt: new Date(user.created_at),
            status: user.is_active ? 'active' : 'inactive' as 'active' | 'inactive' | 'suspended'
          }));
        
          setUsers(transformedUsers);
          setFilteredUsers(transformedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter and sort users
  useEffect(() => {
    let result = [...users];
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(lowerSearchTerm) ||
        user.email.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply role filter
    if (selectedRole !== 'all') {
      result = result.filter(user => user.role === selectedRole);
    }
    
    // Apply plan filter
    if (selectedPlan !== 'all') {
      result = result.filter(user => user.plan === selectedPlan);
    }
    
    // Apply status filter
    if (selectedStatus !== 'all') {
      result = result.filter(user => user.status === selectedStatus);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === 'asc' 
          ? aValue.getTime() - bValue.getTime() 
          : bValue.getTime() - aValue.getTime();
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });
    
    setFilteredUsers(result);
  }, [users, searchTerm, sortField, sortDirection, selectedRole, selectedPlan, selectedStatus]);

  /**
   * Handle sort change
   */
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  /**
   * Get role badge color
   */
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get plan badge color
   */
  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'premium': return 'bg-purple-100 text-purple-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'free': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get status badge color
   */
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * View user details
   */
  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowUserDetailModal(true);
  };

  /**
   * Edit user
   */
  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      plan: user.plan,
      schoolName: (user as any).schoolName || '',
      subject: (user as any).subject || '',
      gradeLevel: (user as any).gradeLevel || '',
      isActive: user.status === 'active'
    });
    setShowEditUserModal(true);
  };

  /**
   * Save user changes
   */
  const handleSaveUserChanges = async () => {
    if (!selectedUser) return;

    try {
      // Mock API call - in real implementation would call updateUser API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? {
              ...user,
              name: editFormData.name,
              email: editFormData.email,
              role: editFormData.role,
              plan: editFormData.plan,
              status: editFormData.isActive ? 'active' : 'inactive'
            }
          : user
      ));
      
      setShowEditUserModal(false);
      alert('Kullanıcı bilgileri başarıyla güncellendi!');
    } catch (error) {
      console.error('User update error:', error);
      alert('Kullanıcı güncellenirken hata oluştu.');
    }
  };

  /**
   * Quick plan upgrade
   */
  const handleQuickPlanUpgrade = async (userId: string, newPlan: 'free' | 'pro' | 'premium') => {
    if (window.confirm(`Bu kullanıcının planını ${newPlan} olarak değiştirmek istediğinizden emin misiniz?`)) {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, plan: newPlan } : user
        ));
        
        alert(`Plan başarıyla ${newPlan} olarak güncellendi!`);
      } catch (error) {
        console.error('Plan upgrade error:', error);
        alert('Plan güncellenirken hata oluştu.');
      }
    }
  };

  /**
   * Block/Unblock user
   */
  const handleToggleUserBlock = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const action = newStatus === 'suspended' ? 'engellemek' : 'engeli kaldırmak';
    
    if (window.confirm(`Bu kullanıcıyı ${action} istediğinizden emin misiniz?`)) {
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: newStatus as 'active' | 'inactive' | 'suspended' } : user
        ));
        
        alert(`Kullanıcı başarıyla ${newStatus === 'suspended' ? 'engellendi' : 'engeli kaldırıldı'}!`);
      } catch (error) {
        console.error('User block toggle error:', error);
        alert('Kullanıcı durumu değiştirilirken hata oluştu.');
      }
    }
  };

  /**
   * Delete user
   */
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Bu kullanıcıyı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        // Mock API call
        setUsers(prev => prev.filter(user => user.id !== userId));
        alert('Kullanıcı başarıyla silindi!');
      } catch (error) {
        console.error('User delete error:', error);
        alert('Kullanıcı silinirken hata oluştu.');
      }
    }
  };

  /**
   * Format date
   */
  const formatDate = (date?: Date) => {
    if (!date) return '-';
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h2>
          <p className="text-gray-600">Tüm kullanıcıları görüntüleyin ve yönetin</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Toplam: {filteredUsers.length} kullanıcı
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Ad veya e-posta ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={16} />}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tüm Roller</option>
              <option value="admin">Admin</option>
              <option value="teacher">Öğretmen</option>
              <option value="student">Öğrenci</option>
            </select>
            
            {/* Plan Filter */}
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tüm Planlar</option>
              <option value="free">Ücretsiz</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
            
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="inactive">İnaktif</option>
              <option value="suspended">Askıya Alınmış</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Kullanıcılar yükleniyor...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Kullanıcı bulunamadı</h3>
            <p className="mt-1 text-gray-500">Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Ad Soyad</span>
                      {sortField === 'name' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('email')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>E-posta</span>
                      {sortField === 'email' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Rol</span>
                      {sortField === 'role' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('plan')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Plan</span>
                      {sortField === 'plan' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Kayıt Tarihi</span>
                      {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Durum</span>
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 font-medium">{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role === 'admin' && 'Admin'}
                        {user.role === 'teacher' && 'Öğretmen'}
                        {user.role === 'student' && 'Öğrenci'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPlanBadgeColor(user.plan)}`}>
                          {user.plan === 'premium' && 'Premium'}
                          {user.plan === 'pro' && 'Pro'}
                          {user.plan === 'free' && 'Ücretsiz'}
                        </span>
                        {user.expiresAt && (
                          <span className="text-xs text-gray-500 mt-1">
                            Bitiş: {formatDate(user.expiresAt)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                        {user.status === 'active' && 'Aktif'}
                        {user.status === 'inactive' && 'İnaktif'}
                        {user.status === 'suspended' && 'Askıda'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* View Details */}
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="mr-1.5 h-3 w-3 text-gray-400" />
                          Detay
                        </button>

                        {/* Edit User */}
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="mr-1.5 h-3 w-3 text-gray-400" />
                          Düzenle
                        </button>

                        {/* Plan Upgrade Dropdown */}
                        <select
                          value={user.plan}
                          onChange={(e) => handleQuickPlanUpgrade(user.id, e.target.value as 'free' | 'pro' | 'premium')}
                          className="px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="free">Ücretsiz</option>
                          <option value="pro">Pro</option>
                          <option value="premium">Premium</option>
                        </select>

                        {/* Block/Unblock Toggle */}
                        <button
                          type="button"
                          className={`inline-flex items-center px-2.5 py-1.5 border shadow-sm text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                            user.status === 'active'
                              ? 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                              : user.status === 'suspended'
                              ? 'border-green-300 text-green-700 bg-white hover:bg-green-50'
                              : 'border-yellow-300 text-yellow-700 bg-white hover:bg-yellow-50'
                          }`}
                          onClick={() => {
                            handleToggleUserBlock(user.id, user.status);
                          }}
                        >
                          {user.status === 'active' ? (
                            <>
                              <UserX className="mr-1.5 h-3 w-3" />
                              Engelle
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-1.5 h-3 w-3" />
                              Aktif Et
                            </>
                          )}
                        </button>

                        {/* Delete User */}
                        <button
                          type="button"
                          className="inline-flex items-center px-2.5 py-1.5 border border-red-300 shadow-sm text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <Trash2 className="mr-1.5 h-3 w-3" />
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={showUserDetailModal}
        onClose={() => setShowUserDetailModal(false)}
        title="Kullanıcı Detayları"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role === 'admin' && 'Admin'}
                    {selectedUser.role === 'teacher' && 'Öğretmen'}
                    {selectedUser.role === 'student' && 'Öğrenci'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPlanBadgeColor(selectedUser.plan)}`}>
                    {selectedUser.plan === 'premium' && 'Premium'}
                    {selectedUser.plan === 'pro' && 'Pro'}
                    {selectedUser.plan === 'free' && 'Ücretsiz'}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(selectedUser.status)}`}>
                    {selectedUser.status === 'active' && 'Aktif'}
                    {selectedUser.status === 'inactive' && 'İnaktif'}
                    {selectedUser.status === 'suspended' && 'Engellenmiş'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <Users className="mr-2" size={16} />
                  Kişisel Bilgiler
                </h4>
                <div className="space-y-3 pl-6">
                  <div className="flex items-center space-x-3">
                    <Mail size={14} className="text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">E-posta:</span>
                      <div className="font-medium">{selectedUser.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar size={14} className="text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Kayıt Tarihi:</span>
                      <div className="font-medium">{formatDate(selectedUser.createdAt)}</div>
                    </div>
                  </div>
                  {selectedUser.expiresAt && (
                    <div className="flex items-center space-x-3">
                      <Clock size={14} className="text-gray-400" />
                      <div>
                        <span className="text-sm text-gray-600">Plan Bitiş:</span>
                        <div className="font-medium">{formatDate(selectedUser.expiresAt)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center">
                  <School className="mr-2" size={16} />
                  Mesleki Bilgiler
                </h4>
                <div className="space-y-3 pl-6">
                  <div>
                    <span className="text-sm text-gray-600">Okul:</span>
                    <div className="font-medium">{(selectedUser as any).schoolName || 'Belirtilmemiş'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Branş:</span>
                    <div className="font-medium">{(selectedUser as any).subject || 'Belirtilmemiş'}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Sınıf Seviyesi:</span>
                    <div className="font-medium">{(selectedUser as any).gradeLevel || 'Belirtilmemiş'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Hızlı İşlemler</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowUserDetailModal(false);
                    handleEditUser(selectedUser);
                  }}
                  icon={Edit}
                >
                  Düzenle
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPlanUpgrade(selectedUser.id, 'pro')}
                  icon={Crown}
                  className="text-blue-600"
                >
                  Pro Yap
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickPlanUpgrade(selectedUser.id, 'premium')}
                  icon={Crown}
                  className="text-purple-600"
                >
                  Premium Yap
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleUserBlock(selectedUser.id, selectedUser.status)}
                  icon={selectedUser.status === 'active' ? UserX : UserCheck}
                  className={selectedUser.status === 'active' ? 'text-red-600' : 'text-green-600'}
                >
                  {selectedUser.status === 'active' ? 'Engelle' : 'Aktif Et'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditUserModal}
        onClose={() => setShowEditUserModal(false)}
        title="Kullanıcı Düzenle"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Ad Soyad"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                leftIcon={<Users size={16} />}
                required
              />
              
              <Input
                label="E-posta"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                leftIcon={<Mail size={16} />}
                required
              />
            </div>

            {/* Role and Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'teacher' | 'student' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="student">Öğrenci</option>
                  <option value="teacher">Öğretmen</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan
                </label>
                <select
                  value={editFormData.plan}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, plan: e.target.value as 'free' | 'pro' | 'premium' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="free">Ücretsiz</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            </div>

            {/* Professional Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Okul Adı"
                value={editFormData.schoolName}
                onChange={(e) => setEditFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                leftIcon={<School size={16} />}
              />
              
              <Input
                label="Branş"
                value={editFormData.subject}
                onChange={(e) => setEditFormData(prev => ({ ...prev, subject: e.target.value }))}
                leftIcon={<BookOpen size={16} />}
              />
              
              <Input
                label="Sınıf Seviyesi"
                value={editFormData.gradeLevel}
                onChange={(e) => setEditFormData(prev => ({ ...prev, gradeLevel: e.target.value }))}
                leftIcon={<Users size={16} />}
              />
            </div>

            {/* Status */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                checked={editFormData.isActive}
                onChange={(e) => setEditFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Kullanıcı aktif
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowEditUserModal(false)}
              >
                İptal
              </Button>
              <Button
                onClick={handleSaveUserChanges}
                icon={Check}
              >
                Değişiklikleri Kaydet
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Legacy Extend Subscription Modal - Keep for compatibility */}
      {showExtendModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Üyelik Süresini Uzat</h3>
            <p className="text-sm text-gray-600 mb-4">
              <strong>{editingUser.name}</strong> kullanıcısının üyelik süresini uzatın.
              {editingUser.expiresAt && (
                <span className="block mt-1">
                  Mevcut bitiş tarihi: <strong>{formatDate(editingUser.expiresAt)}</strong>
                </span>
              )}
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Uzatma Süresi (Gün)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={extensionDays}
                onChange={(e) => setExtensionDays(parseInt(e.target.value) || 30)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowExtendModal(false)}
              >
                İptal
              </Button>
              <Button
                onClick={() => {
                  // Mock extend subscription
                  alert(`${editingUser.name} kullanıcısının üyelik süresi ${extensionDays} gün uzatıldı!`);
                  setShowExtendModal(false);
                }}
              >
                Süreyi Uzat
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};