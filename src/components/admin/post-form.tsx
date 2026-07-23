'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, updatePost, type PostFormData } from '@/app/admin/actions';
import {
  sectionLabels,
  type CoverImagePosition,
  type Post,
  type SectionSlug,
} from '@/lib/post-data';

// Active sections offered in the form for new content.
// Retired slugs remain valid at the data-model level but are not offered here.
const activeSectionSlugs: SectionSlug[] = [
  'book-reviews',
  'personal-essays',
  'travel-diary',
];
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from './rich-text-editor';
import { ImageUploader } from './image-uploader';

interface PostFormProps {
  post?: Post;
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title ?? '');
  const [section, setSection] = useState<SectionSlug>(
    post?.section ?? 'personal-essays'
  );
  const [location, setLocation] = useState(post?.location ?? '');
  const [bodyHtml, setBodyHtml] = useState(post?.body_html ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(
    post?.cover_image_url ?? null
  );
  const [coverImagePosition, setCoverImagePosition] =
    useState<CoverImagePosition>(post?.cover_image_position ?? 'center');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const sections = activeSectionSlugs.map(
    (slug) => [slug, sectionLabels[slug]] as [SectionSlug, string]
  );

  const handleSubmit = async (intent: 'draft' | 'publish') => {
    setError('');
    setPending(true);

    const formData: PostFormData = {
      title,
      section,
      location: location.trim() || null,
      bodyHtml,
      coverImageUrl,
      coverImagePosition,
      intent,
    };

    try {
      if (post) {
        await updatePost(post.id, formData);
      } else {
        await createPost(formData);
      }
    } catch (error) {
      setPending(false);
      setError(
        error instanceof Error ? error.message : 'Something went wrong.'
      );
    }
  };

  return (
    <form className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-medium text-ink">
          {post ? 'Edit post' : 'New post'}
        </h1>
        <p className="font-body text-base text-slate">
          {post
            ? 'Update your book review or travel diary entry.'
            : 'Write a new book review or travel diary entry.'}
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-oxblood/10 px-3 py-2 font-ui text-sm text-oxblood">
          {error}
        </p>
      )}

      <div className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="font-ui text-sm font-medium text-ink"
          >
            Title
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter the title"
            className="border-rule bg-parchment text-ink placeholder:text-slate focus-visible:ring-oxblood"
          />
        </div>

        <div className="space-y-2">
          <span className="font-ui text-sm font-medium text-ink">
            Cover photo
          </span>
          <ImageUploader
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            position={coverImagePosition}
            onPositionChange={setCoverImagePosition}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="category"
            className="font-ui text-sm font-medium text-ink"
          >
            Category
          </label>
          <Select
            value={section}
            onValueChange={(v) => setSection(v as SectionSlug)}
          >
            <SelectTrigger className="border-rule bg-parchment text-ink focus:ring-oxblood">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="border-rule bg-parchment text-ink">
              {sections.map(([value, label]) => (
                <SelectItem
                  key={value}
                  value={value}
                  className="focus:bg-parchment-dim focus:text-ink"
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="location"
            className="font-ui text-sm font-medium text-ink"
          >
            Location <span className="font-normal text-slate">(optional)</span>
          </label>
          <Input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Udaipur, Rajasthan"
            className="border-rule bg-parchment text-ink placeholder:text-slate focus-visible:ring-oxblood"
          />
        </div>

        <div className="space-y-2">
          <span className="font-ui text-sm font-medium text-ink">
            Write your post
          </span>
          <RichTextEditor value={bodyHtml} onChange={setBodyHtml} />
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin')}
          className="border-rule bg-parchment text-slate hover:bg-parchment-dim hover:text-ink focus-visible:ring-oxblood"
        >
          Cancel
        </Button>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={() => handleSubmit('draft')}
            className="border-rule bg-parchment text-slate hover:bg-parchment-dim hover:text-ink focus-visible:ring-oxblood"
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={() => handleSubmit('publish')}
            className="bg-oxblood text-parchment hover:bg-oxblood/90 focus-visible:ring-oxblood"
          >
            {pending ? 'Saving…' : 'Publish'}
          </Button>
        </div>
      </div>
    </form>
  );
}
