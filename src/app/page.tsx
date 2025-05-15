import { KeywordForm } from "@/components/keyword-form";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:px-8 md:py-12 min-h-screen">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-3 tracking-tight">
          Generador de Estadísticas de Palabras Clave
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Desbloquea potentes grupos de palabras clave a partir de un solo término raíz. Ingresa tu palabra clave, 
          especifica el tipo de contenido y sitio web, y descubre oportunidades relacionadas, semánticas y de concordancia 
          de frase para potenciar tu estrategia SEO.
        </p>
      </header>
      <KeywordForm />
    </main>
  );
}
