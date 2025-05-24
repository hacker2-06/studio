
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the create test page by default to avoid redirect loops.
  // The main dashboard is accessible via the "Home" tab which points to '/'.
  redirect('/create-test');
}

