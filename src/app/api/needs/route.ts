import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const urgent = searchParams.get('urgent');
    const neighborhood = searchParams.get('neighborhood');
    const status = searchParams.get('status') || 'active';
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const maxDistance = searchParams.get('maxDistance') ? parseFloat(searchParams.get('maxDistance')!) : 50;
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = { status };

    if (category && category !== 'all') {
      where.category = category;
    }
    if (urgent === 'true') {
      where.urgent = true;
    }
    if (neighborhood) {
      where.neighborhood = { contains: neighborhood };
    }

    let needs = await db.need.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, avatar: true, ratingAvg: true, ratingCount: true, verified: true }
        },
        responses: {
          select: { id: true, userId: true },
        },
        _count: {
          select: { responses: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Calculate distances if coordinates provided
    if (lat !== null && lng !== null) {
      needs = needs.map(need => {
        if (need.lat !== null && need.lng !== null) {
          const distance = haversineDistance(lat, lng, need.lat, need.lng);
          return { ...need, distanceKm: Math.round(distance * 10) / 10 };
        }
        return need;
      });

      // Sort by distance
      needs.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));

      // Filter by max distance
      needs = needs.filter(need => (need.distanceKm || 999) <= maxDistance);
    }

    return NextResponse.json(needs);
  } catch (error) {
    console.error('Error fetching needs:', error);
    return NextResponse.json({ error: 'Failed to fetch needs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, budget, urgent, lat, lng, location, neighborhood, authorId } = body;

    if (!title || !category || !authorId) {
      return NextResponse.json({ error: 'Title, category and authorId are required' }, { status: 400 });
    }

    const need = await db.need.create({
      data: {
        title,
        description: description || null,
        category,
        budget: budget ? parseFloat(budget) : null,
        urgent: urgent || false,
        lat: lat ? parseFloat(lat) : null,
        lng: lng ? parseFloat(lng) : null,
        location: location || null,
        neighborhood: neighborhood || null,
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, avatar: true, ratingAvg: true, ratingCount: true, verified: true }
        }
      }
    });

    return NextResponse.json(need, { status: 201 });
  } catch (error) {
    console.error('Error creating need:', error);
    return NextResponse.json({ error: 'Failed to create need' }, { status: 500 });
  }
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
