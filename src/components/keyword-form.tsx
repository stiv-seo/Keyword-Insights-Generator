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
  { value: "article", label: "Article" },
  { value: "internal page", label: "Internal Page" },
  { value: "landing page", label: "Landing Page" },
] as const;

type ContentTypeValue = (typeof contentTypes)[number]['value'];

const formSchema = z.object({
  seedKeyword: z.string().min(2, { message: "Seed keyword must be at least 2 characters." }),
  contentType: z.enum(contentTypes.map(ct => ct.value) as [ContentTypeValue, ...ContentTypeValue[]], {
    errorMap: () => ({ message: "Please select a content type." }),
  }),
  websiteType: z.string().min(2, { message: "Website type must be at least 2 characters." }),
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
          <CardTitle className="text-3xl text-primary">Find Your Keywords</CardTitle>
          <CardDescription className="text-md">
            Enter your seed keyword and website details to generate a comprehensive keyword cluster.
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
                    <FormLabel className="font-semibold">Seed Keyword</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'content marketing strategies'" {...field} className="text-base"/>
                    </FormControl>
                    <FormDescription>The main topic or keyword you want to explore.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Content Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Select content type" />
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
                    <FormDescription>Specify the type of content you're planning.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="websiteType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Website Type / Niche</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 'SaaS blog', 'e-commerce fashion', 'local bakery'" {...field} className="text-base"/>
                    </FormControl>
                    <FormDescription>Describe your website's focus or industry.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Keyword Cluster"
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
