import { QueryProvider } from './providers/QueryProvider';
import { MainLayout } from './pages/MainLayout';

export function App() {
  return (
    <QueryProvider>
      <MainLayout />
    </QueryProvider>
  );
}
