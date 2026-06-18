'use client';

import { useStore } from '@/contexts/StoreContext';
import AdminPanel from '@/components/AdminPanel';

export default function AdminPage() {
  const { currentUser, navigate } = useStore();

  return (
    <AdminPanel
      currentUser={currentUser}
      onNavigateHome={() => navigate('/')}
    />
  );
}
