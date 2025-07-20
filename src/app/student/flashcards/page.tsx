'use client';

import { useState } from 'react';
import { DashboardPage } from '@/components/layout/dashboard-page';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { getFlashcards } from '@/lib/actions';
import type { GenerateFlashcardsOutput } from '@/lib/actions';
import { cn } from '@/lib/utils';

interface Flashcard {
  term: string;
  definition: string;
}

const FlashcardComponent = ({ card, index }: { card: Flashcard; index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="w-full h-48 [perspective:1000px] group"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        className={cn(
          'relative w-full h-full text-center transition-transform duration-500 [transform-style:preserve-3d]',
          isFlipped && '[transform:rotateY(180deg)]'
        )}
        style={{ animationDelay: `${index * 100}ms` }}
      >
        {/* Front */}
        <div className="absolute w-full h-full flex flex-col items-center justify-center bg-card text-card-foreground border rounded-lg p-4 [backface-visibility:hidden]">
          <h3 className="text-lg font-semibold">{card.term}</h3>
        </div>
        {/* Back */}
        <div className="absolute w-full h-full flex flex-col items-center justify-center bg-primary text-primary-foreground border rounded-lg p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p>{card.definition}</p>
        </div>
      </div>
    </div>
  );
};

export default function FlashcardsPage() {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateFlashcards = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a topic.',
      });
      return;
    }

    setIsLoading(true);
    setFlashcards(null);

    const result = await getFlashcards({ topic });
    if (result.success) {
      setFlashcards(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Flashcard Generation Failed',
        description: result.error,
      });
    }
    setIsLoading(false);
  };

  return (
    <DashboardPage title="AI Flashcard Generator" role="Student">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create Flashcards</CardTitle>
              <CardDescription>Enter a topic, and we'll generate flashcards for you to study.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateFlashcards} className="space-y-4">
                <div>
                  <Label htmlFor="topic">Topic</Label>
                  <Input
                    id="topic"
                    name="topic"
                    placeholder="e.g., The Solar System"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </div>
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Flashcards
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle>Your Flashcards</CardTitle>
              <CardDescription>Click on a card to flip it over. Click the generate button to start.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[...Array(8)].map((_, i) => (
                     <div key={i} className="w-full h-48 bg-muted rounded-lg animate-pulse"></div>
                  ))}
                </div>
              )}
              {flashcards && flashcards.flashcards.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {flashcards.flashcards.map((card, index) => (
                    <FlashcardComponent key={index} card={card} index={index} />
                  ))}
                </div>
              )}
               {!isLoading && (!flashcards || flashcards.flashcards.length === 0) && (
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-64">
                    <RefreshCw className="w-12 h-12 mb-4" />
                    <p>Your generated flashcards will appear here.</p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardPage>
  );
}
