// src/components/keyword-cluster-display.tsx
"use client";

import type { GenerateKeywordClusterOutput, KeywordInfo } from "@/ai/flows/generate-keyword-cluster";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Brain, Network, SearchCheck } from "lucide-react";

interface KeywordClusterDisplayProps {
  clusterData: GenerateKeywordClusterOutput;
}

interface KeywordSectionProps {
  title: string;
  keywords: KeywordInfo[];
  icon: React.ElementType;
}

const KeywordSection: React.FC<KeywordSectionProps> = ({ title, keywords, icon: Icon }) => {
  if (!keywords || keywords.length === 0) {
    return (
      <AccordionItem value={title.toLowerCase().replace(/\s+/g, '-')}>
        <AccordionTrigger className="text-lg font-semibold text-primary">
          <div className="flex items-center">
            <Icon className="mr-2 h-5 w-5 text-accent" />
            {title} (0)
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <p className="text-muted-foreground p-4">No keywords found for this category.</p>
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <AccordionItem value={title.toLowerCase().replace(/\s+/g, '-')}>
      <AccordionTrigger className="text-lg font-semibold text-primary hover:no-underline">
        <div className="flex items-center">
          <Icon className="mr-2 h-5 w-5 text-accent" />
          {title} ({keywords.length})
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Keyword</TableHead>
              <TableHead className="text-right font-semibold">Search Volume</TableHead>
              <TableHead className="text-right font-semibold">Ranking Difficulty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {keywords.map((kw, index) => (
              <TableRow key={index}>
                <TableCell>{kw.keyword}</TableCell>
                <TableCell className="text-right">{kw.searchVolume.toLocaleString()}</TableCell>
                <TableCell className="text-right">{kw.rankingDifficulty}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AccordionContent>
    </AccordionItem>
  );
};

export function KeywordClusterDisplay({ clusterData }: KeywordClusterDisplayProps) {
  return (
    <Card className="mt-8 shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Keyword Cluster Results</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          <KeywordSection title="Related Keywords" keywords={clusterData.relatedKeywords} icon={Network} />
          <KeywordSection title="Semantic Keywords" keywords={clusterData.semanticKeywords} icon={Brain} />
          <KeywordSection title="Phrase Match Keywords" keywords={clusterData.phraseMatchKeywords} icon={SearchCheck} />
        </Accordion>
      </CardContent>
    </Card>
  );
}
