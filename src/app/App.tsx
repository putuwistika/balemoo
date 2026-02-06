import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Product } from "./components/Product";
import { Login } from "./components/Login";
import { Dashboard } from "./components/Dashboard";
import { KabarIn } from "./components/KabarIn";
import { CheckIn } from "./components/CheckIn";
import { MonitorIn } from "./components/MonitorIn";
import { DemoUsers } from "./components/DemoUsers";
import { ProjectSelection } from "./components/ProjectSelection";
import { AppHeader } from "./components/AppHeader";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import { ProjectProvider } from "./contexts/ProjectContext";
import { TemplateProvider } from "./contexts/TemplateContext";
import { GuestProvider } from "./contexts/GuestContext";
import { ChatflowProvider } from "./contexts/ChatflowContext";
import { WhatsAppFlowProvider } from "./contexts/WhatsAppFlowContext";
import { CampaignProvider } from "./contexts/CampaignContext";
import { ExecutionProvider } from "./contexts/ExecutionContext";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { Toaster } from "@/app/components/ui/sonner";

// Landing Page Component
function LandingPage() {
  return (
    <>
      <Header />
      <Hero />
      <About />
      <Product />
    </>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: '1rem',
          color: '#6b6b6b',
        }}
      >
        Loading...
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ProjectProvider>
            <TemplateProvider>
              <GuestProvider>
                <ChatflowProvider>
                  <WhatsAppFlowProvider>
                    <CampaignProvider>
                      <ExecutionProvider>
                        <Suspense fallback={<LoadingFallback />}>
                          <div className="size-full">
                            <AppHeader />
                            <Routes>
                              <Route path="/" element={<LandingPage />} />
                              <Route path="/login" element={<Login />} />
                              <Route path="/demo" element={<DemoUsers />} />
                              <Route path="/projects" element={<ProjectSelection />} />
                              <Route path="/dashboard" element={<Dashboard />} />
                              {/* Placeholder routes for products */}
                              <Route path="/kabar-in/*" element={<KabarIn />} />
                              <Route path="/check-in" element={<CheckIn />} />
                              <Route path="/monitor-in" element={<MonitorIn />} />
                              {/* Catch all route */}
                              <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                          </div>
                        </Suspense>
                        <Toaster />
                      </ExecutionProvider>
                    </CampaignProvider>
                  </WhatsAppFlowProvider>
                </ChatflowProvider>
              </GuestProvider>
            </TemplateProvider>
          </ProjectProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary >
  );
}