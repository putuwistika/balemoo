import { Routes, Route, Navigate } from "react-router-dom";
import { Users, Workflow, MessageSquare, TrendingUp, Settings, Radio } from "lucide-react";
import { KabarInLayout } from "./kabar-in/KabarInLayout";
import { Dashboard } from "./kabar-in/Dashboard";
import { TemplateManagement } from "./kabar-in/TemplateManagement";
import { GuestList } from "./kabar-in/GuestList";
import { ComingSoonPage } from "./kabar-in/ComingSoonPage";
import { ChatflowStudio } from "./kabar-in/chatflow/ChatflowStudio";
import { OperationCenter } from "./kabar-in/operation/OperationCenter";
import { CampaignDetailPage } from "./kabar-in/operation/CampaignDetailPage";
import { FlowList } from "./kabar-in/whatsapp-flow/FlowList";
import { FlowStudio } from "./kabar-in/whatsapp-flow/FlowStudio";

function Messages() {
  return (
    <ComingSoonPage
      icon={MessageSquare}
      title="Message Center"
      description="Send, track, and manage all your WhatsApp messages in one centralized platform. Monitor delivery status and engage with your guests in real-time."
      color="#ec4899"
      features={[
        "Send bulk messages with templates",
        "Real-time delivery tracking",
        "Message scheduling and automation",
        "Conversation history",
        "Quick reply templates",
        "Message queue management",
        "Failed message retry system",
      ]}
    />
  );
}

function Analytics() {
  return (
    <ComingSoonPage
      icon={TrendingUp}
      title="Analytics Dashboard"
      description="Get deep insights into your WhatsApp campaigns with comprehensive analytics, visualizations, and performance metrics."
      color="#6366f1"
      features={[
        "Message delivery and open rates",
        "Campaign performance comparison",
        "Guest engagement metrics",
        "Response rate analytics",
        "Time-based trend analysis",
        "Export reports to PDF/Excel",
        "Real-time statistics dashboard",
      ]}
    />
  );
}

function SettingsPage() {
  return (
    <ComingSoonPage
      icon={Settings}
      title="Settings & Configuration"
      description="Configure your WhatsApp Business API, manage project settings, user permissions, and customize your CRM experience."
      color="#64748b"
      features={[
        "WhatsApp Business API integration",
        "Project-specific settings",
        "User role management",
        "Notification preferences",
        "Webhook configuration",
        "API access tokens",
        "Billing and subscription management",
      ]}
    />
  );
}

export function KabarIn() {
  return (
    <KabarInLayout>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="templates" element={<TemplateManagement />} />
        <Route path="guests" element={<GuestList />} />
        <Route path="chatflow" element={<ChatflowStudio />} />
        <Route path="chatflow/:id" element={<ChatflowStudio />} />
        <Route path="whatsapp-flows" element={<FlowList />} />
        <Route path="whatsapp-flows/:flowId" element={<FlowStudio />} />
        <Route path="operation" element={<OperationCenter />} />
        <Route path="operation/:campaignId" element={<CampaignDetailPage />} />
        <Route path="messages" element={<Messages />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/kabar-in" replace />} />
      </Routes>
    </KabarInLayout>
  );
}
