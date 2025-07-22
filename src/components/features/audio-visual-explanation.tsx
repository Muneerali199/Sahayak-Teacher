"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";
import Image from "next/image";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import {
  generateAudioVisualExplanation,
  type GenerateAudioVisualExplanationOutput,
} from "@/ai/flows/generate-audio-visual-explanation";

const formSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters."),
  language: z.string().min(1, "Please select a language."),
});

type FormValues = z.infer<typeof formSchema>;

export default function AudioVisualExplanation() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] =
    React.useState<GenerateAudioVisualExplanationOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: "",
      language: "English",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateAudioVisualExplanation(values);
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          "Failed to generate the explanation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline">
                Audio-Visual Explanation
              </CardTitle>
              <CardDescription>
                Enter a topic, and the AI will generate a spoken explanation
                with a custom visual aid in your chosen language.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., How do volcanoes work?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Marathi">Marathi</SelectItem>
                        <SelectItem value="Bengali">Bengali</SelectItem>
                        <SelectItem value="Tamil">Tamil</SelectItem>
                        <SelectItem value="Telugu">Telugu</SelectItem>
                        <SelectItem value="Gujarati">Gujarati</SelectItem>
                        <SelectItem value="Kannada">Kannada</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader className="mr-2" /> : <Sparkles className="mr-2" />}
                Generate Explanation
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Loader size="lg" className="mb-4" />
            <p className="text-muted-foreground">
              Generating your lesson... this may take a moment.
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Your Explanation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative aspect-video w-full max-w-lg mx-auto border rounded-lg overflow-hidden bg-white">
              <Image
                src={result.visualAidDataUri}
                alt="Generated Visual Aid"
                layout="fill"
                objectFit="contain"
              />
            </div>

            <div>
              <audio controls src={result.audioDataUri} className="w-full">
                Your browser does not support the audio element.
              </audio>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Explanation Script</h4>
              <p className="text-sm text-muted-foreground border p-3 rounded-md bg-secondary/50">
                {result.explanation}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
