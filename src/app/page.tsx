import { KeywordForm } from "@/components/keyword-form";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:px-8 md:py-12 min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-3 tracking-tight">
          Keyword Insights Generator
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Unlock powerful keyword clusters from a single seed term. Enter your keyword, 
          specify content and website type, and discover related, semantic, and phrase-match 
          opportunities to supercharge your SEO strategy.
        </p>
      </header>
      <KeywordForm />
    </main>
  );
}
