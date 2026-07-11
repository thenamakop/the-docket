'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react';
import { uploadPostImage } from '@/lib/supabase/storage';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const ToolbarButton = ({
  onClick,
  active,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    title={title}
    disabled={disabled}
    onClick={onClick}
    className={`h-8 w-8 text-slate hover:bg-parchment-dim hover:text-oxblood focus-visible:ring-oxblood ${
      active ? 'bg-parchment-dim text-oxblood' : ''
    }`}
  >
    {children}
  </Button>
);

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: false }),
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none min-h-[16rem] px-3 py-2 focus:outline-none',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const toggleHeading = () => {
    editor.chain().focus().toggleHeading({ level: 2 }).run();
  };

  const toggleBulletList = () => {
    editor.chain().focus().toggleBulletList().run();
  };

  const toggleOrderedList = () => {
    editor.chain().focus().toggleOrderedList().run();
  };

  const toggleBlockquote = () => {
    editor.chain().focus().toggleBlockquote().run();
  };

  const toggleBold = () => {
    editor.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor.chain().focus().toggleItalic().run();
  };

  const insertLink = () => {
    const url = window.prompt('Enter link URL');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const url = await uploadPostImage(file);
        editor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        window.alert(
          error instanceof Error ? error.message : 'Failed to upload image'
        );
      }
    };
    input.click();
  };

  return (
    <div className="rounded-lg border border-rule bg-parchment">
      <div className="flex flex-wrap items-center gap-1 border-b border-rule bg-parchment-dim px-2 py-2">
        <ToolbarButton
          title="Bold"
          onClick={toggleBold}
          active={editor.isActive('bold')}
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Italic"
          onClick={toggleItalic}
          active={editor.isActive('italic')}
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Heading"
          onClick={toggleHeading}
          active={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Bullet list"
          onClick={toggleBulletList}
          active={editor.isActive('bulletList')}
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Numbered list"
          onClick={toggleOrderedList}
          active={editor.isActive('orderedList')}
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          title="Quote"
          onClick={toggleBlockquote}
          active={editor.isActive('blockquote')}
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Insert link" onClick={insertLink}>
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton title="Insert image" onClick={insertImage}>
          <ImageIcon className="h-4 w-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className="font-body text-base text-ink" />
    </div>
  );
}
