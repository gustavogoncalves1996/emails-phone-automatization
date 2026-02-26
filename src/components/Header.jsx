import { Globe, GlobeOff, Users, Send } from 'lucide-react';

export default function Header({ leadsCount, semSiteCount, enviadosCount }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Globe size={22} />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                WebDev Portugal
              </h1>
              <p className="text-xs text-gray-500 -mt-0.5">
                Prospeção de Clientes
              </p>
            </div>
          </div>

          {/* Stats pills */}
          {leadsCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                <Users size={13} className="text-gray-500" />
                <span className="text-xs font-medium text-gray-700">
                  {leadsCount} lead{leadsCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full">
                <GlobeOff size={13} className="text-amber-600" />
                <span className="text-xs font-medium text-amber-700">
                  {semSiteCount} sem site
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full">
                <Send size={13} className="text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  {enviadosCount} enviado{enviadosCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
