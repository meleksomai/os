import { cn } from "@workspace/ui/lib/utils";

export const Heading1 = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h1">) => (
  <h1
    className={cn(
      "font-light text-2xl tracking-tight md:text-3xl lg:text-4xl",
      className
    )}
    {...props}
  />
);

export const Heading2 = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h2">) => (
  <h2
    className={cn(
      "mb-2 font-light font-sans text-xl tracking-tight md:text-2xl lg:text-3xl",
      className
    )}
    {...props}
  />
);

export const Heading3 = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h3">) => (
  <h3
    className={cn(
      "mb-2 font-light font-sans text-foreground text-lg md:text-xl lg:text-2xl",
      className
    )}
    {...props}
  />
);

export const Heading4 = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h4">) => (
  <h4
    className={cn(
      "mb-2 font-light font-sans text-base tracking-tight md:text-lg lg:text-xl",
      className
    )}
    {...props}
  />
);

export const Heading5 = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h5">) => (
  <h5
    className={cn(
      "mb-2 font-medium font-sans text-base tracking-tight md:text-lg lg:text-xl",
      className
    )}
    {...props}
  />
);

export const Heading6 = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"h6">) => (
  <h6
    className={cn(
      "mb-2 font-light font-sans text-base tracking-tight md:text-base lg:text-base",
      className
    )}
    {...props}
  />
);
