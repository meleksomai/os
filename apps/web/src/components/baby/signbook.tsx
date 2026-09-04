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
import { type FormEvent, useState, useTransition } from "react";
import { submitWishFn } from "@/server/wishes";

const CLOSE_AFTER_SUCCESS_MS = 2000;
const REQUEST_FAILED = "Something went wrong. Please try again.";

export function SignBook() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, startSubmitting] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // A submit handler (not a form action) so React keeps the typed fields when
  // the server rejects the wish.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startSubmitting(async () => {
      setError(null);

      try {
        const result = await submitWishFn({ data: formData });

        if (!result.success) {
          setError(result.message);
          return;
        }

        setSubmitted(true);
        setTimeout(() => {
          setOpen(false);
          setSubmitted(false);
        }, CLOSE_AFTER_SUCCESS_MS);
      } catch {
        setError(REQUEST_FAILED);
      }
    });
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
          <form onSubmit={handleSubmit}>
            <AlertDialogHeader>
              <AlertDialogTitle>Share your wishes</AlertDialogTitle>
              <AlertDialogDescription>
                Send your warm wishes to baby Sarah and her parents.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input id="name" name="name" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" required type="email" />
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

              {error ? (
                <p className="text-destructive text-sm" role="alert">
                  {error}
                </p>
              ) : null}
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
