import React from 'react';
import { ArrowRight, BookOpen, Users, Award, Zap } from 'lucide-react';
import { Button } from '../../ui/Button';

/**
 * Wizard Başlangıç Adımı
 * Kullanıcıyı karşılayan ve sistemi tanıtan ekran
 */

interface WelcomeStepProps {
  onNext: () => void;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext }) => {
  return (
    <div className="max-w-4xl mx-auto text-center space-y-8">
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
          Sınav, kitapçık ve optik form oluşturmak için adım adım ilerleyin. 
          Öğretmenler için tasarlanmış profesyonel araçlarla eğitim sürecinizi kolaylaştırın.
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
        
        <Button
          onClick={onNext}
          size="lg"
          icon={ArrowRight}
          iconPosition="right"
          className="px-8 py-3 mb-4"
        >
          Devam Et
        </Button>
        
        <div className="text-sm text-gray-600">
          Zaten hesabınız var mı? <button 
            onClick={onNext} 
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            Giriş Yap
          </button>
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
  );
};