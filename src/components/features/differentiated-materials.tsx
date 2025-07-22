"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";
import { Upload, UsersRound } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { createDifferentiatedMaterials } from "@/ai/flows/create-differentiated-materials";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  textbookPagePhotoDataUri: z.string().min(1, "Please upload an image."),
  gradeLevels: z
    .string()
    .min(3, "Please enter the grade levels (e.g., '1st, 2nd, and 3rd')."),
});

type FormValues = z.infer<typeof formSchema>;

export default function DifferentiatedMaterials() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<string[] | null>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textbookPagePhotoDataUri: "",
      gradeLevels: "",
    },
  });

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const dataUri = loadEvent.target?.result as string;
        fieldChange(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await createDifferentiatedMaterials(values);
      setResult(response.worksheetVersions);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          "Failed to generate differentiated materials. Please try again.",
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
                Differentiated Material Creation
              </CardTitle>
              <CardDescription>
                Upload a photo of a textbook page to generate worksheets
                tailored to different grade levels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="textbookPagePhotoDataUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Textbook Page Photo</FormLabel>
                    <FormControl>
                      <div>
                        <Input
                          type="file"
                          id="textbook-photo"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, field.onChange)}
                        />
                        <Label
                          htmlFor="textbook-photo"
                          className={cn(
                            buttonVariants({ variant: "outline" }),
                            "cursor-pointer w-full md:w-auto"
                          )}
                        >
                          <Upload className="mr-2" />
                          {fileName || "Upload an image"}
                        </Label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeLevels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Levels</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 1st, 2nd, and 3rd"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the target grade levels, separated by commas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader className="mr-2" />}
                Generate Worksheets
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
              Generating worksheets... this may take a moment.
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Generated Worksheets</CardTitle>
            <CardDescription>
              Here are the different versions of the worksheet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {result.map((worksheet, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger>
                    Worksheet Version {index + 1}
                  </AccordionTrigger>
                  <AccordionContent>
                    <pre className="whitespace-pre-wrap font-body text-sm">
                      {worksheet}
                    </pre>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
