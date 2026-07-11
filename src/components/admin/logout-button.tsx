'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleLogout}
      className="border-rule bg-parchment text-slate hover:bg-parchment-dim hover:text-ink focus-visible:ring-oxblood"
    >
      Log out
    </Button>
  );
}
