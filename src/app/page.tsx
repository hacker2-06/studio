
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to the main app dashboard page within the (main) layout
  redirect('/');
}
