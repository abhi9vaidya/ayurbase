import { NextResponse } from 'next/server';
import { getOracleConnection } from '@/lib/db';

export async function GET(req) {

  try {
    const connection = await getOracleConnection();
    const result = await connection.execute('SELECT 1+2');

    return NextResponse.json({ message: 'Test API is working!' , result: result.rows });
  } catch (err) {
    console.error('API /api/test error:', err);
    return new NextResponse(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
