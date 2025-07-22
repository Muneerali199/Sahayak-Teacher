"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";
import { Mic, MicOff, Square, Send } from "lucide-react";

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
import { assessReading, type AssessReadingOutput } from "@/ai/flows/reading-assessment";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  textToRead: z.string().min(20, "Please enter at least 20 characters of text to read."),
  gradeLevel: z.string().min(1, "Please enter a grade level."),
});

type FormValues = z.infer<typeof formSchema>;

export default function AudioAssessment() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<AssessReadingOutput | null>(null);
  const [isRecording, setIsRecording] = React.useState(false);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textToRead: "",
      gradeLevel: "",
    },
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
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
    if (!audioBlob) {
      toast({
        title: "No Audio",
        description: "Please record audio before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);
    try {
      const audioRecordingDataUri = await blobToDataUri(audioBlob);
      const response = await assessReading({ ...values, audioRecordingDataUri });
      setResult(response);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to get assessment. Please try again.",
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
              <CardTitle className="font-headline">Audio-Based Reading Assessment</CardTitle>
              <CardDescription>
                Provide a text and record a student reading it to get a detailed assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="textToRead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text to Read</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter the passage the student will read aloud." rows={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gradeLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grade Level</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2nd Grade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Record Audio</FormLabel>
                <div className="flex items-center gap-2">
                  <Button type="button" onClick={startRecording} disabled={isRecording} size="icon" variant="outline">
                    <Mic />
                    <span className="sr-only">Start Recording</span>
                  </Button>
                  <Button type="button" onClick={stopRecording} disabled={!isRecording} size="icon" variant="destructive">
                    <Square />
                    <span className="sr-only">Stop Recording</span>
                  </Button>
                  {isRecording && <div className="text-sm text-muted-foreground flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>Recording...</div>}
                  {audioBlob && !isRecording && <div className="text-sm text-green-600">Recording complete. Ready to submit.</div>}
                </div>
                {audioBlob && <audio src={URL.createObjectURL(audioBlob)} controls className="w-full mt-2"/>}
              </FormItem>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading || !audioBlob}>
                {isLoading ? <Loader className="mr-2" /> : <Send className="mr-2" />}
                Assess Reading
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Loader size="lg" className="mb-4" />
            <p className="text-muted-foreground">Analyzing reading... this may take a moment.</p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Reading Assessment Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-semibold">Summary</h4>
              <div className="flex flex-wrap gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Fluency</p>
                  <p className="font-medium">{result.fluency}</p>
                </div>
                 <div>
                  <p className="text-muted-foreground">Accuracy</p>
                  <p className="font-medium">{result.accuracy.toFixed(1)}%</p>
                </div>
              </div>
            </div>
             <div className="space-y-2">
                <h4 className="font-semibold">Transcription</h4>
                <p className="text-sm text-muted-foreground border p-3 rounded-md bg-secondary/50">"{result.transcribedText}"</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Feedback</h4>
              <p className="text-sm">{result.feedback}</p>
            </div>
            {result.mispronouncedWords.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Words to Practice</h4>
                <div className="flex flex-wrap gap-2">
                  {result.mispronouncedWords.map((word, index) => (
                    <Badge key={index} variant="secondary">{word}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
