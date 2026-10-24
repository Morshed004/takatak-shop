import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export async function GET(request: Request) {
  try {
    // 1. Check Request Header APP_SECRET for security
    const secretHeader = request.headers.get('x-app-secret');
    const appSecret = process.env.APP_SECRET;

    // If APP_SECRET is missing in env or headers do not match
    if (!appSecret || secretHeader !== appSecret) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid. Access Denied.' 
        }, 
        { status: 401 }
      );
    }

    const cacheKey = "cached_products";

    // 2. Check if products exist in Redis cache
    const cachedProducts = await redis.get(cacheKey);
    if (cachedProducts) {
      return NextResponse.json(
        { 
          success: true, 
          source: "redis",
          count: (cachedProducts as any).length,
          data: cachedProducts 
        }, 
        { status: 200 }
      );
    }

    // 3. Fetch products along with images and variants from the database
    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 4. Store fetched products in Redis cache
    await redis.set(cacheKey, products);

    // 5. Return successful response from database
    return NextResponse.json(
      { 
        success: true, 
        source: "database",
        count: products.length,
        data: products 
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal Server Error', 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}