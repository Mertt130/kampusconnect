'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  
  const [emailData, setEmailData] = useState({
    newEmail: '',
    confirmEmail: '',
    password: '',
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    newMessages: true,
    marketingEmails: false,
  });
  
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
  });

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (emailData.newEmail !== emailData.confirmEmail) {
      toast.error('Email adresleri eşleşmiyor');
      return;
    }
    
    setLoading(true);
    try {
      // API call would go here
      toast.success('Email değiştirme bağlantısı gönderildi');
      setEmailData({ newEmail: '', confirmEmail: '', password: '' });
    } catch (error) {
      toast.error('Email değiştirilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
      return;
    }
    
    setLoading(true);
    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Şifre başarıyla değiştirildi');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Şifre değiştirilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSave = async () => {
    setLoading(true);
    try {
      // API call would go here
      toast.success('Bildirim ayarları güncellendi');
    } catch (error) {
      toast.error('Ayarlar güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handlePrivacySave = async () => {
    setLoading(true);
    try {
      // API call would go here
      toast.success('Gizlilik ayarları güncellendi');
    } catch (error) {
      toast.error('Ayarlar güncellenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!')) {
      return;
    }
    
    const confirmText = prompt('Hesabınızı silmek için "SİL" yazın:');
    if (confirmText !== 'SİL') {
      toast.error('İşlem iptal edildi');
      return;
    }
    
    setLoading(true);
    try {
      await api.deleteUser('me');
      toast.success('Hesabınız silindi');
      logout();
    } catch (error) {
      toast.error('Hesap silinemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Ayarlar</h1>
          <p className="text-gray-600">Hesap ve uygulama ayarlarınızı yönetin</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 px-6 py-3 text-center font-medium transition whitespace-nowrap ${
                activeTab === 'account'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>👤</span>
                <span>Hesap Bilgileri</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-6 py-3 text-center font-medium transition whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>🔔</span>
                <span>Bildirim Tercihleri</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 px-6 py-3 text-center font-medium transition whitespace-nowrap ${
                activeTab === 'privacy'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>🔒</span>
                <span>Gizlilik & Güvenlik</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('danger')}
              className={`flex-1 px-6 py-3 text-center font-medium transition whitespace-nowrap ${
                activeTab === 'danger'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>⚠️</span>
                <span>Hesap Yönetimi</span>
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-8">
              {/* Change Email */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Email Değiştir</h3>
                <form onSubmit={handleEmailChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mevcut Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yeni Email
                    </label>
                    <input
                      type="email"
                      value={emailData.newEmail}
                      onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yeni Email (Tekrar)
                    </label>
                    <input
                      type="email"
                      value={emailData.confirmEmail}
                      onChange={(e) => setEmailData({ ...emailData, confirmEmail: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mevcut Şifre
                    </label>
                    <input
                      type="password"
                      value={emailData.password}
                      onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Email Değiştir
                  </button>
                </form>
              </div>

              <hr />

              {/* Change Password */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Şifre Değiştir</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mevcut Şifre
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yeni Şifre (Tekrar)
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    Şifre Değiştir
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Bildirim Tercihleri</h3>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Bildirimleri</p>
                    <p className="text-sm text-gray-600">Önemli güncellemeleri email ile al</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Başvuru Güncellemeleri</p>
                    <p className="text-sm text-gray-600">Başvuru durumu değişikliklerinde bildirim al</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.applicationUpdates}
                    onChange={(e) => setNotifications({ ...notifications, applicationUpdates: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Yeni Mesajlar</p>
                    <p className="text-sm text-gray-600">Yeni mesaj aldığında bildirim gönder</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.newMessages}
                    onChange={(e) => setNotifications({ ...notifications, newMessages: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pazarlama Emailleri</p>
                    <p className="text-sm text-gray-600">Yeni özellikler ve kampanyalar hakkında bilgi al</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.marketingEmails}
                    onChange={(e) => setNotifications({ ...notifications, marketingEmails: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
              
              <button
                onClick={handleNotificationSave}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Gizlilik Ayarları</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profil Görünürlüğü
                  </label>
                  <select
                    value={privacy.profileVisibility}
                    onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="public">Herkese Açık</option>
                    <option value="companies">Sadece Şirketler</option>
                    <option value="private">Gizli</option>
                  </select>
                </div>
                
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Adresini Göster</p>
                    <p className="text-sm text-gray-600">Profilinde email adresini göster</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showEmail}
                    onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                
                <label className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Telefon Numarasını Göster</p>
                    <p className="text-sm text-gray-600">Profilinde telefon numaranı göster</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacy.showPhone}
                    onChange={(e) => setPrivacy({ ...privacy, showPhone: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
              </div>
              
              <button
                onClick={handlePrivacySave}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-900 mb-2">Tehlikeli Bölge</h3>
                <p className="text-red-700 mb-4">
                  Bu işlemler geri alınamaz. Lütfen dikkatli olun.
                </p>
                
                <div className="space-y-4">
                  <div className="border-t border-red-200 pt-4">
                    <h4 className="font-medium text-red-900 mb-2">Hesabı Sil</h4>
                    <p className="text-sm text-red-700 mb-3">
                      Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinecektir. 
                      Bu işlem geri alınamaz.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                      Hesabımı Kalıcı Olarak Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
