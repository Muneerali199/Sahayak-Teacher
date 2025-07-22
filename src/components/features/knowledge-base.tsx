"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";
import { Mic, Square, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { explainConcept } from "@/ai/flows/instant-knowledge-base";

const formSchema = z.object({
  question: z.string().optional(),
  localLanguage: z.string().min(1, "Please select a language."),
});

type FormValues = z.infer<typeof formSchema>;

export default function KnowledgeBase() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);

  const [isRecording, setIsRecording] = React.useState(false);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
      localLanguage: "English",
    },
  });
  
  const questionValue = form.watch("question");

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioBlob(null);
      setResult(null);
      form.setValue("question", "");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access the microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToDataUri = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  async function onSubmit(values: FormValues) {
    if (!values.question && !audioBlob) {
        toast({
            title: "Input required",
            description: "Please type a question or record one.",
            variant: "destructive"
        });
        return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      let audioQuestionDataUri: string | undefined = undefined;
      if (audioBlob) {
        audioQuestionDataUri = await blobToDataUri(audioBlob);
      }

      const response = await explainConcept({
        ...values,
        question: audioBlob ? undefined : values.question,
        audioQuestionDataUri,
      });
      setResult(response.explanation);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to get an explanation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const canSubmit = !isLoading && (!!questionValue || !!audioBlob);

  return (
    <div className="space-y-6">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle className="font-headline">Instant Knowledge Base</CardTitle>
              <CardDescription>
                Get simple, accurate explanations for complex student questions. Ask in English, Hindi, Marathi or another language with your voice or by typing, and get an answer in your chosen language.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type your question</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Why is the sky blue?"
                        rows={4}
                        {...field}
                        onChange={(e) => {
                            field.onChange(e);
                            if (audioBlob) setAudioBlob(null);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-2">
                <div className="flex-grow border-t border-muted"></div>
                <span className="text-xs text-muted-foreground">OR</span>
                <div className="flex-grow border-t border-muted"></div>
              </div>

              <FormItem>
                <FormLabel>Record your question</FormLabel>
                <div className="flex items-center gap-2">
                  <Button type="button" onClick={startRecording} disabled={isRecording} size="icon" variant="outline" aria-label="Start recording">
                    <Mic />
                  </Button>
                  <Button type="button" onClick={stopRecording} disabled={!isRecording} size="icon" variant="destructive" aria-label="Stop recording">
                    <Square />
                  </Button>
                  {isRecording && <div className="text-sm text-muted-foreground flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>Recording...</div>}
                  {audioBlob && !isRecording && <div className="text-sm text-green-600">Recording complete. Ready to submit.</div>}
                </div>
                {audioBlob && <audio src={URL.createObjectURL(audioBlob)} controls className="w-full mt-2"/>}
              </FormItem>
              
              <FormField
                control={form.control}
                name="localLanguage"
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
              <Button type="submit" disabled={!canSubmit}>
                {isLoading ? <Loader className="mr-2" /> : <Send className="mr-2" />}
                Explain Concept
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
              Thinking of a simple explanation...
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Explanation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap font-body text-base">
              {result}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
