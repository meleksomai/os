"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Button } from "@workspace/ui/components/button";
import { LoadingIcon } from "@workspace/ui/components/icons";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Textarea } from "@workspace/ui/components/textarea";
import { useState } from "react";
import { submitWish } from "@/actions/wishes";

export function SignBook() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await submitWish(formData);
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
      }, 2000);
    } catch {
      // Handle error silently
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger
        render={
          <Button className="mt-8" size="xl">
            Share your wishes
          </Button>
        }
      />
      <AlertDialogContent className="max-w-md">
        {submitted ? (
          <div className="py-8 text-center">
            <p className="text-lg">Thank you for your wishes!</p>
            <p className="mt-2 text-muted-foreground text-sm">
              Your message has been received.
            </p>
          </div>
        ) : (
          <form action={handleSubmit}>
            <AlertDialogHeader>
              <AlertDialogTitle>Share your wishes</AlertDialogTitle>
              <AlertDialogDescription>
                Send your warm wishes to baby Sarah and her parents.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" name="name" placeholder="John Doe" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="john@example.com"
                  required
                  type="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Write your wishes here..."
                  required
                  rows={3}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <input
                    className="size-4 accent-primary"
                    id="isPublic"
                    name="isPublic"
                    type="checkbox"
                  />
                  <Label
                    className="text-muted-foreground text-xs"
                    htmlFor="isPublic"
                  >
                    Share publicly on the page
                  </Label>
                </div>
                <p className="pl-6 text-muted-foreground/70 text-xs">
                  Public messages are reviewed before being displayed
                </p>
              </div>
            </div>

            <AlertDialogFooter className="mt-6">
              <AlertDialogCancel disabled={isSubmitting}>
                Cancel
              </AlertDialogCancel>
              <Button disabled={isSubmitting} type="submit">
                {isSubmitting ? (
                  <>
                    <LoadingIcon className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send wishes"
                )}
              </Button>
            </AlertDialogFooter>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
