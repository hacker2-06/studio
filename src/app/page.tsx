
import DashboardPage from './(main)/page';
import MainAppLayout from './(main)/layout';
import type { ReactNode } from 'react';

// This component will now be the entry point for the root path '/'.
// It explicitly renders the DashboardPage wrapped in the MainAppLayout,
// ensuring the correct UI is displayed by default without causing redirect issues.
export default function HomePage(): ReactNode {
  return (
    <MainAppLayout>
      <DashboardPage />
    </MainAppLayout>
  );
}
