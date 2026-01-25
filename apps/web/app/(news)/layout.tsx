export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto">
      <div className="relative bg-background text-foreground">{children}</div>
    </div>
  );
}
