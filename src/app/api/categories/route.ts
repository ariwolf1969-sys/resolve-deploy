import { NextResponse } from 'next/server';

const categories = [
  { id: 'all', name: 'Todas', icon: 'Grid3X3', color: '#6B7280' },
  { id: 'trabajo', name: 'Trabajo inmediato', icon: 'Briefcase', color: '#F59E0B' },
  { id: 'servicios', name: 'Servicios', icon: 'Wrench', color: '#3B82F6' },
  { id: 'mandados', name: 'Mandados / Envios', icon: 'Package', color: '#10B981' },
  { id: 'ayuda', name: 'Ayuda puntual', icon: 'HandHelping', color: '#8B5CF6' },
  { id: 'ofertas', name: 'Ofertas de trabajo', icon: 'Megaphone', color: '#EF4444' },
];

export async function GET() {
  return NextResponse.json(categories);
}
