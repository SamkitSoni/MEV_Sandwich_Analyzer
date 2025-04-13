import path from 'path';
import { writeToPath } from '@fast-csv/format';
import { detectSandwiches } from '@/analysis/detectSandwiches';
import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

dotenv.config();

export async function GET() {
  try {
    // const transactions = await fetchPYUSDTransfers();

    // if (!transactions || transactions.length === 0) {
    //   return NextResponse.json({ message: 'No transactions found.' }, { status: 404 });
    // }

    const suspiciousTxs = await detectSandwiches();
    // console.log('Suspicious transactions:', suspiciousTxs);

    if (!suspiciousTxs || suspiciousTxs.length === 0) {
      return NextResponse.json({ message: 'No sandwich attacks detected.' }, { status: 200 });
    }

    const outputPath = path.join(process.cwd(), 'public', 'suspiciousTxs.csv');

    await new Promise<void>((resolve, reject) => {
      const csvStream = writeToPath(outputPath, suspiciousTxs, { headers: true });

      csvStream.on('finish', () => {
        console.log(`CSV export complete: ${outputPath}`);
        resolve();
      });

      csvStream.on('error', (err) => {
        console.error('CSV write error:', err);
        reject(err);
      });
    });

    return NextResponse.json({ message: 'CSV written', path: '/suspiciousTxs.csv' });

  } catch (error) {
    console.error('Error running MEV detection:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
