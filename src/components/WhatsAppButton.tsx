'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { MESS_DETAILS } from '@/lib/constants';

export default function WhatsAppButton() {
  return (
    <a
      href={MESS_DETAILS.whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-3.5 rounded-full shadow-2xl shadow-emerald-900/60 transition-all duration-300 hover:scale-105 group"
      style={{ fontFamily: 'var(--font-sans, sans-serif)' }}
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-20 pointer-events-none" />

      {/* WhatsApp Icon */}
      <svg 
        viewBox="0 0 24 24" 
        className="w-6 h-6 fill-white flex-shrink-0" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.112 1.534 5.836L.057 23.667a.5.5 0 0 0 .642.606l5.96-1.96A11.936 11.936 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.8 9.8 0 0 1-4.988-1.366l-.358-.212-3.718 1.222 1.245-3.609-.232-.37A9.816 9.816 0 0 1 2.182 12C2.182 6.564 6.564 2.182 12 2.182S21.818 6.564 21.818 12 17.436 21.818 12 21.818z"/>
      </svg>

      {/* Label — shows on hover */}
      <span className="text-sm font-extrabold whitespace-nowrap overflow-hidden max-w-0 group-hover:max-w-[120px] transition-all duration-300 opacity-0 group-hover:opacity-100">
        Chat with Us
      </span>
    </a>
  );
}
