import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

    // 2. Fetch products along with images and variants from the database
    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. Return successful response
    return NextResponse.json(
      { 
        success: true, 
        count: products.length,
        data: products 
      }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('API Error:', error);
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