
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the main dashboard page ('/') which is handled by (main)/page.tsx.
  redirect('/');
}
