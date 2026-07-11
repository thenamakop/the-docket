import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAllPosts, sectionLabel, type Post } from '@/lib/posts';
import { DeletePostButton } from '@/components/admin/delete-post-button';
import { LogoutButton } from '@/components/admin/logout-button';

export const metadata = {
  title: 'Admin — the-docket',
};

export const revalidate = 0;

function StatusBadge({ status }: { status: Post['status'] }) {
  if (status === 'published') {
    return (
      <span className="inline-flex items-center rounded-full bg-oxblood/10 px-2.5 py-0.5 font-ui text-xs font-medium text-oxblood">
        Published
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full bg-parchment-dim px-2.5 py-0.5 font-ui text-xs font-medium text-slate">
      Draft
    </span>
  );
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/admin/login');
  }

  const posts = await getAllPosts();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-medium text-ink">Posts</h1>
          <p className="mt-1 font-body text-base text-slate">
            Manage essays, reviews, and poems.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center justify-center rounded-lg bg-oxblood px-4 py-2 text-sm font-medium text-parchment transition-colors hover:bg-oxblood/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
          >
            + New Post
          </Link>

          <LogoutButton />
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-rule">
        <table className="w-full">
          <thead className="bg-parchment-dim">
            <tr>
              <th className="px-4 py-3 text-left font-ui text-xs font-semibold uppercase tracking-[0.08em] text-slate">
                Title
              </th>
              <th className="px-4 py-3 text-left font-ui text-xs font-semibold uppercase tracking-[0.08em] text-slate">
                Status
              </th>
              <th className="px-4 py-3 text-left font-ui text-xs font-semibold uppercase tracking-[0.08em] text-slate">
                Category
              </th>
              <th className="px-4 py-3 text-left font-ui text-xs font-semibold uppercase tracking-[0.08em] text-slate">
                Date
              </th>
              <th className="px-4 py-3 text-right font-ui text-xs font-semibold uppercase tracking-[0.08em] text-slate">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rule bg-parchment">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-4 py-4">
                  <span className="font-display text-base font-medium text-ink">
                    {post.title}
                  </span>
                  <span className="ml-2 font-mono text-xs text-slate">
                    {post.docket_no}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={post.status} />
                </td>
                <td className="px-4 py-4 font-ui text-sm text-slate">
                  {sectionLabel(post.section)}
                </td>
                <td className="px-4 py-4 font-ui text-sm text-slate">
                  {post.published_at
                    ? new Date(post.published_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    : '—'}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="inline-flex h-7 items-center justify-center rounded-lg px-2.5 font-ui text-sm text-slate transition-colors hover:bg-parchment-dim hover:text-oxblood focus:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 focus-visible:ring-offset-parchment"
                    >
                      Edit
                    </Link>
                    <DeletePostButton postId={post.id} title={post.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {posts.length === 0 && (
        <p className="mt-8 font-body text-base text-slate">
          No posts yet. Click &ldquo;New Post&rdquo; to write the first one.
        </p>
      )}
    </div>
  );
}
