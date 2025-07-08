
import { Header } from "@/components/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
}
