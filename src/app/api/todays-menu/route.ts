import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { TodaysMenu } from '@/lib/types';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'todays_menu.json');

const DEFAULT_TODAYS_MENU: TodaysMenu = {
  date: new Date().toISOString().split('T')[0],
  lunch_special: 'Full Kolhapuri Veg Thali',
  lunch_dishes: 'Paneer Masala, Matki Usal, Indrayani Rice, Chapati / Bhakri, Solkadhi',
  dinner_special: 'Signature Non-Veg & Veg Thali',
  dinner_dishes: 'Tambda & Pandhra Rassa, Sukka Chicken (or Veg Special Curry), Hot Chapati',
  notice: '✨ Freshly prepared with homestyle Kolhapuri spices daily!',
  is_mess_open: true,
  closed_reason: '',
  is_parcel_available: true,
  parcel_unavailable_reason: '',
  dinner_parcel_start: '18:00',
  dinner_parcel_end: '19:30',
  sunday_lunch_start: '12:00',
  sunday_lunch_end: '13:30',
  updated_at: new Date().toISOString()
};

async function ensureDirectory() {
  const dir = path.dirname(DATA_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}

async function readMenuData(): Promise<TodaysMenu> {
  try {
    await ensureDirectory();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return DEFAULT_TODAYS_MENU;
  }
}

async function writeMenuData(menu: TodaysMenu): Promise<void> {
  await ensureDirectory();
  await fs.writeFile(DATA_FILE, JSON.stringify(menu, null, 2), 'utf-8');
}

export async function GET() {
  try {
    const menu = await readMenuData();
    return NextResponse.json(menu);
  } catch (error) {
    return NextResponse.json(DEFAULT_TODAYS_MENU);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current = await readMenuData();
    const updated: TodaysMenu = {
      ...current,
      ...body,
      date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    };
    await writeMenuData(updated);
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update today\'s menu' }, { status: 500 });
  }
}
