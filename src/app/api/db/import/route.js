import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { writeFile } from 'fs/promises';

export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const dbPath = path.join(process.cwd(), 'work-tracker.sqlite');

    // Overwrite the existing sqlite file
    await writeFile(dbPath, buffer);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to import db' }, { status: 500 });
  }
}
