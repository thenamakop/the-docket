import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PostForm } from '@/components/admin/post-form';

export const metadata = {
  title: 'New Post — the-docket',
};

export default async function NewPostPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  return <PostForm />;
}
