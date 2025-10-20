// src/app/page.tsx
import { redirect } from 'next/navigation';

// This page now simply redirects users to the inventory page.
// Authentication checks should ideally happen in middleware or on the
// target page (/inventory) itself to handle unauthenticated users.
export default function HomePage() {
  redirect('/inventory'); // Always redirect from the root page
}