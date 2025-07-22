
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BrainCircuit,
  Languages,
  Paintbrush,
  BookOpenCheck,
  Sparkles,
  CalendarCheck,
  GitBranch,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useIsMobile } from "@/hooks/use-mobile";

export default function LandingPage() {
  const followerRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (followerRef.current) {
        const { clientX, clientY } = event;
        followerRef.current.style.transform = `translate(${clientX}px, ${clientY}px) translate(-50%, -50%)`;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isMobile]);

  const features = [
    {
      icon: <Languages className="w-8 h-8 text-primary" />,
      title: "Localized Content Generation",
      description: "Create stories and examples in Hindi, Marathi, and more from a simple prompt.",
    },
    {
      icon: <BookOpenCheck className="w-8 h-8 text-primary" />,
      title: "Differentiated Materials",
      description: "Generate multiple versions of a worksheet from a textbook photo for different grade levels.",
    },
    {
      icon: <BrainCircuit className="w-8 h-8 text-primary" />,
      title: "Instant Knowledge Base",
      description: "Get simple, clear explanations for complex student questions with voice or text.",
    },
    {
      icon: <Paintbrush className="w-8 h-8 text-primary" />,
      title: "Visual Aid Design",
      description: "Describe a concept and get a simple visual aid you can draw on a blackboard.",
    },
    {
      icon: <CalendarCheck className="w-8 h-8 text-primary" />,
      title: "Weekly Lesson Planner",
      description: "Automate the creation of structured weekly lesson plans for any topic and grade.",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "And much more...",
      description: "From audio assessments to on-the-fly game generation, Sahayak is your all-in-one assistant.",
    },
  ];

  const techStack = [
    {
      name: 'Next.js',
      logo: (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-foreground">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.22 17.22l-5.22-8.95-5.22 8.95h3.13v-3.13h4.18v3.13h3.13z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'React',
      logo: (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-foreground">
          <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
          <ellipse cx="12" cy="12" rx="11" ry="4.5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <ellipse cx="12" cy="12" rx="11" ry="4.5" transform="rotate(60 12 12)" stroke="currentColor" strokeWidth="1.5" fill="none"/>
          <ellipse cx="12" cy="12" rx="11" ry="4.5" transform="rotate(120 12 12)" stroke="currentColor" strokeWidth="1.5" fill="none"/>
        </svg>
      )
    },
    {
      name: 'Tailwind CSS',
      logo: (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-foreground">
          <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" fill="currentColor"/>
        </svg>
      )
    },
    {
      name: 'Firebase',
      logo: (
        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-foreground">
          <path d="M4.173 2.062L2.016 3.203l9.81 17.584 2.157-1.22L4.173 2.062zM15.86 6.03l-3.27 5.834 3.016 1.708 5.378-9.593-5.124 2.05zM9.017 4.5l-5.32 2.99 3.2 5.706L9.017 4.5z" fill="currentColor"/>
        </svg>
      )
    },
    {
        name: 'Google AI',
        logo: (
          <svg
            className="w-12 h-12 text-foreground"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2.5L13.125 6.875L17.5 8L13.125 9.125L12 13.5L10.875 9.125L6.5 8L10.875 6.875L12 2.5Z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
            <path
              d="M5 9.5L5.625 11.375L7.5 12L5.625 12.625L5 14.5L4.375 12.625L2.5 12L4.375 11.375L5 9.5Z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
             <path
              d="M20 15.5L18.875 17.375L17 18L18.875 18.625L20 20.5L21.125 18.625L23 18L21.125 17.375L20 15.5Z"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        ),
      },
    {
      name: 'Genkit',
      logo: <GitBranch className="w-12 h-12 text-foreground" />,
    }
  ];

  return (
    <>
      {!isMobile && <div ref={followerRef} className="cursor-follower-element" />}
      <div className="flex flex-col min-h-dvh bg-background text-foreground">
        <div className="absolute top-0 left-0 w-full h-full bg-background -z-10 overflow-hidden">
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/10 rounded-full filter blur-3xl dark:bg-primary/20" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-accent/20 rounded-full filter blur-3xl dark:bg-accent/30" />
        </div>

        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold font-headline">Sahayak Teacher</span>
            </div>
            <nav className="flex items-center gap-2">
              <ThemeToggle />
              <Link href="/login" className="hidden sm:block">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button>
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <section className="py-24 md:py-32 lg:py-40">
            <div className="container text-center">
              <div className="mb-6 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary shadow-md">
                  <span> Hackathon Submission</span>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl font-headline bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 dark:to-foreground/80">
                Your AI-Powered Teaching Assistant
              </h1>
              <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground">
                Spend less time on prep and more time on what matters most—teaching. Sahayak helps you with lesson plans, materials, and creative ideas, all in your local language.
              </p>
              <div className="mt-10">
                <Link href="/login">
                  <Button size="lg" className="shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow dark:shadow-lg dark:shadow-primary/30 dark:hover:shadow-primary/50">
                    Start For Free <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section id="features" className="py-20 md:py-24 bg-secondary/50 dark:bg-transparent">
            <div className="container">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Everything a Teacher Needs</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">From planning to assessment, Sahayak has you covered.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-card/60 dark:bg-gradient-to-br dark:from-secondary/10 dark:to-secondary/[.05] backdrop-blur-sm border border-border/50 dark:border-border/20 p-6 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:border-primary/50 dark:hover:border-primary/70">
                    <div className="mb-4 bg-primary/10 text-primary p-3 rounded-lg w-fit">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
          
          <section className="py-20 md:py-24">
            <div className="container">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Powered by a Cutting-Edge Tech Stack</h2>
                <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Built with the best tools to deliver a reliable and intelligent experience.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center justify-center">
                {techStack.map((tech) => (
                  <div key={tech.name} className="flex flex-col items-center justify-center gap-3 text-center transition-transform hover:-translate-y-1">
                    <div className="flex items-center justify-center w-24 h-24 rounded-full bg-secondary/50 dark:bg-secondary/10 p-4 transition-all duration-300 hover:bg-primary/10 dark:hover:bg-primary/20 group">
                      <div className="transition-transform group-hover:scale-110">{tech.logo}</div>
                    </div>
                    <span className="font-semibold text-muted-foreground">{tech.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="py-24 md:py-32">
              <div className="container grid md:grid-cols-2 gap-16 items-center">
                  <div className="order-2 md:order-1">
                      <h2 className="text-3xl md:text-4xl font-bold font-headline">Built for the Indian Classroom</h2>
                      <p className="mt-4 text-lg text-muted-foreground">
                          Sahayak understands the unique needs of teachers in India. It generates hyper-local content, works with multiple Indian languages, and creates materials that are culturally relevant and easy to use in your classroom.
                      </p>
                      <div className="mt-8">
                          <Link href="/login">
                              <Button size="lg" variant="outline">
                                  See it in Action
                              </Button>
                          </Link>
                      </div>
                  </div>
                  <div className="order-1 md:order-2 p-2 bg-gradient-to-br from-primary via-primary/30 to-background dark:from-primary/80 dark:via-primary/40 rounded-2xl shadow-2xl dark:shadow-primary/30">
                      <Image
                          src="https://placehold.co/600x450.png"
                          alt="Teacher in an Indian classroom"
                          width={600}
                          height={450}
                          className="rounded-lg"
                          data-ai-hint="indian classroom"
                      />
                  </div>
              </div>
          </section>
        </main>

        <footer className="border-t">
          <div className="container py-8 text-center text-sm text-muted-foreground">
            Built by beautifull human.
          </div>
        </footer>
      </div>
    </>
  );
}
