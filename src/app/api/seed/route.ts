import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const users = await Promise.all([
      // 1. Maria Garcia - CABA
      db.user.create({
        data: {
          name: 'Maria Garcia',
          phone: '+5491112345678',
          bio: 'Diseñadora grafica freelance. Logos, branding, redes sociales.',
          location: 'Palermo, Buenos Aires',
          neighborhood: 'Palermo',
          lat: -34.5882,
          lng: -58.4260,
          province: 'caba',
          city: 'Palermo',
          workZone: 'CABA',
          profession: 'Diseñadora grafica',
          skills: 'Photoshop, Illustrator, Figma, Canva, branding, redes sociales',
          experience: '5 años',
          hourlyRate: 15000,
          verified: true,
          dniVerified: true,
          dniNumber: '35123456',
          ratingAvg: 4.8,
          ratingCount: 12,
          completedJobs: 8,
        }
      }),
      // 2. Carlos Rodriguez - CABA
      db.user.create({
        data: {
          name: 'Carlos Rodriguez',
          phone: '+5491198765432',
          bio: 'Electricista matriculado. Instalaciones, reparaciones, tableros, termotanques. Garantia escrita en todos mis trabajos.',
          location: 'Recoleta, Buenos Aires',
          neighborhood: 'Recoleta',
          lat: -34.5931,
          lng: -58.3937,
          province: 'caba',
          city: 'Recoleta',
          workZone: 'CABA',
          profession: 'Electricista',
          skills: 'Instalaciones electricas, reparaciones, tableros, termotanques, cableado, iluminacion LED, porteros electricos',
          experience: '10 años',
          hourlyRate: 12000,
          verified: true,
          dniVerified: true,
          dniNumber: '28765432',
          ratingAvg: 4.9,
          ratingCount: 34,
          completedJobs: 28,
        }
      }),
      // 3. Lucia Fernandez - CABA
      db.user.create({
        data: {
          name: 'Lucia Fernandez',
          phone: '+5491155551234',
          bio: 'Estudiante universitaria. Disponible para mandados, cuidados y tareas puntuales.',
          location: 'Caballito, Buenos Aires',
          neighborhood: 'Caballito',
          lat: -34.6178,
          lng: -58.4338,
          province: 'caba',
          city: 'Caballito',
          workZone: 'CABA',
          profession: 'Asistente general',
          skills: 'Mandados, compras, limpieza, organizacion, cuidado de mascotas',
          experience: '2 años',
          hourlyRate: 5000,
          verified: false,
          dniVerified: false,
          ratingAvg: 4.5,
          ratingCount: 7,
          completedJobs: 5,
        }
      }),
      // 4. Diego Martinez - CABA
      db.user.create({
        data: {
          name: 'Diego Martinez',
          phone: '+5491177775678',
          bio: 'Tecnico en computadoras y redes. Reparacion de PC y notebooks, instalacion de redes WiFi, formateo, virus.',
          location: 'Almagro, Buenos Aires',
          neighborhood: 'Almagro',
          lat: -34.6067,
          lng: -58.4164,
          province: 'caba',
          city: 'Almagro',
          workZone: 'CABA',
          profession: 'Tecnico en computadoras',
          skills: 'Reparacion PC, notebooks, redes WiFi, formateo, eliminacion de virus, armado de PC, recovery de datos',
          experience: '8 años',
          hourlyRate: 10000,
          verified: true,
          dniVerified: true,
          dniNumber: '34567890',
          ratingAvg: 4.7,
          ratingCount: 21,
          completedJobs: 18,
        }
      }),
      // 5. Ana Lopez - CABA
      db.user.create({
        data: {
          name: 'Ana Lopez',
          phone: '+5491133339012',
          bio: 'Limpieza profunda y organizacion de hogares, oficinas y comercios. Trabajo con productos ecologicos.',
          location: 'Belgrano, Buenos Aires',
          neighborhood: 'Belgrano',
          lat: -34.5631,
          lng: -58.4555,
          province: 'caba',
          city: 'Belgrano',
          workZone: 'CABA',
          profession: 'Limpieza profesional',
          skills: 'Limpieza profunda, organizacion, productos ecologicos, oficinas, hogares, pos-obra',
          experience: '6 años',
          hourlyRate: 7000,
          verified: true,
          dniVerified: true,
          dniNumber: '30987654',
          ratingAvg: 4.6,
          ratingCount: 15,
          completedJobs: 12,
        }
      }),
      // 6. Roberto Sanchez - CABA
      db.user.create({
        data: {
          name: 'Roberto Sanchez',
          phone: '+5491144447890',
          bio: 'Plomero matriculado. Canerias, desagues, instalaciones sanitarias, gas, calefaccion. Servicio de urgencia 24hs.',
          location: 'Flores, Buenos Aires',
          neighborhood: 'Flores',
          lat: -34.6251,
          lng: -58.4583,
          province: 'caba',
          city: 'Flores',
          workZone: 'CABA',
          profession: 'Plomero',
          skills: 'Canerias, desagues, instalaciones sanitarias, gas, calefaccion, agua caliente, urgenias 24hs',
          experience: '15 años',
          hourlyRate: 13000,
          verified: true,
          dniVerified: true,
          dniNumber: '25432167',
          ratingAvg: 4.8,
          ratingCount: 42,
          completedJobs: 38,
        }
      }),
      // 7. Juan Perez - GBA Zona Sur
      db.user.create({
        data: {
          name: 'Juan Perez',
          phone: '+5491166663456',
          bio: 'Albañil especializado en construcciones, refacciones, revestimientos, pisos, pintura y YESO.',
          location: 'Lanús, Buenos Aires',
          neighborhood: 'Lanús',
          lat: -34.7083,
          lng: -58.3958,
          province: 'buenos_aires',
          city: 'Lanús',
          workZone: 'Zona Sur',
          profession: 'Albañil',
          skills: 'Construccion, refacciones, revestimientos, pisos, pintura, yeso, mezcla, hormigon, fundaciones',
          experience: '20 años',
          hourlyRate: 11000,
          verified: true,
          dniVerified: true,
          dniNumber: '20123456',
          ratingAvg: 4.9,
          ratingCount: 56,
          completedJobs: 45,
        }
      }),
      // 8. Miguel Torres - GBA Zona Norte
      db.user.create({
        data: {
          name: 'Miguel Torres',
          phone: '+5491188881234',
          bio: 'Mecanico automotor. Diagnostico electronico, service general, caja automatica, inyeccion, frenos, suspension.',
          location: 'Tigre, Buenos Aires',
          neighborhood: 'Tigre',
          lat: -34.4258,
          lng: -58.5792,
          province: 'buenos_aires',
          city: 'Tigre',
          workZone: 'Zona Norte',
          profession: 'Mecanico automotor',
          skills: 'Diagnostico electronico, service general, caja automatica, inyeccion, frenos, suspension, aire acondicionado vehicular',
          experience: '12 años',
          hourlyRate: 9000,
          verified: true,
          dniVerified: true,
          dniNumber: '33789012',
          ratingAvg: 4.6,
          ratingCount: 29,
          completedJobs: 24,
        }
      }),
      // 9. Pedro Gomez - GBA Zona Oeste
      db.user.create({
        data: {
          name: 'Pedro Gomez',
          phone: '+5491199995678',
          bio: 'Instalador de aire acondicionado split y central. Tambien hago servicio de mantenimiento y limpieza de equipos.',
          location: 'Morón, Buenos Aires',
          neighborhood: 'Morón',
          lat: -34.6519,
          lng: -58.6203,
          province: 'buenos_aires',
          city: 'Morón',
          workZone: 'Zona Oeste',
          profession: 'Instalador de aire acondicionado',
          skills: 'Aire split, aire central, calefaccion, gas, mantenimiento, limpieza de equipos, carga de gas',
          experience: '9 años',
          hourlyRate: 14000,
          verified: true,
          dniVerified: true,
          dniNumber: '38456789',
          ratingAvg: 4.7,
          ratingCount: 18,
          completedJobs: 15,
        }
      }),
      // 10. Jose Ruiz - GBA Zona Norte
      db.user.create({
        data: {
          name: 'Jose Ruiz',
          phone: '+5491100009012',
          bio: 'Carpintero de obra y muebles. Diseño a medida, restauracion, puertas, ventanas, deck, muebles de cocina y placard.',
          location: 'Pilar, Buenos Aires',
          neighborhood: 'Pilar',
          lat: -34.4581,
          lng: -58.8614,
          province: 'buenos_aires',
          city: 'Pilar',
          workZone: 'Zona Norte',
          profession: 'Carpintero',
          skills: 'Muebles a medida, restauracion, puertas, ventanas, deck, cocina, placard, melamina, MDF, madera solida',
          experience: '18 años',
          hourlyRate: 12000,
          verified: true,
          dniVerified: true,
          dniNumber: '26901234',
          ratingAvg: 4.9,
          ratingCount: 38,
          completedJobs: 32,
        }
      }),
      // 11. Alejandro Medina - CABA
      db.user.create({
        data: {
          name: 'Alejandro Medina',
          phone: '+5491111112345',
          bio: 'Gasista matriculado. Instalaciones de gas, calefones, estufas, hornos. Inspecciones y habilitaciones.',
          location: 'Colegiales, Buenos Aires',
          neighborhood: 'Colegiales',
          lat: -34.5778,
          lng: -58.4522,
          province: 'caba',
          city: 'Colegiales',
          workZone: 'CABA',
          profession: 'Gasista matriculado',
          skills: 'Gas natural, garrafa, calefones, estufas, hornos, cañerias, habilitaciones, inspecciones, termotanques',
          experience: '14 años',
          hourlyRate: 13000,
          verified: true,
          dniVerified: true,
          dniNumber: '29345678',
          ratingAvg: 4.8,
          ratingCount: 27,
          completedJobs: 22,
        }
      }),
      // 12. Fernando Castro - GBA Zona Sur
      db.user.create({
        data: {
          name: 'Fernando Castro',
          phone: '+5491122223456',
          bio: 'Pintor profesional. Pintura interior, exterior, texturizada, papel mural, efectos decorativos. Trabajo prolijo y garantizado.',
          location: 'Lomas de Zamora, Buenos Aires',
          neighborhood: 'Lomas de Zamora',
          lat: -34.7631,
          lng: -58.4072,
          province: 'buenos_aires',
          city: 'Lomas de Zamora',
          workZone: 'Zona Sur',
          profession: 'Pintor',
          skills: 'Pintura interior, exterior, texturizada, papel mural, efectos decorativos, latex, esmalte, aerosol',
          experience: '11 años',
          hourlyRate: 8000,
          verified: true,
          dniVerified: true,
          dniNumber: '31567890',
          ratingAvg: 4.5,
          ratingCount: 19,
          completedJobs: 16,
        }
      }),
      // 13. Mateo Herrera - Córdoba
      db.user.create({
        data: {
          name: 'Mateo Herrera',
          phone: '+5493511234567',
          bio: 'Electricista matriculado en Córdoba. Atiendo toda la ciudad y alrededores. Servicio rápido y garantizado.',
          location: 'Córdoba',
          neighborhood: 'Centro',
          lat: -31.4201,
          lng: -64.1888,
          province: 'cordoba',
          city: 'Córdoba',
          workZone: 'Córdoba Capital',
          profession: 'Electricista',
          skills: 'Instalaciones eléctricas, reparaciones, tableros, iluminación LED',
          experience: '7 años',
          hourlyRate: 8000,
          verified: true,
          dniVerified: true,
          dniNumber: '35111223',
          ratingAvg: 4.6,
          ratingCount: 18,
          completedJobs: 14,
        }
      }),
      // 14. Valentina Ríos - Mendoza
      db.user.create({
        data: {
          name: 'Valentina Ríos',
          phone: '+5492612345678',
          bio: 'Diseñadora de interiores en Mendoza. Transformo espacios en lugares únicos. Consulta gratis.',
          location: 'Mendoza',
          neighborhood: 'Centro',
          lat: -32.8895,
          lng: -68.8458,
          province: 'mendoza',
          city: 'Mendoza',
          workZone: 'Mendoza Capital',
          profession: 'Diseñadora de interiores',
          skills: 'Diseño de interiores, decoración, reforma, espacios, consulta',
          experience: '5 años',
          hourlyRate: 12000,
          verified: true,
          dniVerified: true,
          dniNumber: '27334455',
          ratingAvg: 4.8,
          ratingCount: 11,
          completedJobs: 9,
        }
      }),
      // 15. Facundo Quiroga - Santa Fe (Rosario)
      db.user.create({
        data: {
          name: 'Facundo Quiroga',
          phone: '+5493411234567',
          bio: 'Plomero con amplia experiencia en Rosario. Urgencias 24hs. Garantía en todos mis trabajos.',
          location: 'Rosario, Santa Fe',
          neighborhood: 'Centro',
          lat: -32.9468,
          lng: -60.6393,
          province: 'santa_fe',
          city: 'Rosario',
          workZone: 'Rosario',
          profession: 'Plomero',
          skills: 'Cañerías, desagües, gas, calefacción, agua caliente, baños',
          experience: '12 años',
          hourlyRate: 7500,
          verified: true,
          dniVerified: true,
          dniNumber: '30445566',
          ratingAvg: 4.7,
          ratingCount: 22,
          completedJobs: 19,
        }
      }),
      // 16. Camila Sosa - Tucumán
      db.user.create({
        data: {
          name: 'Camila Sosa',
          phone: '+5493811234567',
          bio: 'Profesora de ciencias exactas. Doy clases particulares en Tucumán. Preparación para exámenes de ingreso y nivelación.',
          location: 'San Miguel de Tucumán',
          neighborhood: 'Centro',
          lat: -26.8241,
          lng: -65.2226,
          province: 'tucuman',
          city: 'San Miguel de Tucumán',
          workZone: 'Tucumán Capital',
          profession: 'Profesora particular',
          skills: 'Matemática, física, química, apoyo escolar, preparación exámenes',
          experience: '4 años',
          hourlyRate: 5000,
          verified: true,
          dniVerified: true,
          dniNumber: '35566778',
          ratingAvg: 4.9,
          ratingCount: 31,
          completedJobs: 28,
        }
      }),
      // 17. Tomás Agüero - Misiones (Posadas)
      db.user.create({
        data: {
          name: 'Tomás Agüero',
          phone: '+5493761234567',
          bio: 'Carpintero artesanal en Posadas, Misiones. Trabajo con maderas nobles de la zona. Muebles únicos y de calidad.',
          location: 'Posadas, Misiones',
          neighborhood: 'Centro',
          lat: -27.3671,
          lng: -55.8961,
          province: 'misiones',
          city: 'Posadas',
          workZone: 'Posadas',
          profession: 'Carpintero',
          skills: 'Muebles a medida, deck, puertas, ventanas, restauración, madera',
          experience: '16 años',
          hourlyRate: 6500,
          verified: true,
          dniVerified: true,
          dniNumber: '28778899',
          ratingAvg: 4.5,
          ratingCount: 14,
          completedJobs: 11,
        }
      }),
      // 18. Luciana Medina - Salta
      db.user.create({
        data: {
          name: 'Luciana Medina',
          phone: '+5493871234567',
          bio: 'Arquitecta en Salta. Diseño y dirección de obra. Especializada en viviendas y comercios.',
          location: 'Salta',
          neighborhood: 'Centro',
          lat: -24.7829,
          lng: -65.4232,
          province: 'salta',
          city: 'Salta',
          workZone: 'Salta Capital',
          profession: 'Arquitecta',
          skills: 'Planos, proyectos, dirección de obra, remodelaciones, permisos',
          experience: '9 años',
          hourlyRate: 15000,
          verified: true,
          dniVerified: true,
          dniNumber: '32990011',
          ratingAvg: 4.8,
          ratingCount: 16,
          completedJobs: 12,
        }
      }),
    ]);

    const needsData = [
      {
        title: 'Necesito electricista urgente - cortocircuito en cocina',
        description: 'Se corto la luz en toda la cocina al enchufar la heladera. Hay olor a quemado. Necesito a alguien con urgencia hoy mismo.',
        category: 'servicios',
        budget: 15000,
        urgent: true,
        lat: -34.5900,
        lng: -58.4200,
        location: 'Palermo, Buenos Aires',
        neighborhood: 'Palermo',
        authorId: users[0].id,
      },
      {
        title: 'Instalador de aire acondicionado split 12000 frigorias',
        description: 'Compre un aire split Samsung 12000 frigorias y necesito instalador certificado. El depto tiene preparacion para aire. Zona centro.',
        category: 'servicios',
        budget: 25000,
        urgent: false,
        lat: -34.5931,
        lng: -58.3937,
        location: 'Recoleta, Buenos Aires',
        neighborhood: 'Recoleta',
        authorId: users[2].id,
      },
      {
        title: 'Albañil para refaccionar baño completo',
        description: 'Necesito un albañil para demolición y reconstrucción de baño. Cerámicos, revestimiento, canería y revoque. Son 4m2.',
        category: 'servicios',
        budget: 350000,
        urgent: false,
        lat: -34.6178,
        lng: -58.4338,
        location: 'Caballito, Buenos Aires',
        neighborhood: 'Caballito',
        authorId: users[4].id,
      },
      {
        title: 'Carpintero para hacer placard a medida',
        description: 'Necesito un carpintero para fabricar e instalar un placard de 2.40m x 2.00m con puertas corredizas. MDF o melamina.',
        category: 'servicios',
        budget: 180000,
        urgent: false,
        lat: -34.5631,
        lng: -58.4555,
        location: 'Belgrano, Buenos Aires',
        neighborhood: 'Belgrano',
        authorId: users[0].id,
      },
      {
        title: 'Mecanico para service de auto VW Gol Trend',
        description: 'Mi Gol Trend 2013 hace un ruido raro en la suspension delantera. Necesito diagnostico y presupuesto para reparacion.',
        category: 'servicios',
        budget: 50000,
        urgent: false,
        lat: -34.6100,
        lng: -58.4300,
        location: 'Balvanera, Buenos Aires',
        neighborhood: 'Balvanera',
        authorId: users[3].id,
      },
      {
        title: 'Gasista para instalar calefon en depto nuevo',
        description: 'Me mude a un depto y necesito instalar un calefon natural tiro balanceado de 14 litros. Ya tiene la cañería preparada.',
        category: 'servicios',
        budget: 45000,
        urgent: false,
        lat: -34.5983,
        lng: -58.4342,
        location: 'Villa Crespo, Buenos Aires',
        neighborhood: 'Villa Crespo',
        authorId: users[2].id,
      },
      {
        title: 'Pintor para pintar depto 2 ambientes completo',
        description: 'Necesito pintar todo el depto (65m2). Paredes y cielorrasos en latex blanco. Incluye preparación y limpieza. Preferencia por equipos que trabajen con dropear.',
        category: 'servicios',
        budget: 120000,
        urgent: false,
        lat: -34.6067,
        lng: -58.4164,
        location: 'Almagro, Buenos Aires',
        neighborhood: 'Almagro',
        authorId: users[0].id,
      },
      {
        title: 'Plomero urgente: canería rota en baño',
        description: 'Reventó una cañería y se está inundando el baño. Necesito a alguien INMEDIATAMENTE. Edificio con portero.',
        category: 'servicios',
        budget: 20000,
        urgent: true,
        lat: -34.5900,
        lng: -58.4200,
        location: 'Palermo, Buenos Aires',
        neighborhood: 'Palermo',
        authorId: users[3].id,
      },
      {
        title: 'Armado de mueble IKEA PAX placard',
        description: 'Compre un placard PAX de IKEA y necesito alguien que lo arme. Son 3 módulos con puertas corredizas. Tengo las herramientas basicas.',
        category: 'ayuda',
        budget: 8000,
        urgent: false,
        lat: -34.5931,
        lng: -58.3937,
        location: 'Recoleta, Buenos Aires',
        neighborhood: 'Recoleta',
        authorId: users[4].id,
      },
      {
        title: 'Busco alguien que me lleve un paquete a Microcentro',
        description: 'Necesito que alguien retire un sobre en mi oficina en Palermo y lo lleve a una empresa en Microcentro. Es urgente, hoy mismo.',
        category: 'mandados',
        budget: 4000,
        urgent: true,
        lat: -34.5882,
        lng: -58.4260,
        location: 'Palermo a Microcentro',
        neighborhood: 'Palermo',
        authorId: users[2].id,
      },
    ];

    const needs = await Promise.all(
      needsData.map(data => db.need.create({
        data,
        include: {
          author: {
            select: { id: true, name: true, avatar: true, ratingAvg: true, ratingCount: true, verified: true }
          }
        }
      }))
    );

    // Create some responses
    await Promise.all([
      db.response.create({
        data: { message: 'Hola, soy electricista matriculado. Puedo pasar hoy después de las 16hs. Diagnostico sin cargo.', needId: needs[0].id, userId: users[1].id, status: 'pending' }
      }),
      db.response.create({
        data: { message: 'Puedo llevar el paquete ahora mismo. Estoy en Palermo, ¿cuál es la dirección exacta?', needId: needs[9].id, userId: users[3].id, status: 'pending' }
      }),
      db.response.create({
        data: { message: 'Tengo experiencia con PAX. Puedo ir mañana a la mañana si te sirve. Tengo mis propias herramientas.', needId: needs[8].id, userId: users[9].id, status: 'pending' }
      }),
    ]);

    // Create ratings
    await Promise.all([
      db.rating.create({ data: { score: 5, comment: 'Excelente trabajo. Llego puntual y resolvió todo de primera.', raterId: users[0].id, ratedId: users[1].id, needId: needs[0].id } }),
      db.rating.create({ data: { score: 5, comment: 'Muy profesional. Trabajo prolijo y garantizado. Lo recomiendo.', raterId: users[4].id, ratedId: users[5].id } }),
      db.rating.create({ data: { score: 5, comment: 'Increíble el trabajo que hizo con el placard. Quedó perfecto.', raterId: users[0].id, ratedId: users[9].id } }),
      db.rating.create({ data: { score: 4, comment: 'Buen trabajo, un poco demorado pero la calidad es excelente.', raterId: users[2].id, ratedId: users[6].id } }),
    ]);

    // ====== QUOTES ======
    const now = new Date();
    const providerId = users[1].id; // Carlos Rodriguez (electricista)
    const clientId = users[0].id;   // Maria Garcia

    const quotes = await Promise.all([
      // Quote 1: accepted, with provider check-in data
      db.quote.create({
        data: {
          title: 'Reparación cortocircuito cocina',
          description: 'Diagnóstico y reparación del cortocircuito en la cocina. Reemplazo de cableado dañado y verificación de instalación completa.',
          amount: 18000,
          currency: 'ARS',
          status: 'accepted',
          needId: needs[0].id,
          providerId,
          clientId,
          validityHours: 48,
          includesMaterials: true,
          estimatedHours: 2,
          providerMessage: 'Tengo experiencia con este tipo de fallas. Incluyo materiales (cable, toma, breaker). Garantía de 6 meses.',
          clientMessage: 'Perfecto, acepto. ¿Podés pasar mañana a las 10?',
          acceptedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
          expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        }
      }),
      // Quote 2: pending, recently created
      db.quote.create({
        data: {
          title: 'Instalación aire acondicionado split',
          description: 'Instalación completa de aire split 12000 frigorias. Incluye colocación de unidad interior y exterior, cañería de cobre y prueba de funcionamiento.',
          amount: 35000,
          currency: 'ARS',
          status: 'pending',
          needId: needs[1].id,
          providerId,
          clientId,
          validityHours: 48,
          includesMaterials: false,
          estimatedHours: 4,
          providerMessage: 'Instalación profesional con garantía. El cliente debe proveer el equipo y los materiales de instalación.',
          expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        }
      }),
      // Quote 3: completed
      db.quote.create({
        data: {
          title: 'Refacción baño completo',
          description: 'Demolición y reconstrucción de baño 4m2. Cerámicos, revestimiento, canería y revoque fino.',
          amount: 320000,
          currency: 'ARS',
          status: 'completed',
          needId: needs[2].id,
          providerId: users[6].id, // Juan Perez (albañil)
          clientId,
          validityHours: 72,
          includesMaterials: true,
          estimatedHours: 40,
          providerMessage: 'Trabajo completo de albañilería. Incluyo cerámicos y materiales menores. El cliente provee grifería y sanitarios.',
          clientMessage: 'Trabajo impecable, Juan es un crack.',
          acceptedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          completedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          expiresAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
        }
      }),
      // Quote 4: pending, about to expire
      db.quote.create({
        data: {
          title: 'Pintura depto 2 ambientes',
          description: 'Pintura completa de depto 65m2. Paredes y cielorrasos en látex blanco. Incluye preparación, masillado y limpieza final.',
          amount: 95000,
          currency: 'ARS',
          status: 'pending',
          needId: needs[6].id,
          providerId: users[11].id, // Fernando Castro (pintor)
          clientId,
          validityHours: 48,
          includesMaterials: true,
          estimatedHours: 16,
          providerMessage: 'Trabajo prolijo con garantía. Incluyo pintura y materiales. Disponible esta semana.',
          expiresAt: new Date(now.getTime() + 2 * 60 * 60 * 1000), // expires in 2 hours
        }
      }),
    ]);

    // ====== TRANSACTIONS ======
    const transactions = await Promise.all([
      // Transaction 1: held (escrow for accepted quote)
      db.transaction.create({
        data: {
          quoteId: quotes[0].id,
          userId: clientId,
          amount: 18000,
          currency: 'ARS',
          platformFee: 1800, // 10% platform fee
          status: 'held',
          paymentMethod: 'mercadopago',
          paymentRef: 'MP_Q1_HELD_2024',
        }
      }),
      // Transaction 2: released (for completed quote)
      db.transaction.create({
        data: {
          quoteId: quotes[2].id,
          userId: clientId,
          amount: 320000,
          currency: 'ARS',
          platformFee: 32000, // 10%
          status: 'released',
          paymentMethod: 'transferencia',
          paymentRef: 'TR_Q3_REL_2024',
          releasedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        }
      }),
      // Transaction 3: pending (for the pending quote about to expire)
      db.transaction.create({
        data: {
          quoteId: quotes[3].id,
          userId: clientId,
          amount: 95000,
          currency: 'ARS',
          platformFee: 9500, // 10%
          status: 'pending',
          paymentMethod: 'tarjeta',
          paymentRef: null,
        }
      }),
    ]);

    // ====== CHECK-INS ======
    const checkIns = await Promise.all([
      // Check-in for accepted quote (Quote 1) - arrival
      db.checkIn.create({
        data: {
          quoteId: quotes[0].id,
          userId: providerId,
          type: 'arrival',
          lat: -34.5888,
          lng: -58.4245,
          address: 'Av. Córdoba 1234, Palermo, CABA',
          photoUrl: null,
          notes: 'Llegué al domicilio. El cliente está esperando.',
          verified: true,
        }
      }),
      // Check-in for accepted quote - start_work
      db.checkIn.create({
        data: {
          quoteId: quotes[0].id,
          userId: providerId,
          type: 'start_work',
          lat: -34.5888,
          lng: -58.4245,
          address: 'Av. Córdoba 1234, Palermo, CABA',
          photoUrl: null,
          notes: 'Comencé el diagnóstico del cortocircuito. Falla en el breaker del circuito de cocina.',
          verified: true,
        }
      }),
      // Check-in for accepted quote - progress
      db.checkIn.create({
        data: {
          quoteId: quotes[0].id,
          userId: providerId,
          type: 'progress',
          lat: -34.5888,
          lng: -58.4245,
          address: 'Av. Córdoba 1234, Palermo, CABA',
          photoUrl: null,
          notes: 'Reemplacé el cableado dañado y el breaker. Verificando toda la instalación antes de finalizar.',
          verified: false,
        }
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Database seeded with professionals demo data',
      professionalCount: users.length,
      needCount: needs.length,
      productCount: products.length,
      quoteCount: quotes.length,
      transactionCount: transactions.length,
      checkInCount: checkIns.length,
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
