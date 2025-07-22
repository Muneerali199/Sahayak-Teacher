"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import * as React from "react";
import Image from "next/image";
import { Pause, Play, Rabbit, Sparkles } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
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
  generateInteractiveStory,
  type GenerateInteractiveStoryOutput,
} from "@/ai/flows/interactive-storyteller";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const formSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters."),
  gradeLevel: z.string().min(1, "Please enter a grade level."),
  language: z.string().min(1, "Please select a language."),
});

type FormValues = z.infer<typeof formSchema>;

const StoryPlayer = ({
  story,
}: {
  story: GenerateInteractiveStoryOutput;
}) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [currentIllustrationIndex, setCurrentIllustrationIndex] =
    React.useState(0);
  const [timestamps, setTimestamps] = React.useState<number[]>([]);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio || story.illustrations.length === 0) return;

    const calculateTimestamps = () => {
      const { duration } = audio;
      if (isNaN(duration) || duration === 0) return;
      
      const numIllustrations = story.illustrations.length;
      const interval = duration / numIllustrations;
      const newTimestamps = Array.from(
        { length: numIllustrations },
        (_, i) => i * interval
      );
      setTimestamps(newTimestamps);
    };

    const handleTimeUpdate = () => {
      if (!audio) return;
      setProgress((audio.currentTime / audio.duration) * 100);

      const nextTimestampIndex = timestamps.findIndex(
        (ts) => ts > audio.currentTime
      );
      
      let newIndex = 0;
      if (nextTimestampIndex === -1) {
        newIndex = timestamps.length - 1;
      } else {
        newIndex = nextTimestampIndex - 1;
      }

      if (newIndex >= 0 && newIndex !== currentIllustrationIndex) {
        setCurrentIllustrationIndex(newIndex);
      }
    };

    const handlePlaybackEnd = () => {
      setIsPlaying(false);
      setProgress(100);
      setCurrentIllustrationIndex(story.illustrations.length - 1);
    };

    audio.addEventListener("loadedmetadata", calculateTimestamps);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handlePlaybackEnd);

    return () => {
      audio.removeEventListener("loadedmetadata", calculateTimestamps);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handlePlaybackEnd);
    };
  }, [story, timestamps, currentIllustrationIndex]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (audio.ended) {
        audio.currentTime = 0;
        setProgress(0);
        setCurrentIllustrationIndex(0);
      }
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const currentIllustration =
    story.illustrations[currentIllustrationIndex] || story.illustrations[0];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative w-full aspect-video bg-white">
            {currentIllustration && (
              <Image
                src={currentIllustration.imageDataUri}
                alt={`Illustration for scene ${currentIllustrationIndex + 1}`}
                layout="fill"
                objectFit="contain"
                className="transition-opacity duration-500"
                key={currentIllustrationIndex}
              />
            )}
          </div>
          <div className="p-4 bg-muted/50">
             <p className="text-sm text-center text-muted-foreground h-10">
              {currentIllustration?.sceneText}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center gap-4">
        <Button onClick={togglePlay} size="icon" className="rounded-full">
          {isPlaying ? <Pause /> : <Play className="ml-0.5" />}
        </Button>
        <Progress value={progress} className="h-2" />
      </div>
      
      <audio ref={audioRef} src={story.audioDataUri} className="hidden" />
    </div>
  );
};

export default function InteractiveStoryteller() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] =
    React.useState<GenerateInteractiveStoryOutput | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      gradeLevel: "2nd Grade",
      language: "English",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsLoading(true);
    setResult(null);
    try {
      const response = await generateInteractiveStory(values);
      if (response.illustrations.length === 0) {
        toast({
          title: "Couldn't generate illustrations",
          description: "The story was created, but no visual aids could be generated. Try a different prompt.",
          variant: "destructive",
        })
        const minimalResult: GenerateInteractiveStoryOutput = {
          ...response,
          illustrations: [{
            sceneText: response.fullStoryText,
            imageDataUri: "https://placehold.co/600x450.png",
          }]
        }
        setResult(minimalResult);
      } else {
        setResult(response);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description:
          "Failed to generate the story. This is an advanced feature and may fail occasionally. Please try again.",
        variant: "destructive",
        duration: 7000,
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
                AI Interactive Storyteller
              </CardTitle>
              <CardDescription>
                Bring stories to life! The AI will generate a unique story,
                create voices for each character, and draw illustrations for key
                scenes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Idea</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., A story about a friendly robot who learns to plant a garden."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <SelectItem value="Spanish">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader className="mr-2" /> : <Sparkles className="mr-2" />}
                Generate Story
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {isLoading && (
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <Loader size="lg" className="mb-4" />
            <p className="text-muted-foreground text-center">
              Crafting your story with voices and pictures...
              <br />
              This magical process can take up to a minute.
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl md:text-3xl">
              {result.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <StoryPlayer story={result} />
            <Separator />
            <div>
              <h4 className="font-semibold text-lg mb-2">Full Story Script</h4>
              <p className="whitespace-pre-wrap font-body text-base bg-secondary/30 p-4 rounded-md max-h-60 overflow-y-auto">
                {result.fullStoryText}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
