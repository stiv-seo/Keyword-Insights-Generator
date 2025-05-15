// src/components/keyword-form.tsx
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { GenerateKeywordClusterInput, GenerateKeywordClusterOutput } from "@/ai/flows/generate-keyword-cluster";
import { generateKeywordsAction } from "@/app/actions";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { KeywordClusterDisplay } from "./keyword-cluster-display";

const contentTypes = [
  { value: "article", label: "Artículo" },
  { value: "internal page", label: "Página Interna" },
  { value: "landing page", label: "Página de Destino" },
] as const;

type ContentTypeValue = (typeof contentTypes)[number]['value'];

const countries = [
  { value: "global", label: "Global" },
  { value: "es", label: "España" },
  { value: "mx", label: "México" },
  { value: "ar", label: "Argentina" },
  { value: "co", label: "Colombia" },
  { value: "us", label: "Estados Unidos" },
  { value: "gb", label: "Reino Unido" },
  { value: "fr", label: "Francia" },
  { value: "de", label: "Alemania" },
  { value: "it", label: "Italia" },
  { value: "br", label: "Brasil" },
  { value: "ca", label: "Canadá" },
  { value: "au", label: "Australia" },
] as const;

type CountryValue = (typeof countries)[number]['value'];

const formSchema = z.object({
  seedKeyword: z.string().min(2, { message: "La palabra clave raíz debe tener al menos 2 caracteres." }),
  contentType: z.enum(contentTypes.map(ct => ct.value) as [ContentTypeValue, ...ContentTypeValue[]], {
    errorMap: () => ({ message: "Por favor selecciona un tipo de contenido." }),
  }),
  websiteType: z.string().min(2, { message: "El tipo de sitio web debe tener al menos 2 caracteres." }),
  country: z.enum(countries.map(c => c.value) as [CountryValue, ...CountryValue[]], {
    errorMap: () => ({ message: "Por favor selecciona un país." }),
  }),
});

type KeywordFormData = z.infer<typeof formSchema>;

export function KeywordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clusterData, setClusterData] = useState<GenerateKeywordClusterOutput | null>(null);

  const form = useForm<KeywordFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seedKeyword: "",
      contentType: undefined,
      websiteType: "",
      country: "global",
    },
  });

  const onSubmit: SubmitHandler<KeywordFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setClusterData(null);

    const result = await generateKeywordsAction(data as GenerateKeywordClusterInput);

    if (result.success) {
      setClusterData(result.data);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl text-primary">Encuentra Tus Palabras Clave</CardTitle>
          <CardDescription className="text-md">
            Ingresa tu palabra clave raíz y los detalles de tu sitio web para generar un grupo completo de palabras clave.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="seedKeyword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Palabra Clave Raíz</FormLabel>
                    <FormControl>
                      <Input placeholder="ej., 'estrategias de marketing de contenidos'" {...field} className="text-base"/>
                    </FormControl>
                    <FormDescription>El tema principal o palabra clave que quieres explorar.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Tipo de Contenido</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Selecciona el tipo de contenido" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value} className="text-base">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Especifica el tipo de contenido que estás planeando.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="websiteType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Tipo de Sitio Web / Nicho</FormLabel>
                    <FormControl>
                      <Input placeholder="ej., 'blog SaaS', 'e-commerce de moda', 'panadería local'" {...field} className="text-base"/>
                    </FormControl>
                    <FormDescription>Describe el enfoque o industria de tu sitio web.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">País</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Selecciona un país" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value} className="text-base">
                            {country.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Selecciona el país para el análisis SEO (volumen de búsqueda y dificultad).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generando...
                  </>
                ) : (
                  "Generar Grupo de Palabras Clave"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {clusterData && (
        <div className="mt-6">
          <KeywordClusterDisplay clusterData={clusterData} />
        </div>
      )}
    </div>
  );
}
