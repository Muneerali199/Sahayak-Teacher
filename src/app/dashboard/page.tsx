"use client";

import * as React from "react";
import {
  AudioLines,
  BrainCircuit,
  CalendarPlus,
  Gamepad2,
  Languages,
  Paintbrush,
  PanelLeft,
  Presentation,
  Rabbit,
  UsersRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons";
import { Button } from "@/components/ui/button";

import LocalizedContent from "@/components/features/localized-content";
import DifferentiatedMaterials from "@/components/features/differentiated-materials";
import KnowledgeBase from "@/components/features/knowledge-base";
import VisualAids from "@/components/features/visual-aids";
import LessonPlanner from "@/components/features/lesson-planner";
import AudioAssessment from "@/components/features/audio-assessment";
import GameGeneration from "@/components/features/game-generation";
import AudioVisualExplanation from "@/components/features/audio-visual-explanation";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/context/auth-context";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import InteractiveStoryteller from "@/components/features/interactive-storyteller";


type Feature =
  | "localize"
  | "differentiate"
  | "knowledge"
  | "visualize"
  | "plan"
  | "assess"
  | "gamify"
  | "explain"
  | "storytell";

function Dashboard() {
  const [activeFeature, setActiveFeature] = React.useState<Feature>("localize");
  const { user } = useAuth();
  const router = useRouter();
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


  const handleSignOut = () => {
    if (!auth) return;
    signOut(auth).then(() => {
        router.push('/');
    }).catch((error) => console.error("Sign out error", error));
  };


  const renderFeature = () => {
    switch (activeFeature) {
      case "localize":
        return <LocalizedContent />;
      case "differentiate":
        return <DifferentiatedMaterials />;
      case "knowledge":
        return <KnowledgeBase />;
      case "visualize":
        return <VisualAids />;
      case "plan":
        return <LessonPlanner />;
      case "assess":
        return <AudioAssessment />;
      case "gamify":
        return <GameGeneration />;
      case "explain":
        return <AudioVisualExplanation />;
      case "storytell":
        return <InteractiveStoryteller />;
      default:
        return <LocalizedContent />;
    }
  };

  const menuItems = [
    { id: "localize", icon: Languages, label: "Localized Content" },
    {
      id: "differentiate",
      icon: UsersRound,
      label: "Differentiated Materials",
    },
    { id: "knowledge", icon: BrainCircuit, label: "Instant Knowledge Base" },
    { id: "visualize", icon: Paintbrush, label: "Visual Aid Design" },
    { id: "plan", icon: CalendarPlus, label: "Weekly Lesson Planner" },
    {
      id: "assess",
      icon: AudioLines,
      label: "Audio Assessments",
      disabled: false,
    },
    { id: "gamify", icon: Gamepad2, label: "Game Generation", disabled: false },
    { id: "explain", icon: Presentation, label: "Audio-Visual Explanation" },
    { id: "storytell", icon: Rabbit, label: "Interactive Storyteller" },
  ];

  return (
    <>
      {!isMobile && <div ref={followerRef} className="cursor-follower-element" />}
      <SidebarProvider>
        <div className="flex min-h-screen bg-secondary/40">
          <Sidebar>
            <SidebarHeader>
              <div className="flex items-center gap-2">
                <Logo className="size-8" />
                <span className="text-xl font-semibold font-headline">
                  Sahayak
                </span>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      onClick={() => setActiveFeature(item.id as Feature)}
                      isActive={activeFeature === item.id}
                      disabled={item.disabled}
                      tooltip={item.label}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  {user?.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || "User"} />}
                  <AvatarFallback>{user?.displayName?.charAt(0) || 'T'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-sm">
                  <span className="font-semibold">{user?.displayName || "Teacher"}</span>
                  <span className="text-muted-foreground">{user?.email || "teacher@school.org"}</span>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>
          <SidebarInset className="flex flex-col p-4 md:p-6 lg:p-8">
            <header className="flex items-center justify-between md:justify-end mb-4 gap-4">
              <SidebarTrigger className="md:hidden">
                <PanelLeft />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button variant="outline" onClick={handleSignOut}>Logout</Button>
              </div>
            </header>
            <main className="flex-1">{renderFeature()}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
}


export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    )
}
