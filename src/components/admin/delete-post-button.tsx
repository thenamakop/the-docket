'use client';

import { useState } from 'react';
import { deletePost } from '@/app/admin/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface DeletePostButtonProps {
  postId: string;
  title: string;
}

export function DeletePostButton({ postId, title }: DeletePostButtonProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-oxblood hover:bg-oxblood/10 hover:text-oxblood focus-visible:ring-oxblood"
          >
            Delete
          </Button>
        }
      />
      <DialogContent className="border-rule bg-parchment text-ink">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-medium">
            Delete post?
          </DialogTitle>
          <DialogDescription className="font-body text-base text-slate">
            This will permanently remove &ldquo;{title}&rdquo; and its docket
            number. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-slate hover:bg-parchment-dim hover:text-ink focus-visible:ring-oxblood"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={pending}
            onClick={async () => {
              setPending(true);
              const formData = new FormData();
              formData.append('id', postId);
              try {
                await deletePost(formData);
              } finally {
                setPending(false);
              }
            }}
            className="bg-oxblood text-parchment hover:bg-oxblood/90 focus-visible:ring-oxblood"
          >
            {pending ? 'Deleting…' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
