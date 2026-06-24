import Link from "next/link";

interface LegalPageShellProps {
  children: React.ReactNode;
  title: string;
}

export default function LegalPageShell({ children, title }: LegalPageShellProps) {
  return (
    <main className="bg-noir min-h-screen py-16 lg:py-20">
      <div className="max-w-2xl mx-auto px-6">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-dust/50 hover:text-dust/80 transition-colors duration-200 mb-10"
        >
          ← Retour à l&apos;accueil
        </Link>

        <h1 className="font-landing-display text-3xl lg:text-4xl font-semibold text-dust leading-tight mb-12">
          {title}
        </h1>

        <div className="space-y-10">{children}</div>
      </div>
    </main>
  );
}
