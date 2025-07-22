"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
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
import { designVisualAid } from "@/ai/flows/design-visual-aids";

const formSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters."),
});

type FormValues = z.infer<typeof formSchema>;

export default function VisualAids() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await designVisualAid(values);
      setResult(response.visualAidDataUri);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to design visual aid. Please try again.",
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
              <CardTitle className="font-headline">Visual Aid Design</CardTitle>
              <CardDescription>
                Design simple visual aids that can be easily drawn on a blackboard to explain concepts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visual Aid Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A simple diagram of the water cycle with arrows showing evaporation, condensation, and precipitation."
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader className="mr-2" />}
                Design Visual Aid
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
              Sketching your idea... this may take a moment.
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Generated Visual Aid</CardTitle>
            <CardDescription>
              Here is a simple visual aid based on your description.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full max-w-lg mx-auto border rounded-lg overflow-hidden">
                <Image
                    src={result}
                    alt="Generated Visual Aid"
                    layout="fill"
                    objectFit="contain"
                    className="bg-white"
                />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
