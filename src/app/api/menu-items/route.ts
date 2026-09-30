import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { MenuItem } from '@/lib/types';
import { INITIAL_MENU_ITEMS } from '@/lib/constants';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'menu_items.json');

const DEFAULT_MENU_ITEMS: MenuItem[] = INITIAL_MENU_ITEMS.map((item, index) => ({
  ...item,
  id: `menu-${index + 1}`
}));

async function ensureDirectory() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

async function readMenuItems(): Promise<MenuItem[]> {
  try {
    await ensureDirectory();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return DEFAULT_MENU_ITEMS;
  }
}

async function writeMenuItems(items: MenuItem[]): Promise<void> {
  await ensureDirectory();
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const items = await readMenuItems();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(DEFAULT_MENU_ITEMS);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = await readMenuItems();

    let updated: MenuItem[];
    if (Array.isArray(body)) {
      updated = body;
    } else if (body && body.id) {
      const idx = current.findIndex((i) => i.id === body.id);
      if (idx >= 0) {
        current[idx] = { ...current[idx], ...body };
      } else {
        current.push(body);
      }
      updated = current;
    } else {
      return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
    }

    await writeMenuItems(updated);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save menu items' }, { status: 500 });
  }
}
