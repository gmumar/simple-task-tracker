import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const dbPath = path.join(process.cwd(), 'work-tracker.sqlite');

  if (!fs.existsSync(dbPath)) {
    return NextResponse.json({ error: 'Database not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(dbPath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Disposition': 'attachment; filename="work-tracker.sqlite"',
      'Content-Type': 'application/x-sqlite3',
    },
  });
}
