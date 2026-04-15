import { Link } from 'react-router-dom';
import { Smartphone, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 text-white mb-4">
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">MobRepair</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Professional mobile repair training and learning platform with hands-on, practical courses.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-cyan-400 transition-colors">📞 647-849-9722</li>
              <li className="hover:text-cyan-400 transition-colors">📞 416-831-5257</li>
              <li className="hover:text-cyan-400 transition-colors">📱 905-781-1209 (WhatsApp)</li>
              <li className="hover:text-cyan-400 transition-colors">📍 Mississauga Location</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Course Locations</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-cyan-400 transition-colors">Toronto & Mississauga</li>
              <li className="hover:text-cyan-400 transition-colors">Ottawa & Montreal</li>
              <li className="hover:text-cyan-400 transition-colors">Calgary & Edmonton</li>
              <li className="hover:text-cyan-400 transition-colors">Vancouver & Other Cities</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-lg">Resources</h3>
            <div className="flex items-center gap-3">
              <a href="#" className="text-sm text-slate-400">Help Center</a>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm">
          <p className="text-slate-400">&copy; 2025 <span className="text-cyan-400 font-semibold">MobRepair</span>. All rights reserved. | Professional Mobile Repair Training Platform</p>
        </div>
      </div>
    </footer>
  );
}
