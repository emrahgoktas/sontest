import React from 'react';
import { ArrowRight, BookOpen, Users, Award, Zap, LogIn, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

/**
 * Welcome Page Component
 * Landing page that introduces the application and guides users to login/register
 */

export const WelcomePage: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Navigate to login page
   */
  const handleLogin = () => {
    navigate('/login');
  };

  /**
   * Navigate to register page
   */
  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Akıllı Test Oluşturucu</h1>
                <p className="text-sm text-gray-500 hidden sm:block">
                  PDF'den soru kırpma ve test oluşturma uygulaması
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleLogin}
                icon={LogIn}
              >
                Giriş Yap
              </Button>
              <Button
                onClick={handleRegister}
                icon={UserPlus}
              >
                Kayıt Ol
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto text-center space-y-8 py-16 px-4">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Akıllı Test Oluşturucu'ya
            <span className="text-blue-600 block">Hoş Geldiniz!</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sınav, kitapçık ve optik form oluşturmak için gelişmiş araçlar. 
            Öğretmenler için tasarlanmış profesyonel çözümlerle eğitim sürecinizi kolaylaştırın.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hızlı ve Kolay</h3>
            <p className="text-gray-600 text-sm">
              PDF'den soru kırpma, test oluşturma ve kitapçık hazırlama işlemlerini dakikalar içinde tamamlayın.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Online Sınavlar</h3>
            <p className="text-gray-600 text-sm">
              Testlerinizi online sınav olarak yayınlayın ve öğrencilerinizin performansını takip edin.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profesyonel Kalite</h3>
            <p className="text-gray-600 text-sm">
              Matbaa kalitesinde PDF çıktıları ve özelleştirilebilir temalarla profesyonel sonuçlar alın.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Başlamaya Hazır mısınız?
          </h2>
          <p className="text-gray-600 mb-6">
            Sadece birkaç adımda hesabınızı oluşturun ve güçlü araçlarımızı kullanmaya başlayın.
            Zaten hesabınız varsa giriş yapabilirsiniz.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleRegister}
              size="lg"
              icon={UserPlus}
              className="px-8 py-3"
            >
              Ücretsiz Kayıt Ol
            </Button>
            
            <Button
              variant="outline"
              onClick={handleLogin}
              size="lg"
              icon={LogIn}
              className="px-8 py-3"
            >
              Giriş Yap
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">1000+</div>
            <div className="text-sm text-gray-600">Öğretmen</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">50K+</div>
            <div className="text-sm text-gray-600">Test Oluşturuldu</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">100K+</div>
            <div className="text-sm text-gray-600">Soru Kırpıldı</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">25K+</div>
            <div className="text-sm text-gray-600">Online Sınav</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">© 2025 Akıllı Test Oluşturucu - Tüm hakları saklıdır.</p>
            <p className="text-gray-500 text-sm mt-2">
              Eğitim teknolojileri ile geliştirilmiştir.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};