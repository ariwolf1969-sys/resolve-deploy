import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Clear existing data
    await db.message.deleteMany()
    await db.chatThreadParticipant.deleteMany()
    await db.chatThread.deleteMany()
    await db.transaction.deleteMany()
    await db.affiliateClick.deleteMany()
    await db.affiliateProduct.deleteMany()
    await db.rating.deleteMany()
    await db.quote.deleteMany()
    await db.response.deleteMany()
    await db.need.deleteMany()
    await db.dispute.deleteMany()
    await db.checkIn.deleteMany()
    await db.user.deleteMany()

    // Create sample users
    const password = await bcrypt.hash('demo1234', 10)

    const professionals = [
      {
        name: 'Carlos García',
        email: 'carlos@resolve.ar',
        phone: '+5411559764101',
        password,
        role: 'professional',
        profession: 'electricista',
        bio: 'Electricista matriculado con 15 años de experiencia en instalaciones residenciales y comerciales.',
        city: 'Buenos Aires',
        province: 'CABA',
        hourlyRate: 5000,
        rating: 4.8,
        reviewCount: 23,
        isVerified: true,
        skills: JSON.stringify(['Instalaciones eléctricas', 'Cableado', 'Termomagnéticas', 'Puesta a tierra']),
        experience: '15 años',
        education: 'Universidad Tecnológica Nacional',
      },
      {
        name: 'María López',
        email: 'maria@resolve.ar',
        phone: '+5411559764102',
        password,
        role: 'professional',
        profession: 'plomero',
        bio: 'Plomera profesional especializada en reparaciones y nuevas instalaciones.',
        city: 'Buenos Aires',
        province: 'CABA',
        hourlyRate: 4500,
        rating: 4.6,
        reviewCount: 18,
        isVerified: true,
        skills: JSON.stringify(['Cañerías', 'Sanitarios', 'Gas', 'Calefacción']),
        experience: '10 años',
      },
      {
        name: 'Juan Martínez',
        email: 'juan@resolve.ar',
        phone: '+5411559764103',
        password,
        role: 'professional',
        profession: 'albañil',
        bio: 'Albañil con amplia experiencia en construcción y reformas.',
        city: 'Córdoba',
        province: 'Córdoba',
        hourlyRate: 4000,
        rating: 4.7,
        reviewCount: 31,
        isVerified: true,
        skills: JSON.stringify(['Mampostería', 'Revoque', 'Contrapisos', 'Cerámicos']),
        experience: '20 años',
      },
      {
        name: 'Ana Rodríguez',
        email: 'ana@resolve.ar',
        phone: '+5411559764104',
        password,
        role: 'professional',
        profession: 'pintor',
        bio: 'Pintora profesional. Trabajos de calidad con materiales premium.',
        city: 'Buenos Aires',
        province: 'CABA',
        hourlyRate: 3500,
        rating: 4.5,
        reviewCount: 15,
        isVerified: true,
        skills: JSON.stringify(['Pintura interior', 'Pintura exterior', 'Decoración', 'Impermeabilización']),
        experience: '8 años',
      },
      {
        name: 'Roberto Sánchez',
        email: 'roberto@resolve.ar',
        phone: '+5411559764105',
        password,
        role: 'professional',
        profession: 'gasista',
        bio: 'Gasista matriculado. Instalaciones seguras y certificadas.',
        city: 'Rosario',
        province: 'Santa Fe',
        hourlyRate: 5500,
        rating: 4.9,
        reviewCount: 42,
        isVerified: true,
        skills: JSON.stringify(['Gas natural', 'Gas envasado', 'Calefones', 'Estufas']),
        experience: '12 años',
      },
      {
        name: 'Laura Fernández',
        email: 'laura@resolve.ar',
        phone: '+5411559764106',
        password,
        role: 'professional',
        profession: 'peluquero',
        bio: 'Peluquera profesional. Cortes modernos, coloración y tratamientos capilares.',
        city: 'Buenos Aires',
        province: 'CABA',
        hourlyRate: 3000,
        rating: 4.7,
        reviewCount: 56,
        isVerified: true,
        skills: JSON.stringify(['Cortes de pelo', 'Coloración', 'Mechas', 'Tratamientos capilares']),
        experience: '9 años',
      },
      {
        name: 'Pedro Gómez',
        email: 'pedro@resolve.ar',
        phone: '+5411559764107',
        password,
        role: 'professional',
        profession: 'chofer',
        bio: 'Chofer profesional. Servicios de traslado, viajes y mudanzas.',
        city: 'Buenos Aires',
        province: 'CABA',
        hourlyRate: 2500,
        rating: 4.4,
        reviewCount: 28,
        isVerified: true,
        skills: JSON.stringify(['Traslados', 'Viajes largos', 'Mudanzas', 'Chofer ejecutivo']),
        experience: '7 años',
      },
      {
        name: 'Valentina Torres',
        email: 'valentina@resolve.ar',
        phone: '+5411559764108',
        password,
        role: 'professional',
        profession: 'manicura',
        bio: 'Manicura profesional. Uñas esculpidas, gel y semipermanente.',
        city: 'Córdoba',
        province: 'Córdoba',
        hourlyRate: 2000,
        rating: 4.8,
        reviewCount: 67,
        isVerified: true,
        skills: JSON.stringify(['Uñas esculpidas', 'Gel', 'Semipermanente', 'Nail art']),
        experience: '5 años',
      },
      {
        name: 'Diego Ruiz',
        email: 'diego@resolve.ar',
        phone: '+5411559764109',
        password,
        role: 'professional',
        profession: 'apoyo-escolar',
        bio: 'Profesor particular. Matemática, física y química para todos los niveles.',
        city: 'Buenos Aires',
        province: 'CABA',
        hourlyRate: 3500,
        rating: 4.9,
        reviewCount: 89,
        isVerified: true,
        skills: JSON.stringify(['Matemática', 'Física', 'Química', 'Estudio dirigido']),
        experience: '11 años',
      },
      {
        name: 'Lucía Morales',
        email: 'lucia@resolve.ar',
        phone: '+5411559764110',
        password,
        role: 'professional',
        profession: 'cerrajero',
        bio: 'Cerrajera las 24hs. Aperturas, cerraduras y sistemas de seguridad.',
        city: 'Buenos Aires',
        province: 'CABA',
        hourlyRate: 4500,
        rating: 4.3,
        reviewCount: 14,
        isVerified: true,
        skills: JSON.stringify(['Aperturas de emergencia', 'Cerraduras', 'Cajas de seguridad', 'Automotriz']),
        experience: '6 años',
      },
    ]

    for (const prof of professionals) {
      await db.user.create({ data: prof })
    }

    // Create sample products
    const products = [
      {
        title: 'Kit de Herramientas Profesional 120 piezas',
        description: 'Set completo de herramientas para profesionales del hogar',
        price: 15999,
        originalPrice: 22999,
        imageUrl: '/images/toolkit.jpg',
        sourceUrl: '#',
        source: 'MercadoLibre',
        category: 'herramientas',
        isFeatured: true,
        isPopular: true,
      },
      {
        title: 'Taladro Percutor Inalámbrico 20V',
        description: 'Potente taladro con batería de litio de larga duración',
        price: 45999,
        originalPrice: 59999,
        imageUrl: '/images/drill.jpg',
        sourceUrl: '#',
        source: 'Amazon',
        category: 'herramientas',
        isFeatured: true,
        isPopular: true,
      },
      {
        title: 'Cable Eléctrico 2.5mm x 100m',
        description: 'Cable unipolar para instalaciones eléctricas',
        price: 8999,
        originalPrice: 11999,
        imageUrl: '/images/cable.jpg',
        sourceUrl: '#',
        source: 'MercadoLibre',
        category: 'materiales',
        isFeatured: true,
        isPopular: false,
      },
      {
        title: 'Pintura Látex Premium 20L',
        description: 'Pintura de alta calidad para interiores y exteriores',
        price: 18500,
        originalPrice: 24000,
        imageUrl: '/images/paint.jpg',
        sourceUrl: '#',
        source: 'Amazon',
        category: 'pintura',
        isFeatured: false,
        isPopular: true,
      },
      {
        title: 'Set de Llaves Tubulares 1/2"',
        description: 'Juego completo de llaves tubulares de alta resistencia',
        price: 12999,
        originalPrice: 16999,
        imageUrl: '/images/wrenches.jpg',
        sourceUrl: '#',
        source: 'MercadoLibre',
        category: 'herramientas',
        isFeatured: true,
        isPopular: true,
      },
      {
        title: 'Tanque de Gas Envasado 10kg',
        description: 'Gas envasado con certificación de seguridad',
        price: 5200,
        originalPrice: 5800,
        imageUrl: '/images/gas.jpg',
        sourceUrl: '#',
        source: 'Tienda Local',
        category: 'gas',
        isFeatured: false,
        isPopular: true,
      },
    ]

    for (const prod of products) {
      await db.affiliateProduct.create({ data: prod })
    }

    // Create sample quotes
    const users = await db.user.findMany()
    const prof1 = users.find(u => u.email === 'carlos@resolve.ar')!
    const prof2 = users.find(u => u.email === 'maria@resolve.ar')!
    const prof3 = users.find(u => u.email === 'roberto@resolve.ar')!

    const quotes = [
      {
        title: 'Instalación eléctrica en departamento',
        description: 'Necesito cablear un departamento de 2 ambientes',
        status: 'completed',
        price: 45000,
        urgency: 'high',
        city: 'Buenos Aires',
        province: 'CABA',
        senderId: users[0]?.id,
        receiverId: prof1.id,
      },
      {
        title: 'Reparación de cañería',
        description: 'Fuga de agua en cocina',
        status: 'pending',
        price: 12000,
        urgency: 'medium',
        city: 'Buenos Aires',
        province: 'CABA',
        senderId: users[1]?.id,
        receiverId: prof2.id,
      },
      {
        title: 'Instalación de calefón',
        description: 'Cambio de calefón viejo por uno nuevo',
        status: 'accepted',
        price: 25000,
        urgency: 'low',
        city: 'Rosario',
        province: 'Santa Fe',
        senderId: users[2]?.id,
        receiverId: prof3.id,
      },
    ]

    for (const quote of quotes) {
      await db.quote.create({ data: quote })
    }

    return NextResponse.json({ success: true, message: 'Datos de ejemplo cargados' })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Error al cargar datos' }, { status: 500 })
  }
}
