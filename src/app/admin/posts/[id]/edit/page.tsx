import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPostById } from '@/lib/posts';
import { PostForm } from '@/components/admin/post-form';

export const metadata = {
  title: 'Edit Post — the-docket',
};

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return <PostForm post={post} />;
}
