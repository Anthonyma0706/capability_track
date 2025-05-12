export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  );
}
