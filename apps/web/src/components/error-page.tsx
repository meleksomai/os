import {
  ErrorComponent,
  type ErrorComponentProps,
  Link,
  useRouter,
} from "@tanstack/react-router";
import { Heading1 } from "@workspace/ui/blocks/headings";
import { Button, buttonVariants } from "@workspace/ui/components/button";

/** Fallback rendered by TanStack's error boundary when a route throws (`errorComponent`). */
export function ErrorPage({ error }: ErrorComponentProps) {
  const router = useRouter();

  console.error(error);

  return (
    <div className="flex h-dvh flex-col justify-center gap-8">
      <Heading1 className="font-mono">Something went wrong</Heading1>
      <ErrorComponent error={error} />
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => router.invalidate()}>Try again</Button>
        <Link className={buttonVariants({ variant: "outline" })} to="/">
          Home
        </Link>
      </div>
    </div>
  );
}
