import Nav from "./Nav";
import Footer from "./Footer";

interface PageShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function PageShell({ children, title, subtitle }: PageShellProps) {
  return (
    <>
      <Nav />
      <main className="min-h-screen bg-creme">
        <div className="bg-charbon pt-32 pb-16">
          <div className="max-w-3xl mx-auto px-6">
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-creme leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-4 text-creme/50 text-lg max-w-[50ch]">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-6 py-16 lg:py-20">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
