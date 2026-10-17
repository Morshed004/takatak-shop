import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. Request Header APP_SECRET check
    const secretHeader = request.headers.get('x-app-secret');
    const appSecret = process.env.APP_SECRET;

    // যদি env-এ APP_SECRET না থাকে অথবা হেডার না মিলে
    if (!appSecret || secretHeader !== appSecret) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid. Access Denied.' 
        }, 
        { status: 401 }
      );
    }

    // 2. ডেটাবেজ থেকে প্রোডাক্ট, ইমেজ এবং ভ্যারিয়েন্ট ফেচ করা
    const products = await prisma.product.findMany({
      include: {
        images: true,
        variants: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // 3. সফল রেসপন্স রিটার্ন করা
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