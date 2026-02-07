import { useState, useCallback, useMemo } from "react";
import {
  Plus,
  Trash2,
  Copy,
  Check,
  Download,
  Upload,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Code,
  FileJson,
  Type,
  TextCursorInput,
  ListChecks,
  CircleDot,
  ChevronDownSquare,
  ToggleLeft,
  Link,
  Calendar,
  CalendarRange,
  Image as ImageIcon,
  Images,
  ArrowDown,
  GripVertical,
  Settings2,
  Layers,
  Eye,
  X,
  List,
  Tag,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

interface FlowJSON {
  version: string;
  screens: FlowScreen[];
  routing_model?: Record<string, string[]>;
  data_api_version?: string;
  data_channel_uri?: string;
}

interface FlowScreen {
  id: string;
  title?: string;
  terminal?: boolean;
  success?: boolean;
  data?: Record<string, any>;
  layout: {
    type: "SingleColumnLayout";
    children: FlowComponent[];
  };
}

interface FlowComponent {
  type: string;
  [key: string]: any;
}

// ============================================================
// COMPONENT CATALOG
// ============================================================

interface ComponentTemplate {
  type: string;
  label: string;
  icon: typeof Type;
  category: "text" | "input" | "selection" | "interactive" | "media" | "layout";
  defaultProps: Record<string, any>;
  editableFields: EditableField[];
}

interface EditableField {
  key: string;
  label: string;
  type: "text" | "boolean" | "select" | "number" | "json" | "options" | "action" | "navlist-items";
  options?: { label: string; value: string }[];
  placeholder?: string;
}

const COMPONENT_CATALOG: ComponentTemplate[] = [
  // Text Components
  {
    type: "TextHeading",
    label: "Heading",
    icon: Type,
    category: "text",
    defaultProps: { text: "Heading text" },
    editableFields: [
      { key: "text", label: "Text", type: "text", placeholder: "Enter heading text" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  {
    type: "TextSubheading",
    label: "Subheading",
    icon: Type,
    category: "text",
    defaultProps: { text: "Subheading text" },
    editableFields: [
      { key: "text", label: "Text", type: "text", placeholder: "Enter subheading" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  {
    type: "TextBody",
    label: "Body Text",
    icon: Type,
    category: "text",
    defaultProps: { text: "Body text content" },
    editableFields: [
      { key: "text", label: "Text", type: "text", placeholder: "Enter body text" },
      {
        key: "font-weight",
        label: "Font Weight",
        type: "select",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Bold", value: "bold" },
          { label: "Italic", value: "italic" },
          { label: "Bold Italic", value: "bold_italic" },
        ],
      },
      { key: "strikethrough", label: "Strikethrough", type: "boolean" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  {
    type: "TextCaption",
    label: "Caption",
    icon: Type,
    category: "text",
    defaultProps: { text: "Caption text" },
    editableFields: [
      { key: "text", label: "Text", type: "text", placeholder: "Enter caption" },
      {
        key: "font-weight",
        label: "Font Weight",
        type: "select",
        options: [
          { label: "Normal", value: "normal" },
          { label: "Bold", value: "bold" },
          { label: "Italic", value: "italic" },
          { label: "Bold Italic", value: "bold_italic" },
        ],
      },
      { key: "strikethrough", label: "Strikethrough", type: "boolean" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  {
    type: "RichText",
    label: "Rich Text",
    icon: Type,
    category: "text",
    defaultProps: { text: ["# Rich Text", "This supports **markdown** formatting."] },
    editableFields: [
      { key: "text", label: "Text (markdown, one line per array item)", type: "text", placeholder: "Markdown text" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  // Input Components
  {
    type: "TextInput",
    label: "Text Input",
    icon: TextCursorInput,
    category: "input",
    defaultProps: { name: "text_input", label: "Text Input", required: true, "input-type": "text" },
    editableFields: [
      { key: "name", label: "Name", type: "text", placeholder: "field_name" },
      { key: "label", label: "Label", type: "text", placeholder: "Input label" },
      {
        key: "input-type",
        label: "Input Type",
        type: "select",
        options: [
          { label: "Text", value: "text" },
          { label: "Number", value: "number" },
          { label: "Email", value: "email" },
          { label: "Password", value: "password" },
          { label: "Passcode", value: "passcode" },
          { label: "Phone", value: "phone" },
        ],
      },
      { key: "required", label: "Required", type: "boolean" },
      { key: "min-chars", label: "Min Characters", type: "number" },
      { key: "max-chars", label: "Max Characters", type: "number" },
      { key: "helper-text", label: "Helper Text", type: "text", placeholder: "Helper text" },
      { key: "init-value", label: "Initial Value", type: "text", placeholder: "Default value" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  {
    type: "TextArea",
    label: "Text Area",
    icon: TextCursorInput,
    category: "input",
    defaultProps: { name: "text_area", label: "Text Area", required: false },
    editableFields: [
      { key: "name", label: "Name", type: "text", placeholder: "field_name" },
      { key: "label", label: "Label", type: "text", placeholder: "Input label" },
      { key: "required", label: "Required", type: "boolean" },
      { key: "max-length", label: "Max Length", type: "number" },
      { key: "helper-text", label: "Helper Text", type: "text", placeholder: "Helper text" },
      { key: "init-value", label: "Initial Value", type: "text", placeholder: "Default value" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  {
    type: "DatePicker",
    label: "Date Picker",
    icon: Calendar,
    category: "input",
    defaultProps: { name: "date_picker", label: "Select Date" },
    editableFields: [
      { key: "name", label: "Name", type: "text", placeholder: "field_name" },
      { key: "label", label: "Label", type: "text", placeholder: "Date label" },
      { key: "min-date", label: "Min Date (epoch ms)", type: "text" },
      { key: "max-date", label: "Max Date (epoch ms)", type: "text" },
      { key: "unavailable-dates", label: "Unavailable Dates", type: "text" },
      { key: "required", label: "Required", type: "boolean" },
      { key: "visible", label: "Visible", type: "boolean" },
      { key: "helper-text", label: "Helper Text", type: "text" },
    ],
  },
  // Selection Components
  {
    type: "RadioButtonsGroup",
    label: "Radio Buttons",
    icon: CircleDot,
    category: "selection",
    defaultProps: {
      name: "radio_group",
      label: "Select one option",
      required: true,
      "data-source": [
        { id: "option_1", title: "Option 1" },
        { id: "option_2", title: "Option 2" },
        { id: "option_3", title: "Option 3" },
      ],
    },
    editableFields: [
      { key: "name", label: "Name", type: "text", placeholder: "field_name" },
      { key: "label", label: "Label", type: "text", placeholder: "Group label" },
      { key: "data-source", label: "Options", type: "options" },
      { key: "required", label: "Required", type: "boolean" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  {
    type: "CheckboxGroup",
    label: "Checkboxes",
    icon: ListChecks,
    category: "selection",
    defaultProps: {
      name: "checkbox_group",
      label: "Select options",
      required: false,
      "data-source": [
        { id: "check_1", title: "Checkbox 1" },
        { id: "check_2", title: "Checkbox 2" },
        { id: "check_3", title: "Checkbox 3" },
      ],
    },
    editableFields: [
      { key: "name", label: "Name", type: "text", placeholder: "field_name" },
      { key: "label", label: "Label", type: "text", placeholder: "Group label" },
      { key: "data-source", label: "Options", type: "options" },
      { key: "required", label: "Required", type: "boolean" },
      { key: "min-selected-items", label: "Min Selection", type: "number" },
      { key: "max-selected-items", label: "Max Selection", type: "number" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  {
    type: "Dropdown",
    label: "Dropdown",
    icon: ChevronDownSquare,
    category: "selection",
    defaultProps: {
      name: "dropdown",
      label: "Select option",
      "data-source": [
        { id: "opt_1", title: "Option 1" },
        { id: "opt_2", title: "Option 2" },
        { id: "opt_3", title: "Option 3" },
      ],
    },
    editableFields: [
      { key: "name", label: "Name", type: "text", placeholder: "field_name" },
      { key: "label", label: "Label", type: "text", placeholder: "Dropdown label" },
      { key: "data-source", label: "Options", type: "options" },
      { key: "required", label: "Required", type: "boolean" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  // Interactive Components
  {
    type: "OptIn",
    label: "Opt-In",
    icon: ToggleLeft,
    category: "interactive",
    defaultProps: { name: "opt_in", label: "I agree to the terms and conditions", required: true },
    editableFields: [
      { key: "name", label: "Name", type: "text", placeholder: "field_name" },
      { key: "label", label: "Label", type: "text", placeholder: "Opt-in label" },
      { key: "required", label: "Required", type: "boolean" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  {
    type: "EmbeddedLink",
    label: "Embedded Link",
    icon: Link,
    category: "interactive",
    defaultProps: {
      text: "Click here for more info",
      "on-click-action": { name: "navigate", next: { type: "screen", name: "" }, payload: {} },
    },
    editableFields: [
      { key: "text", label: "Text", type: "text", placeholder: "Link text" },
      { key: "on-click-action", label: "Action", type: "action" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  {
    type: "Footer",
    label: "Footer (CTA Button)",
    icon: ArrowDown,
    category: "interactive",
    defaultProps: {
      label: "Continue",
      "on-click-action": { name: "navigate", next: { type: "screen", name: "" }, payload: {} },
    },
    editableFields: [
      { key: "label", label: "Button Label", type: "text", placeholder: "Button text" },
      { key: "on-click-action", label: "Action", type: "action" },
      { key: "enabled", label: "Enabled", type: "boolean" },
    ],
  },
  // Media Components
  {
    type: "Image",
    label: "Image",
    icon: ImageIcon,
    category: "media",
    defaultProps: { src: "", width: 200, height: 200, "scale-type": "contain", "alt-text": "Image" },
    editableFields: [
      { key: "src", label: "Source (base64)", type: "text", placeholder: "Base64 encoded image string" },
      { key: "width", label: "Width", type: "number" },
      { key: "height", label: "Height", type: "number" },
      {
        key: "scale-type",
        label: "Scale Type",
        type: "select",
        options: [
          { label: "Contain", value: "contain" },
          { label: "Cover", value: "cover" },
        ],
      },
      { key: "aspect-ratio", label: "Aspect Ratio", type: "number" },
      { key: "alt-text", label: "Alt Text", type: "text", placeholder: "Image description" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  {
    type: "ImageCarousel",
    label: "Image Carousel",
    icon: Images,
    category: "media",
    defaultProps: {
      images: [
        { src: "", "alt-text": "Image 1" },
        { src: "", "alt-text": "Image 2" },
      ],
      "aspect-ratio": "4:3",
      "scale-type": "contain",
    },
    editableFields: [
      {
        key: "aspect-ratio",
        label: "Aspect Ratio",
        type: "select",
        options: [
          { label: "4:3", value: "4:3" },
          { label: "16:9", value: "16:9" },
        ],
      },
      {
        key: "scale-type",
        label: "Scale Type",
        type: "select",
        options: [
          { label: "Contain", value: "contain" },
          { label: "Cover", value: "cover" },
        ],
      },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  // Advanced Input Components
  {
    type: "CalendarPicker",
    label: "Calendar Picker",
    icon: CalendarRange,
    category: "input",
    defaultProps: {
      name: "calendar",
      label: "Select date",
      mode: "single",
      required: false,
    },
    editableFields: [
      { key: "name", label: "Name", type: "text", placeholder: "field_name" },
      { key: "label", label: "Label", type: "text", placeholder: "Calendar label" },
      { key: "title", label: "Title", type: "text", placeholder: "Calendar title" },
      { key: "description", label: "Description", type: "text", placeholder: "Calendar description" },
      {
        key: "mode",
        label: "Mode",
        type: "select",
        options: [
          { label: "Single Date", value: "single" },
          { label: "Date Range", value: "range" },
        ],
      },
      { key: "min-date", label: "Min Date (YYYY-MM-DD)", type: "text", placeholder: "2024-01-01" },
      { key: "max-date", label: "Max Date (YYYY-MM-DD)", type: "text", placeholder: "2025-12-31" },
      { key: "helper-text", label: "Helper Text", type: "text", placeholder: "Helper text" },
      { key: "required", label: "Required", type: "boolean" },
      { key: "visible", label: "Visible", type: "boolean" },
      { key: "enabled", label: "Enabled", type: "boolean" },
    ],
  },
  // Advanced Selection Components
  {
    type: "ChipsSelector",
    label: "Chips Selector",
    icon: Tag,
    category: "selection",
    defaultProps: {
      name: "chips",
      label: "Select options",
      "data-source": [
        { id: "chip_1", title: "Option 1" },
        { id: "chip_2", title: "Option 2" },
        { id: "chip_3", title: "Option 3" },
      ],
    },
    editableFields: [
      { key: "name", label: "Name", type: "text", placeholder: "field_name" },
      { key: "label", label: "Label", type: "text", placeholder: "Selector label" },
      { key: "description", label: "Description", type: "text", placeholder: "Description text" },
      { key: "data-source", label: "Options", type: "options" },
      { key: "min-selected-items", label: "Min Selection", type: "number" },
      { key: "max-selected-items", label: "Max Selection", type: "number" },
      { key: "required", label: "Required", type: "boolean" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
  // Navigation Component
  {
    type: "NavigationList",
    label: "Navigation List",
    icon: List,
    category: "interactive",
    defaultProps: {
      name: "nav_list",
      "list-items": [
        { id: "item_1", "main-content": { title: "Item 1", description: "Description for item 1" } },
        { id: "item_2", "main-content": { title: "Item 2", description: "Description for item 2" } },
        { id: "item_3", "main-content": { title: "Item 3", description: "Description for item 3" } },
      ],
      "on-click-action": { name: "navigate", next: { type: "screen", name: "" }, payload: {} },
    },
    editableFields: [
      { key: "name", label: "Name", type: "text", placeholder: "field_name" },
      { key: "label", label: "Label", type: "text", placeholder: "List label" },
      { key: "description", label: "Description", type: "text", placeholder: "List description" },
      { key: "list-items", label: "List Items", type: "navlist-items" },
      {
        key: "media-size",
        label: "Media Size",
        type: "select",
        options: [
          { label: "Regular", value: "regular" },
          { label: "Large", value: "large" },
        ],
      },
      { key: "on-click-action", label: "Action", type: "action" },
      { key: "visible", label: "Visible", type: "boolean" },
    ],
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  text: "Text",
  input: "Input",
  selection: "Selection",
  interactive: "Interactive",
  media: "Media",
};

const CATEGORY_COLORS: Record<string, string> = {
  text: "#8b5cf6",
  input: "#3b82f6",
  selection: "#10b981",
  interactive: "#f59e0b",
  media: "#ec4899",
};

// ============================================================
// HELPERS
// ============================================================

function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}

function cleanComponent(comp: FlowComponent, validScreenIds: Set<string>): FlowComponent {
  const cleaned: FlowComponent = { type: comp.type };
  for (const [key, value] of Object.entries(comp)) {
    if (key === "_id") continue;
    if (value === undefined || value === null || value === "") continue;
    if (typeof value === "boolean" && key === "visible" && value === true) continue;
    if (typeof value === "boolean" && key === "required" && value === false) continue;
    if (typeof value === "boolean" && key === "strikethrough" && value === false) continue;
    if (typeof value === "boolean" && key === "enabled" && value === true) continue;
    // Validate navigate actions - remove references to non-existent screens
    if ((key === "on-click-action" || key === "on-select-action") && value?.name === "navigate") {
      if (!value.next?.name || !validScreenIds.has(value.next.name)) {
        // Skip invalid navigate action - convert to complete instead
        cleaned[key] = { name: "complete", payload: value.payload || {} };
        continue;
      }
    }
    cleaned[key] = value;
  }
  return cleaned;
}

function collectNavigateTargets(children: FlowComponent[]): string[] {
  const targets: string[] = [];
  children.forEach((c) => {
    const action = c["on-click-action"] || c["on-select-action"];
    if (action?.name === "navigate" && action?.next?.name) {
      targets.push(action.next.name);
    }
  });
  return [...new Set(targets)];
}

function buildFlowJSON(screens: FlowScreen[], version: string, useEndpoint: boolean): FlowJSON {
  const flow: FlowJSON = { version };
  const screenIdSet = new Set(screens.map((s) => s.id));

  if (useEndpoint) {
    flow.data_api_version = "3.0";
  }

  // Build routing_model from actual navigate actions in components
  const routing: Record<string, string[]> = {};
  screens.forEach((s) => {
    const navigateTargets = collectNavigateTargets(s.layout.children).filter((t) => screenIdSet.has(t));
    routing[s.id] = navigateTargets;
  });
  flow.routing_model = routing;

  flow.screens = screens.map((s) => {
    const screen: any = { id: s.id };
    if (s.title) screen.title = s.title;
    if (s.terminal) screen.terminal = true;
    if (s.terminal && s.success !== false) screen.success = true;
    if (s.data && Object.keys(s.data).length > 0) screen.data = s.data;
    screen.layout = {
      type: "SingleColumnLayout",
      children: s.layout.children.map((c) => cleanComponent(c, screenIdSet)),
    };
    return screen;
  });

  return flow;
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

// --- Phone Preview ---
function PhonePreview({ screen }: { screen: FlowScreen | null }) {
  if (!screen) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        <p>Select a screen to preview</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Phone Header */}
      <div
        style={{
          background: "#f0f2f5",
          padding: "12px 16px",
          borderBottom: "1px solid #e0e0e0",
          textAlign: "center",
          fontWeight: 600,
          fontSize: "14px",
          color: "#1f2937",
        }}
      >
        {screen.title || screen.id}
      </div>

      {/* Phone Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px", background: "#ffffff" }}>
        {screen.layout.children.map((comp, idx) => (
          <PhoneComponent key={idx} component={comp} />
        ))}
      </div>

      {/* Phone Footer */}
      <div
        style={{
          padding: "8px 16px",
          borderTop: "1px solid #e0e0e0",
          background: "#f0f2f5",
          textAlign: "center",
          fontSize: "11px",
          color: "#8696a0",
        }}
      >
        Dikelola oleh bisnis.{" "}
        <span style={{ color: "#00a884" }}>Pelajari selengkapnya</span>
      </div>
    </div>
  );
}

// --- Simple Markdown Parser for RichText preview ---
function parseMarkdownLine(line: string): JSX.Element {
  // Process inline formatting
  const processInline = (text: string): (string | JSX.Element)[] => {
    const parts: (string | JSX.Element)[] = [];
    let remaining = text;
    let keyIdx = 0;

    while (remaining.length > 0) {
      // Bold: **text**
      const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
      // Italic: *text* (but not **)
      const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
      // Strikethrough: ~~text~~
      const strikeMatch = remaining.match(/~~(.+?)~~/);
      // Link: [text](url)
      const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);

      // Find earliest match
      const matches = [
        boldMatch ? { type: "bold", match: boldMatch, idx: boldMatch.index! } : null,
        italicMatch ? { type: "italic", match: italicMatch, idx: italicMatch.index! } : null,
        strikeMatch ? { type: "strike", match: strikeMatch, idx: strikeMatch.index! } : null,
        linkMatch ? { type: "link", match: linkMatch, idx: linkMatch.index! } : null,
      ].filter(Boolean).sort((a, b) => a!.idx - b!.idx);

      if (matches.length === 0) {
        parts.push(remaining);
        break;
      }

      const first = matches[0]!;
      if (first.idx > 0) {
        parts.push(remaining.substring(0, first.idx));
      }

      keyIdx++;
      if (first.type === "bold") {
        parts.push(<strong key={`b${keyIdx}`}>{first.match![1]}</strong>);
        remaining = remaining.substring(first.idx + first.match![0].length);
      } else if (first.type === "italic") {
        parts.push(<em key={`i${keyIdx}`}>{first.match![1]}</em>);
        remaining = remaining.substring(first.idx + first.match![0].length);
      } else if (first.type === "strike") {
        parts.push(<s key={`s${keyIdx}`}>{first.match![1]}</s>);
        remaining = remaining.substring(first.idx + first.match![0].length);
      } else if (first.type === "link") {
        parts.push(
          <span key={`l${keyIdx}`} style={{ color: "#00a884", textDecoration: "underline" }}>
            {first.match![1]}
          </span>
        );
        remaining = remaining.substring(first.idx + first.match![0].length);
      } else {
        parts.push(remaining);
        break;
      }
    }
    return parts;
  };

  // Heading levels
  if (line.startsWith("### ")) {
    return <div style={{ fontWeight: 600, fontSize: "14px", color: "#111827", marginBottom: "4px" }}>{processInline(line.slice(4))}</div>;
  }
  if (line.startsWith("## ")) {
    return <div style={{ fontWeight: 700, fontSize: "16px", color: "#111827", marginBottom: "4px" }}>{processInline(line.slice(3))}</div>;
  }
  if (line.startsWith("# ")) {
    return <div style={{ fontWeight: 700, fontSize: "18px", color: "#111827", marginBottom: "6px" }}>{processInline(line.slice(2))}</div>;
  }
  // Unordered list
  if (line.startsWith("- ") || line.startsWith("* ")) {
    return (
      <div style={{ display: "flex", gap: "8px", marginBottom: "2px" }}>
        <span style={{ color: "#6b7280" }}>&bull;</span>
        <span>{processInline(line.slice(2))}</span>
      </div>
    );
  }
  // Ordered list
  const olMatch = line.match(/^(\d+)\.\s/);
  if (olMatch) {
    return (
      <div style={{ display: "flex", gap: "8px", marginBottom: "2px" }}>
        <span style={{ color: "#6b7280", minWidth: "16px" }}>{olMatch[1]}.</span>
        <span>{processInline(line.slice(olMatch[0].length))}</span>
      </div>
    );
  }
  // Blockquote
  if (line.startsWith("> ")) {
    return (
      <div style={{ borderLeft: "3px solid #d1d5db", paddingLeft: "10px", color: "#6b7280", fontStyle: "italic", marginBottom: "4px" }}>
        {processInline(line.slice(2))}
      </div>
    );
  }
  // Horizontal rule
  if (line === "---" || line === "***" || line === "___") {
    return <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "8px 0" }} />;
  }
  // Empty line = spacing
  if (line.trim() === "") {
    return <div style={{ height: "8px" }} />;
  }
  // Normal paragraph
  return <div style={{ marginBottom: "2px" }}>{processInline(line)}</div>;
}

function RichTextPreview({ text }: { text: string | string[] }) {
  const lines = Array.isArray(text) ? text : (text || "Rich text content").split("\n");
  return (
    <div style={{ fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>
      {lines.map((line, i) => (
        <div key={i}>{parseMarkdownLine(line)}</div>
      ))}
    </div>
  );
}

// --- Base64 Image helper ---
function resolveImageSrc(src: string): string {
  if (!src) return "";
  if (src.startsWith("data:")) return src;
  // Try to detect image type from base64 header
  if (src.startsWith("/9j/")) return `data:image/jpeg;base64,${src}`;
  if (src.startsWith("iVBOR")) return `data:image/png;base64,${src}`;
  if (src.startsWith("R0lGOD")) return `data:image/gif;base64,${src}`;
  if (src.startsWith("UklGR")) return `data:image/webp;base64,${src}`;
  // Default to png
  return `data:image/png;base64,${src}`;
}

function PhoneComponent({ component }: { component: FlowComponent }) {
  const style: Record<string, any> = { marginBottom: "12px" };

  switch (component.type) {
    case "TextHeading":
      return (
        <div style={{ ...style, fontWeight: 700, fontSize: "18px", color: "#111827" }}>
          {component.text || "Heading"}
        </div>
      );
    case "TextSubheading":
      return (
        <div style={{ ...style, fontWeight: 600, fontSize: "15px", color: "#1f2937" }}>
          {component.text || "Subheading"}
        </div>
      );
    case "TextBody":
      return (
        <div
          style={{
            ...style,
            fontSize: "14px",
            color: "#374151",
            fontWeight: component["font-weight"] === "bold" ? 700 : 400,
            fontStyle: component["font-weight"] === "italic" || component["font-weight"] === "bold_italic" ? "italic" : "normal",
            textDecoration: component.strikethrough ? "line-through" : "none",
          }}
        >
          {component.text || "Body text"}
        </div>
      );
    case "TextCaption":
      return (
        <div style={{ ...style, fontSize: "12px", color: "#6b7280" }}>
          {component.text || "Caption"}
        </div>
      );
    case "RichText":
      return (
        <div style={style}>
          <RichTextPreview text={component.text} />
        </div>
      );
    case "TextInput":
      return (
        <div style={style}>
          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "14px 12px 6px",
              position: "relative",
              background: "#fff",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "4px",
                left: "12px",
                fontSize: "11px",
                color: "#6b7280",
              }}
            >
              {component.label || "Text Input"} {component.required && "*"}
            </span>
            <div style={{ fontSize: "14px", color: "#9ca3af", marginTop: "4px" }}>
              {component["init-value"] || component.label || "Enter text"}
            </div>
          </div>
          {component["helper-text"] && (
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", paddingLeft: "4px" }}>
              {component["helper-text"]}
            </div>
          )}
        </div>
      );
    case "TextArea":
      return (
        <div style={style}>
          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "14px 12px 6px",
              minHeight: "80px",
              position: "relative",
              background: "#fff",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "4px",
                left: "12px",
                fontSize: "11px",
                color: "#6b7280",
              }}
            >
              {component.label || "Text Area"}
            </span>
          </div>
        </div>
      );
    case "DatePicker":
      return (
        <div style={style}>
          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "14px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
            }}
          >
            <span style={{ fontSize: "14px", color: "#6b7280" }}>{component.label || "Select Date"}</span>
            <Calendar size={16} color="#6b7280" />
          </div>
        </div>
      );
    case "RadioButtonsGroup":
      return (
        <div style={style}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
            {component.label || "Select option"}
          </div>
          {(component["data-source"] || []).map((opt: any, i: number) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 0",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: "2px solid #d1d5db",
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: "14px", color: "#111827", fontWeight: 500 }}>{opt.title}</div>
                {opt.description && (
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>{opt.description}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    case "CheckboxGroup":
      return (
        <div style={style}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
            {component.label || "Select options"}
          </div>
          {(component["data-source"] || []).map((opt: any, i: number) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 0",
                borderBottom: "1px solid #f3f4f6",
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  border: "2px solid #d1d5db",
                  flexShrink: 0,
                }}
              />
              <div style={{ fontSize: "14px", color: "#111827" }}>{opt.title}</div>
            </div>
          ))}
        </div>
      );
    case "Dropdown":
      return (
        <div style={style}>
          <div
            style={{
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              padding: "14px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#fff",
            }}
          >
            <span style={{ fontSize: "14px", color: "#6b7280" }}>{component.label || "Select"}</span>
            <ChevronDown size={16} color="#6b7280" />
          </div>
        </div>
      );
    case "OptIn":
      return (
        <div style={{ ...style, display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <div
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "4px",
              border: "2px solid #d1d5db",
              marginTop: "2px",
              flexShrink: 0,
            }}
          />
          <div style={{ fontSize: "14px", color: "#374151" }}>
            {component.label || "Opt-in label"}{" "}
            {component["on-click-action"] && (
              <span style={{ color: "#00a884" }}>Pelajari selengkapnya</span>
            )}
          </div>
        </div>
      );
    case "EmbeddedLink":
      return (
        <div style={style}>
          <span style={{ fontSize: "14px", color: "#00a884", cursor: "pointer" }}>
            {component.text || "Embedded link"}
          </span>
        </div>
      );
    case "Footer":
      return (
        <div
          style={{
            marginTop: "auto",
            paddingTop: "16px",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              width: "100%",
              padding: "14px",
              background: "#00a884",
              color: "#fff",
              borderRadius: "999px",
              textAlign: "center",
              fontWeight: 600,
              fontSize: "15px",
            }}
          >
            {component.label || "Continue"}
          </div>
        </div>
      );
    case "Image": {
      const imgSrc = resolveImageSrc(component.src || "");
      return (
        <div style={{ ...style, display: "flex", justifyContent: "center" }}>
          {imgSrc ? (
            <>
              <img
                src={imgSrc}
                alt={component["alt-text"] || "Image"}
                style={{
                  maxWidth: component.width || 200,
                  maxHeight: component.height || 200,
                  objectFit: component["scale-type"] === "cover" ? "cover" : "contain",
                  borderRadius: "8px",
                }}
                onError={(e) => {
                  // Show placeholder if base64 is invalid
                  (e.target as HTMLImageElement).style.display = "none";
                  const sibling = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                  if (sibling) sibling.style.display = "flex";
                }}
              />
              <div style={{ display: "none", width: component.width || 200, height: component.height || 200, background: "#fef2f2", borderRadius: "8px", alignItems: "center", justifyContent: "center", color: "#ef4444", border: "2px dashed #fca5a5", textAlign: "center", padding: "8px" }}>
                <div>
                  <ImageIcon size={24} style={{ marginBottom: "4px" }} />
                  <div style={{ fontSize: "11px" }}>Invalid base64</div>
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                width: component.width || 200,
                height: component.height || 200,
                background: "#f3f4f6",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                border: "2px dashed #d1d5db",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <ImageIcon size={32} style={{ marginBottom: "4px" }} />
                <div style={{ fontSize: "11px" }}>Paste base64 di Properties</div>
              </div>
            </div>
          )}
        </div>
      );
    }
    case "ImageCarousel":
      return (
        <div style={style}>
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              padding: "4px 0",
            }}
          >
            {(component.images || []).map((img: any, i: number) => (
              <div
                key={i}
                style={{
                  flexShrink: 0,
                  width: "200px",
                  height: component["aspect-ratio"] === "16:9" ? "112px" : "150px",
                  background: "#f3f4f6",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9ca3af",
                  border: "1px solid #e5e7eb",
                }}
              >
                {img.src ? (
                  <img
                    src={img.src.startsWith("data:") ? img.src : `data:image/png;base64,${img.src}`}
                    alt={img["alt-text"] || `Slide ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }}
                  />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <Images size={24} />
                    <div style={{ fontSize: "10px", marginTop: "2px" }}>Slide {i + 1}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    case "CalendarPicker":
      return (
        <div style={style}>
          {component.title && (
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
              {component.title}
            </div>
          )}
          {component.description && (
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>{component.description}</div>
          )}
          {component.mode === "range" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  padding: "14px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#fff",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>Start date</div>
                  <div style={{ fontSize: "14px", color: "#9ca3af" }}>Select from date</div>
                </div>
                <CalendarRange size={16} color="#6b7280" />
              </div>
              <div
                style={{
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  padding: "14px 12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#fff",
                }}
              >
                <div>
                  <div style={{ fontSize: "11px", color: "#6b7280" }}>End date</div>
                  <div style={{ fontSize: "14px", color: "#9ca3af" }}>Select to date</div>
                </div>
                <CalendarRange size={16} color="#6b7280" />
              </div>
            </div>
          ) : (
            <div
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                padding: "14px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#fff",
              }}
            >
              <span style={{ fontSize: "14px", color: "#6b7280" }}>{component.label || "Select date"}</span>
              <CalendarRange size={16} color="#6b7280" />
            </div>
          )}
          {component["helper-text"] && (
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", paddingLeft: "4px" }}>
              {component["helper-text"]}
            </div>
          )}
        </div>
      );
    case "ChipsSelector":
      return (
        <div style={style}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
            {component.label || "Select options"}
          </div>
          {component.description && (
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>{component.description}</div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {(component["data-source"] || []).map((opt: any, i: number) => (
              <div
                key={i}
                style={{
                  padding: "8px 16px",
                  background: "#f3f4f6",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#374151",
                  border: "1px solid #e5e7eb",
                }}
              >
                {opt.title}
              </div>
            ))}
          </div>
        </div>
      );
    case "NavigationList":
      return (
        <div style={style}>
          {component.label && (
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
              {component.label}
            </div>
          )}
          {component.description && (
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>{component.description}</div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {(component["list-items"] || []).map((item: any, i: number) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: i < (component["list-items"] || []).length - 1 ? "1px solid #f3f4f6" : "none",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                    {item["main-content"]?.title || `Item ${i + 1}`}
                  </div>
                  {item["main-content"]?.description && (
                    <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                      {item["main-content"].description}
                    </div>
                  )}
                  {item["main-content"]?.metadata && (
                    <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                      {item["main-content"].metadata}
                    </div>
                  )}
                </div>
                {item.end && (
                  <div style={{ textAlign: "right", marginLeft: "12px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                      {item.end.title}
                    </div>
                    {item.end.description && (
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>{item.end.description}</div>
                    )}
                  </div>
                )}
                <ChevronRight size={16} color="#d1d5db" style={{ marginLeft: "8px", flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div style={{ ...style, padding: "8px", background: "#f3f4f6", borderRadius: "6px", fontSize: "12px", color: "#6b7280" }}>
          [{component.type}]
        </div>
      );
  }
}

// --- Options Editor (for data-source) ---
function OptionsEditor({
  options,
  onChange,
}: {
  options: { id: string; title: string; description?: string }[];
  onChange: (opts: { id: string; title: string; description?: string }[]) => void;
}) {
  const addOption = () => {
    const num = options.length + 1;
    onChange([...options, { id: `option_${num}`, title: `Option ${num}` }]);
  };

  const removeOption = (idx: number) => {
    onChange(options.filter((_, i) => i !== idx));
  };

  const updateOption = (idx: number, field: string, value: string) => {
    const updated = [...options];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {options.map((opt, idx) => (
        <div key={idx} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <input
            value={opt.id}
            onChange={(e) => updateOption(idx, "id", e.target.value)}
            placeholder="ID"
            style={{
              flex: 1,
              padding: "6px 8px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "12px",
              outline: "none",
              background: "#fff",
            }}
          />
          <input
            value={opt.title}
            onChange={(e) => updateOption(idx, "title", e.target.value)}
            placeholder="Title"
            style={{
              flex: 2,
              padding: "6px 8px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "12px",
              outline: "none",
              background: "#fff",
            }}
          />
          <button
            onClick={() => removeOption(idx)}
            style={{
              padding: "4px",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#ef4444",
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        onClick={addOption}
        style={{
          padding: "6px",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px dashed #10b981",
          borderRadius: "6px",
          color: "#10b981",
          fontSize: "12px",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        + Add Option
      </button>
    </div>
  );
}

// --- Navigation List Items Editor ---
function NavListItemsEditor({
  items,
  onChange,
}: {
  items: any[];
  onChange: (items: any[]) => void;
}) {
  const addItem = () => {
    const num = items.length + 1;
    onChange([...items, { id: `item_${num}`, "main-content": { title: `Item ${num}`, description: "" } }]);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, title: string, description: string, metadata: string) => {
    const updated = [...items];
    updated[idx] = {
      ...updated[idx],
      "main-content": { ...updated[idx]["main-content"], title, description: description || undefined, metadata: metadata || undefined },
    };
    onChange(updated);
  };

  const inputStyle = {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "12px",
    outline: "none",
    background: "#fff",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ padding: "8px", background: "#f9fafb", borderRadius: "8px", border: "1px solid #f3f4f6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280" }}>Item {idx + 1}</span>
            <button
              onClick={() => removeItem(idx)}
              style={{ padding: "2px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
            >
              <X size={12} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <input
              value={item["main-content"]?.title || ""}
              onChange={(e) => updateItem(idx, e.target.value, item["main-content"]?.description || "", item["main-content"]?.metadata || "")}
              placeholder="Title"
              style={inputStyle}
            />
            <input
              value={item["main-content"]?.description || ""}
              onChange={(e) => updateItem(idx, item["main-content"]?.title || "", e.target.value, item["main-content"]?.metadata || "")}
              placeholder="Description"
              style={inputStyle}
            />
            <input
              value={item["main-content"]?.metadata || ""}
              onChange={(e) => updateItem(idx, item["main-content"]?.title || "", item["main-content"]?.description || "", e.target.value)}
              placeholder="Metadata (e.g. price)"
              style={inputStyle}
            />
          </div>
        </div>
      ))}
      <button
        onClick={addItem}
        style={{
          padding: "6px",
          background: "rgba(16, 185, 129, 0.1)",
          border: "1px dashed #10b981",
          borderRadius: "6px",
          color: "#10b981",
          fontSize: "12px",
          cursor: "pointer",
          fontWeight: 500,
        }}
      >
        + Add Item
      </button>
    </div>
  );
}

// --- Action Editor ---
const ACTION_DESCRIPTIONS: Record<string, string> = {
  navigate: "Pindah ke screen lain + kirim data form ke screen tujuan",
  complete: "Selesaikan flow + kirim SEMUA data ke bisnis (WhatsApp webhook)",
  data_exchange: "Panggil server bisnis untuk ambil data dinamis (misal: cek stok)",
  update_data: "Update data di screen ini tanpa panggil server",
  open_url: "Buka URL di browser",
};

function ActionEditor({
  action,
  onChange,
  screenIds,
  formFields,
}: {
  action: any;
  onChange: (a: any) => void;
  screenIds: string[];
  formFields: { name: string; type: string }[];
}) {
  const actionType = action?.name || "navigate";
  const nextScreen = action?.next?.name || "";
  const payload = action?.payload || {};
  const [showPayload, setShowPayload] = useState(Object.keys(payload).length > 0);

  const autoFillPayload = () => {
    const newPayload: Record<string, string> = {};
    formFields.forEach((f) => {
      newPayload[f.name] = `\${form.${f.name}}`;
    });
    onChange({ ...action, payload: newPayload });
    setShowPayload(true);
  };

  const updatePayloadKey = (oldKey: string, newKey: string) => {
    const entries = Object.entries(payload);
    const newPayload: Record<string, string> = {};
    entries.forEach(([k, v]) => {
      newPayload[k === oldKey ? newKey : k] = v as string;
    });
    onChange({ ...action, payload: newPayload });
  };

  const updatePayloadValue = (key: string, value: string) => {
    onChange({ ...action, payload: { ...payload, [key]: value } });
  };

  const addPayloadEntry = () => {
    const key = `field_${Object.keys(payload).length + 1}`;
    onChange({ ...action, payload: { ...payload, [key]: "" } });
    setShowPayload(true);
  };

  const removePayloadEntry = (key: string) => {
    const newPayload = { ...payload };
    delete newPayload[key];
    onChange({ ...action, payload: newPayload });
  };

  const inputStyle = {
    width: "100%",
    padding: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "13px",
    outline: "none",
    background: "#fff",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* Action Type */}
      <select
        value={actionType}
        onChange={(e) => {
          const name = e.target.value;
          if (name === "complete") {
            onChange({ name: "complete", payload: payload });
          } else if (name === "data_exchange") {
            onChange({ name: "data_exchange", payload: payload });
          } else if (name === "update_data") {
            onChange({ name: "update_data", payload: payload });
          } else if (name === "open_url") {
            onChange({ name: "open_url", url: "https://" });
          } else {
            onChange({ name: "navigate", next: { type: "screen", name: "" }, payload: payload });
          }
        }}
        style={inputStyle}
      >
        <option value="navigate">Navigate (pindah screen)</option>
        <option value="complete">Complete (selesai + kirim data)</option>
        <option value="data_exchange">Data Exchange (panggil server)</option>
        <option value="update_data">Update Data (update screen)</option>
        <option value="open_url">Open URL</option>
      </select>

      {/* Action Description */}
      <div style={{ fontSize: "11px", color: "#6b7280", background: "#f9fafb", padding: "6px 8px", borderRadius: "6px", lineHeight: "1.4" }}>
        {ACTION_DESCRIPTIONS[actionType]}
      </div>

      {/* Navigate: Screen Selector */}
      {actionType === "navigate" && (
        <div>
          <label style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280", marginBottom: "4px", display: "block" }}>
            Target Screen
          </label>
          <select
            value={nextScreen}
            onChange={(e) =>
              onChange({
                ...action,
                next: { type: "screen", name: e.target.value },
              })
            }
            style={{
              ...inputStyle,
              border: `1px solid ${!nextScreen || !screenIds.includes(nextScreen) ? "#fca5a5" : "#e5e7eb"}`,
              background: !nextScreen ? "#fef2f2" : "#fff",
            }}
          >
            <option value="">-- Pilih screen tujuan --</option>
            {screenIds.map((sid) => (
              <option key={sid} value={sid}>
                {sid}
              </option>
            ))}
          </select>
          {!nextScreen && (
            <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertCircle size={11} /> Wajib pilih screen tujuan
            </div>
          )}
          {nextScreen && !screenIds.includes(nextScreen) && (
            <div style={{ fontSize: "11px", color: "#dc2626", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
              <AlertCircle size={11} /> Screen &quot;{nextScreen}&quot; tidak ditemukan
            </div>
          )}
        </div>
      )}

      {/* Open URL */}
      {actionType === "open_url" && (
        <input
          value={action?.url || ""}
          onChange={(e) => onChange({ ...action, url: e.target.value })}
          placeholder="https://example.com"
          style={inputStyle}
        />
      )}

      {/* Payload Section (for navigate, complete, data_exchange, update_data) */}
      {actionType !== "open_url" && (
        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 600, color: "#6b7280" }}>
              Payload (data yang dikirim)
            </label>
            <button
              onClick={() => setShowPayload(!showPayload)}
              style={{ fontSize: "11px", color: "#8b5cf6", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
            >
              {showPayload ? "Tutup" : `Edit (${Object.keys(payload).length})`}
            </button>
          </div>

          {showPayload && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {/* Auto-fill button */}
              {formFields.length > 0 && (
                <button
                  onClick={autoFillPayload}
                  style={{
                    padding: "6px 10px",
                    background: "rgba(37, 211, 102, 0.1)",
                    border: "1px solid rgba(37, 211, 102, 0.3)",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    color: "#25D366",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  Auto-fill dari {formFields.length} field di screen ini
                </button>
              )}

              {/* Payload entries */}
              {Object.entries(payload).map(([key, value], idx) => (
                <div key={idx} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  <input
                    value={key}
                    onChange={(e) => updatePayloadKey(key, e.target.value)}
                    placeholder="key"
                    style={{
                      flex: 1,
                      padding: "6px 8px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      outline: "none",
                      background: "#fff",
                    }}
                  />
                  <input
                    value={value as string}
                    onChange={(e) => updatePayloadValue(key, e.target.value)}
                    placeholder="${form.field_name}"
                    style={{
                      flex: 2,
                      padding: "6px 8px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      outline: "none",
                      background: "#f0fdf4",
                    }}
                  />
                  <button
                    onClick={() => removePayloadEntry(key)}
                    style={{ padding: "2px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Add entry button */}
              <button
                onClick={addPayloadEntry}
                style={{
                  padding: "4px 8px",
                  background: "rgba(139, 92, 246, 0.05)",
                  border: "1px dashed rgba(139, 92, 246, 0.3)",
                  borderRadius: "6px",
                  fontSize: "11px",
                  color: "#8b5cf6",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                + Tambah payload entry
              </button>

              {/* Help text */}
              {Object.keys(payload).length === 0 && (
                <div style={{ fontSize: "10px", color: "#9ca3af", background: "#fefce8", padding: "6px 8px", borderRadius: "6px", lineHeight: "1.4" }}>
                  Payload kosong = tidak ada data yang dikirim! Klik &quot;Auto-fill&quot; atau tambah manual dengan format: <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "3px" }}>{`\${form.nama_field}`}</code>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Component Properties Editor ---
function PropertiesEditor({
  component,
  template,
  screenIds,
  formFields,
  onChange,
}: {
  component: FlowComponent;
  template: ComponentTemplate | undefined;
  screenIds: string[];
  formFields: { name: string; type: string }[];
  onChange: (updated: FlowComponent) => void;
}) {
  if (!template) return null;

  const updateField = (key: string, value: any) => {
    onChange({ ...component, [key]: value });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {template.editableFields.map((field) => {
        if (field.type === "text") {
          return (
            <div key={field.key}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", marginBottom: "4px", display: "block" }}>
                {field.label}
              </label>
              <input
                value={component[field.key] || ""}
                onChange={(e) => updateField(field.key, e.target.value)}
                placeholder={field.placeholder}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                  background: "#fff",
                }}
              />
            </div>
          );
        }
        if (field.type === "number") {
          return (
            <div key={field.key}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", marginBottom: "4px", display: "block" }}>
                {field.label}
              </label>
              <input
                type="number"
                value={component[field.key] ?? ""}
                onChange={(e) => updateField(field.key, e.target.value ? Number(e.target.value) : undefined)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                  background: "#fff",
                }}
              />
            </div>
          );
        }
        if (field.type === "boolean") {
          return (
            <div key={field.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                checked={component[field.key] ?? (field.key === "visible" ? true : field.key === "enabled" ? true : false)}
                onChange={(e) => updateField(field.key, e.target.checked)}
                style={{ width: "16px", height: "16px", accentColor: "#8b5cf6" }}
              />
              <label style={{ fontSize: "13px", color: "#374151" }}>{field.label}</label>
            </div>
          );
        }
        if (field.type === "select") {
          return (
            <div key={field.key}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", marginBottom: "4px", display: "block" }}>
                {field.label}
              </label>
              <select
                value={component[field.key] || ""}
                onChange={(e) => updateField(field.key, e.target.value || undefined)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                  background: "#fff",
                }}
              >
                <option value="">-- None --</option>
                {field.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          );
        }
        if (field.type === "options") {
          return (
            <div key={field.key}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", marginBottom: "4px", display: "block" }}>
                {field.label}
              </label>
              <OptionsEditor
                options={component[field.key] || []}
                onChange={(opts) => updateField(field.key, opts)}
              />
            </div>
          );
        }
        if (field.type === "action") {
          return (
            <div key={field.key}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", marginBottom: "4px", display: "block" }}>
                {field.label}
              </label>
              <ActionEditor
                action={component[field.key]}
                onChange={(a) => updateField(field.key, a)}
                screenIds={screenIds}
                formFields={formFields}
              />
            </div>
          );
        }
        if (field.type === "navlist-items") {
          return (
            <div key={field.key}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", marginBottom: "4px", display: "block" }}>
                {field.label}
              </label>
              <NavListItemsEditor
                items={component[field.key] || []}
                onChange={(items) => updateField(field.key, items)}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function WAJsonBuilder() {
  // Flow state
  const [version, setVersion] = useState("7.3");
  const [useEndpoint, setUseEndpoint] = useState(false);
  const [screens, setScreens] = useState<(FlowScreen & { _key: string })[]>([
    {
      _key: generateId(),
      id: "WELCOME_SCREEN",
      title: "Welcome",
      terminal: true,
      success: true,
      layout: {
        type: "SingleColumnLayout",
        children: [
          { type: "TextHeading", text: "Welcome!", _id: generateId() },
          { type: "TextBody", text: "Thank you for opening this flow.", _id: generateId() },
          {
            type: "Footer",
            label: "Get started",
            "on-click-action": { name: "complete", payload: {} },
            _id: generateId(),
          },
        ],
      },
    },
  ]);

  // UI state
  const [selectedScreenIdx, setSelectedScreenIdx] = useState(0);
  const [selectedCompIdx, setSelectedCompIdx] = useState<number | null>(null);
  const [showComponentPalette, setShowComponentPalette] = useState(false);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState("");
  const [activeTab, setActiveTab] = useState<"preview" | "json">("preview");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    text: true,
    input: true,
    selection: true,
    interactive: true,
    media: true,
  });

  // Derived
  const currentScreen = screens[selectedScreenIdx] || null;
  const screenIds = screens.map((s) => s.id);

  const flowJSON = useMemo(
    () => buildFlowJSON(screens.map(({ _key, ...rest }) => rest), version, useEndpoint),
    [screens, version, useEndpoint]
  );

  const jsonString = useMemo(() => JSON.stringify(flowJSON, null, 2), [flowJSON]);

  // Screen operations
  const addScreen = useCallback(() => {
    const num = screens.length + 1;
    const newScreenId = `SCREEN_${num}`;
    setScreens((prev) => {
      // Update previous screens: make them non-terminal and auto-connect footers
      const updated = prev.map((s, i) => {
        const wasTerminal = s.terminal;
        const updatedScreen = { ...s, terminal: false, success: undefined };
        // If this was the last terminal screen, update its Footer to navigate to new screen
        if (wasTerminal && i === prev.length - 1) {
          updatedScreen.layout = {
            ...s.layout,
            children: s.layout.children.map((c) => {
              if (c.type === "Footer") {
                return {
                  ...c,
                  "on-click-action": { name: "navigate", next: { type: "screen", name: newScreenId }, payload: {} },
                };
              }
              return c;
            }),
          };
        }
        return updatedScreen;
      });
      // Add the new terminal screen
      updated.push({
        _key: generateId(),
        id: newScreenId,
        title: `Screen ${num}`,
        terminal: true,
        success: true,
        layout: {
          type: "SingleColumnLayout" as const,
          children: [
            {
              type: "Footer",
              label: "Continue",
              "on-click-action": { name: "complete", payload: {} },
              _id: generateId(),
            },
          ],
        },
      });
      return updated;
    });
    setSelectedScreenIdx(screens.length);
    setSelectedCompIdx(null);
  }, [screens.length]);

  const removeScreen = useCallback(
    (idx: number) => {
      if (screens.length <= 1) return;
      const removedId = screens[idx].id;
      setScreens((prev) => {
        const updated = prev.filter((_, i) => i !== idx);
        // Ensure at least one terminal screen
        if (updated.length > 0 && !updated.some((s) => s.terminal)) {
          updated[updated.length - 1] = { ...updated[updated.length - 1], terminal: true, success: true };
        }
        // Fix navigate actions that reference the removed screen
        return updated.map((s) => ({
          ...s,
          layout: {
            ...s.layout,
            children: s.layout.children.map((c) => {
              if (c["on-click-action"]?.next?.name === removedId) {
                // Point to next screen or use complete
                const currentIdx = updated.findIndex((us) => us.id === s.id);
                const nextScreen = updated[currentIdx + 1];
                if (nextScreen) {
                  return { ...c, "on-click-action": { ...c["on-click-action"], next: { type: "screen", name: nextScreen.id } } };
                }
                return { ...c, "on-click-action": { name: "complete", payload: {} } };
              }
              return c;
            }),
          },
        }));
      });
      if (selectedScreenIdx >= screens.length - 1) {
        setSelectedScreenIdx(Math.max(0, screens.length - 2));
      }
      setSelectedCompIdx(null);
    },
    [screens, selectedScreenIdx]
  );

  const updateScreen = useCallback(
    (idx: number, updates: Partial<FlowScreen>) => {
      setScreens((prev) => {
        const oldId = prev[idx].id;
        const newId = updates.id;
        const updated = prev.map((s, i) => (i === idx ? { ...s, ...updates } : s));
        // If screen ID changed, update all navigate actions referencing old ID
        if (newId && newId !== oldId) {
          return updated.map((s) => ({
            ...s,
            layout: {
              ...s.layout,
              children: s.layout.children.map((c) => {
                if (c["on-click-action"]?.next?.name === oldId) {
                  return { ...c, "on-click-action": { ...c["on-click-action"], next: { ...c["on-click-action"].next, name: newId } } };
                }
                return c;
              }),
            },
          }));
        }
        return updated;
      });
    },
    []
  );

  // Component operations
  const addComponent = useCallback(
    (template: ComponentTemplate) => {
      setScreens((prev) => {
        const screen = prev[selectedScreenIdx];
        if (!screen) return prev;

        // Prevent adding multiple Footers
        if (template.type === "Footer" && screen.layout.children.some((c) => c.type === "Footer")) {
          setValidationErrors(["Max 1 Footer per screen. Hapus Footer yang ada dulu."]);
          return prev;
        }

        // RichText restriction: can only be alone or with Footer
        const hasRichText = screen.layout.children.some((c) => c.type === "RichText");
        if (hasRichText && template.type !== "Footer" && template.type !== "RichText") {
          setValidationErrors(["RichText hanya boleh dipasangkan dengan Footer. Pindahkan RichText ke screen terpisah, atau hapus RichText dulu."]);
          return prev;
        }
        if (template.type === "RichText") {
          const nonFooter = screen.layout.children.filter((c) => c.type !== "Footer");
          if (nonFooter.length > 0) {
            setValidationErrors(["RichText hanya boleh sendirian (+ Footer) di screen. Hapus komponen lain dulu, atau tambah RichText di screen baru."]);
            return prev;
          }
        }

        const newComp: FlowComponent = {
          ...JSON.parse(JSON.stringify(template.defaultProps)),
          type: template.type,
          _id: generateId(),
        };

        // For Footer, auto-set navigate action based on position
        if (template.type === "Footer") {
          const screenIdx = selectedScreenIdx;
          const nextScreen = prev[screenIdx + 1];
          if (nextScreen) {
            newComp["on-click-action"] = { name: "navigate", next: { type: "screen", name: nextScreen.id }, payload: {} };
          }
        }

        return prev.map((s, i) => {
          if (i !== selectedScreenIdx) return s;
          const children = [...s.layout.children];
          // Insert before Footer if exists (for non-Footer components)
          const footerIdx = children.findIndex((c) => c.type === "Footer");
          if (footerIdx >= 0 && template.type !== "Footer") {
            children.splice(footerIdx, 0, newComp);
          } else {
            children.push(newComp);
          }
          return { ...s, layout: { ...s.layout, children } };
        });
      });
      setShowComponentPalette(false);
    },
    [selectedScreenIdx]
  );

  const removeComponent = useCallback(
    (compIdx: number) => {
      setScreens((prev) =>
        prev.map((s, i) => {
          if (i !== selectedScreenIdx) return s;
          return {
            ...s,
            layout: {
              ...s.layout,
              children: s.layout.children.filter((_, ci) => ci !== compIdx),
            },
          };
        })
      );
      setSelectedCompIdx(null);
    },
    [selectedScreenIdx]
  );

  const updateComponent = useCallback(
    (compIdx: number, updated: FlowComponent) => {
      setScreens((prev) =>
        prev.map((s, i) => {
          if (i !== selectedScreenIdx) return s;
          return {
            ...s,
            layout: {
              ...s.layout,
              children: s.layout.children.map((c, ci) => (ci === compIdx ? updated : c)),
            },
          };
        })
      );
    },
    [selectedScreenIdx]
  );

  const moveComponent = useCallback(
    (fromIdx: number, toIdx: number) => {
      setScreens((prev) =>
        prev.map((s, i) => {
          if (i !== selectedScreenIdx) return s;
          const children = [...s.layout.children];
          const [moved] = children.splice(fromIdx, 1);
          children.splice(toIdx, 0, moved);
          return { ...s, layout: { ...s.layout, children } };
        })
      );
      setSelectedCompIdx(toIdx);
    },
    [selectedScreenIdx]
  );

  // Copy JSON
  const copyJSON = useCallback(() => {
    navigator.clipboard.writeText(jsonString);
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  }, [jsonString]);

  // Export
  const exportJSON = useCallback(() => {
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "whatsapp-flow.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [jsonString]);

  // Import
  const handleImport = useCallback(() => {
    try {
      const parsed = JSON.parse(importText);
      if (!parsed.version || !parsed.screens) {
        setImportError("Invalid Flow JSON: missing version or screens");
        return;
      }
      setVersion(parsed.version);
      setUseEndpoint(!!parsed.routing_model);
      setScreens(
        parsed.screens.map((s: any) => ({
          ...s,
          _key: generateId(),
          layout: {
            ...s.layout,
            children: (s.layout?.children || []).map((c: any) => ({ ...c, _id: generateId() })),
          },
        }))
      );
      setSelectedScreenIdx(0);
      setSelectedCompIdx(null);
      setShowImportModal(false);
      setImportText("");
      setImportError("");
    } catch {
      setImportError("Invalid JSON format");
    }
  }, [importText]);

  // Validate
  const validate = useCallback(() => {
    const errors: string[] = [];
    if (screens.length === 0) errors.push("Flow must have at least one screen");
    const hasTerminal = screens.some((s) => s.terminal);
    if (!hasTerminal) errors.push("Flow must have at least one terminal screen");

    const ids = screens.map((s) => s.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) errors.push("Screen IDs must be unique");

    // Track connected screens
    const connectedScreens = new Set<string>();
    if (screens.length > 0) connectedScreens.add(screens[0].id); // First screen is always reachable

    screens.forEach((s) => {
      if (!s.id) errors.push(`Screen is missing an ID`);
      if (s.id === "SUCCESS") errors.push(`"SUCCESS" is a reserved screen ID`);
      if (s.layout.children.length === 0) errors.push(`Screen "${s.id}" has no components`);

      // Check Footer count
      const footerCount = s.layout.children.filter((c) => c.type === "Footer").length;
      if (footerCount > 1) errors.push(`Screen "${s.id}" has ${footerCount} Footers (max 1 allowed)`);
      if (footerCount === 0) errors.push(`Screen "${s.id}" must have a Footer component`);

      // RichText restriction: can only be alone or with Footer
      const hasRichText = s.layout.children.some((c) => c.type === "RichText");
      if (hasRichText) {
        const nonFooterNonRichText = s.layout.children.filter((c) => c.type !== "RichText" && c.type !== "Footer");
        if (nonFooterNonRichText.length > 0) {
          errors.push(`Screen "${s.id}": RichText can only be paired with Footer. Remove ${nonFooterNonRichText.map((c) => c.type).join(", ")} or move RichText to its own screen`);
        }
      }

      // NavigationList cannot be on terminal screen
      const hasNavList = s.layout.children.some((c) => c.type === "NavigationList");
      if (hasNavList && s.terminal) {
        errors.push(`Screen "${s.id}": NavigationList cannot be used on a terminal screen`);
      }

      // Max 3 images per screen
      const imageCount = s.layout.children.filter((c) => c.type === "Image").length;
      if (imageCount > 3) errors.push(`Screen "${s.id}" has ${imageCount} Images (max 3 allowed)`);

      if (s.layout.children.length > 50) errors.push(`Screen "${s.id}" exceeds 50 component limit`);

      // Check component names uniqueness
      const names = new Set<string>();
      s.layout.children.forEach((c) => {
        if (c.name) {
          if (names.has(c.name)) errors.push(`Duplicate component name "${c.name}" in screen "${s.id}"`);
          names.add(c.name);
        }

        // Validate navigate actions reference valid screens
        const action = c["on-click-action"] || c["on-select-action"];
        if (action?.name === "navigate") {
          const targetScreen = action.next?.name;
          if (!targetScreen) {
            errors.push(`Screen "${s.id}" → ${c.type}: Navigate action has no target screen`);
          } else if (!uniqueIds.has(targetScreen)) {
            errors.push(`Screen "${s.id}" → ${c.type}: Navigate to unknown screen "${targetScreen}"`);
          } else {
            connectedScreens.add(targetScreen);
          }
        }
        // Warn about empty payload on complete action
        if (action?.name === "complete" && c.type === "Footer") {
          const payload = action.payload;
          if (!payload || Object.keys(payload).length === 0) {
            // Check if screen has form fields
            const formFieldsInScreen = s.layout.children.filter((comp) => comp.name && comp.type !== "Footer" && comp.type !== "NavigationList");
            if (formFieldsInScreen.length > 0) {
              errors.push(`Screen "${s.id}" → Footer: Complete action has empty payload but screen has ${formFieldsInScreen.length} input field(s). Data won't be collected! Edit Footer → Action → click "Auto-fill"`);
            }
          }
        }
      });
    });

    // Check for unconnected screens
    if (screens.length > 1) {
      screens.forEach((s) => {
        if (!connectedScreens.has(s.id)) {
          errors.push(`Screen "${s.id}" is not reachable from any other screen via navigate action`);
        }
      });
    }

    setValidationErrors(errors);
  }, [screens]);

  // ============================================================
  // RENDER
  // ============================================================

  const selectedComp = currentScreen && selectedCompIdx !== null ? currentScreen.layout.children[selectedCompIdx] : null;
  const selectedTemplate = selectedComp ? COMPONENT_CATALOG.find((c) => c.type === selectedComp.type) : undefined;

  // Collect form fields from current screen (components with a 'name' property)
  const currentFormFields = useMemo(() => {
    if (!currentScreen) return [];
    return currentScreen.layout.children
      .filter((c) => c.name && c.type !== "Footer" && c.type !== "NavigationList")
      .map((c) => ({ name: c.name as string, type: c.type }));
  }, [currentScreen]);

  return (
    <div
      style={{
        height: "calc(100vh - 80px)",
        display: "flex",
        flexDirection: "column",
        background: "#f8fafc",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* TOOLBAR */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          background: "#fff",
          borderBottom: "1px solid #e5e7eb",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileJson size={22} style={{ color: "#25D366" }} />
            <h1 style={{ fontSize: "16px", fontWeight: 700, color: "#111827" }}>
              WA Flow JSON Builder
            </h1>
          </div>

          <div style={{ height: "24px", width: "1px", background: "#e5e7eb" }} />

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>Version:</label>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              style={{
                padding: "4px 8px",
                border: "1px solid #e5e7eb",
                borderRadius: "6px",
                fontSize: "12px",
                background: "#fff",
                outline: "none",
              }}
            >
              {["2.1", "3.0", "3.1", "4.0", "5.0", "5.1", "6.0", "6.1", "6.2", "6.3", "7.0", "7.1", "7.2", "7.3"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <input
              type="checkbox"
              checked={useEndpoint}
              onChange={(e) => setUseEndpoint(e.target.checked)}
              style={{ accentColor: "#25D366" }}
            />
            <label style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}>Data Endpoint</label>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            onClick={validate}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "#fff",
              fontSize: "13px",
              fontWeight: 500,
              color: "#374151",
              cursor: "pointer",
            }}
          >
            <AlertCircle size={15} />
            Validate
          </button>
          <button
            onClick={() => setShowImportModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "#fff",
              fontSize: "13px",
              fontWeight: 500,
              color: "#374151",
              cursor: "pointer",
            }}
          >
            <Upload size={15} />
            Import
          </button>
          <button
            onClick={exportJSON}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              background: "#fff",
              fontSize: "13px",
              fontWeight: 500,
              color: "#374151",
              cursor: "pointer",
            }}
          >
            <Download size={15} />
            Export
          </button>
          <button
            onClick={copyJSON}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              border: "none",
              borderRadius: "8px",
              background: copiedJSON ? "#10b981" : "#25D366",
              fontSize: "13px",
              fontWeight: 600,
              color: "#fff",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            {copiedJSON ? <Check size={15} /> : <Copy size={15} />}
            {copiedJSON ? "Copied!" : "Copy JSON"}
          </button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div
          style={{
            margin: "0 20px",
            marginTop: "8px",
            padding: "10px 14px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#dc2626" }}>
              {validationErrors.length} Validation Error{validationErrors.length > 1 ? "s" : ""}
            </span>
            <button onClick={() => setValidationErrors([])} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <X size={14} color="#dc2626" />
            </button>
          </div>
          {validationErrors.map((err, i) => (
            <div key={i} style={{ fontSize: "12px", color: "#b91c1c" }}>
              - {err}
            </div>
          ))}
        </div>
      )}

      {/* MAIN CONTENT - 3 panels */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", gap: "0" }}>
        {/* LEFT PANEL: Screens + Components */}
        <div
          style={{
            width: "280px",
            flexShrink: 0,
            background: "#fff",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Screen List */}
          <div style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                <Layers size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
                Screens ({screens.length})
              </span>
              <button
                onClick={addScreen}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 10px",
                  background: "rgba(37, 211, 102, 0.1)",
                  border: "1px solid rgba(37, 211, 102, 0.3)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#25D366",
                  cursor: "pointer",
                }}
              >
                <Plus size={13} /> Add
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: "200px", overflowY: "auto" }}>
              {screens.map((screen, idx) => (
                <div
                  key={screen._key}
                  onClick={() => {
                    setSelectedScreenIdx(idx);
                    setSelectedCompIdx(null);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 10px",
                    background: idx === selectedScreenIdx ? "rgba(37, 211, 102, 0.08)" : "transparent",
                    border: idx === selectedScreenIdx ? "1px solid rgba(37, 211, 102, 0.3)" : "1px solid transparent",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: idx === selectedScreenIdx ? 600 : 500,
                        color: "#111827",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {screen.id}
                    </div>
                    <div style={{ fontSize: "11px", color: "#9ca3af", display: "flex", gap: "4px" }}>
                      {screen.terminal && (
                        <span
                          style={{
                            background: "#dcfce7",
                            color: "#16a34a",
                            padding: "1px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                            fontWeight: 600,
                          }}
                        >
                          Terminal
                        </span>
                      )}
                      <span>{screen.layout.children.length} items</span>
                    </div>
                  </div>
                  {screens.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeScreen(idx);
                      }}
                      style={{
                        padding: "4px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#ef4444",
                        opacity: 0.6,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Screen Properties */}
          {currentScreen && (
            <div style={{ padding: "12px", borderBottom: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280", marginBottom: "8px" }}>
                <Settings2 size={12} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
                Screen Properties
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <input
                  value={currentScreen.id}
                  onChange={(e) => updateScreen(selectedScreenIdx, { id: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") })}
                  placeholder="SCREEN_ID"
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontFamily: "monospace",
                    outline: "none",
                  }}
                />
                <input
                  value={currentScreen.title || ""}
                  onChange={(e) => updateScreen(selectedScreenIdx, { title: e.target.value })}
                  placeholder="Screen Title"
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    fontSize: "12px",
                    outline: "none",
                  }}
                />
                <div style={{ display: "flex", gap: "12px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#374151" }}>
                    <input
                      type="checkbox"
                      checked={currentScreen.terminal || false}
                      onChange={(e) => updateScreen(selectedScreenIdx, { terminal: e.target.checked, success: e.target.checked ? true : undefined })}
                      style={{ accentColor: "#25D366" }}
                    />
                    Terminal
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Components List in Screen */}
          {currentScreen && (
            <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
              <div style={{ padding: "12px 12px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", fontWeight: 600, color: "#6b7280" }}>
                  Components ({currentScreen.layout.children.length})
                </span>
                <button
                  onClick={() => setShowComponentPalette(!showComponentPalette)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "4px 10px",
                    background: "rgba(139, 92, 246, 0.1)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#8b5cf6",
                    cursor: "pointer",
                  }}
                >
                  <Plus size={13} /> Add
                </button>
              </div>

              {/* Component Palette Dropdown */}
              {showComponentPalette && (
                <div
                  style={{
                    margin: "0 12px 8px",
                    padding: "8px",
                    background: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                    <div key={cat} style={{ marginBottom: "4px" }}>
                      <button
                        onClick={() =>
                          setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }))
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          width: "100%",
                          padding: "6px 4px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "11px",
                          fontWeight: 600,
                          color: CATEGORY_COLORS[cat],
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {expandedCategories[cat] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        {label}
                      </button>
                      {expandedCategories[cat] && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingLeft: "8px" }}>
                          {COMPONENT_CATALOG.filter((c) => c.category === cat).map((template) => {
                            const Icon = template.icon;
                            return (
                              <button
                                key={template.type}
                                onClick={() => addComponent(template)}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  padding: "6px 8px",
                                  background: "#fff",
                                  border: "1px solid #f3f4f6",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "12px",
                                  color: "#374151",
                                  fontWeight: 500,
                                  textAlign: "left",
                                  width: "100%",
                                  transition: "all 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = CATEGORY_COLORS[cat];
                                  e.currentTarget.style.background = `${CATEGORY_COLORS[cat]}08`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = "#f3f4f6";
                                  e.currentTarget.style.background = "#fff";
                                }}
                              >
                                <Icon size={14} style={{ color: CATEGORY_COLORS[cat], flexShrink: 0 }} />
                                {template.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Component List */}
              <div style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
                {currentScreen.layout.children.map((comp, idx) => {
                  const template = COMPONENT_CATALOG.find((c) => c.type === comp.type);
                  const Icon = template?.icon || Type;
                  const cat = template?.category || "text";
                  return (
                    <div
                      key={comp._id || idx}
                      onClick={() => setSelectedCompIdx(idx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 10px",
                        marginBottom: "4px",
                        background: idx === selectedCompIdx ? "rgba(139, 92, 246, 0.06)" : "#fff",
                        border: idx === selectedCompIdx ? "1px solid rgba(139, 92, 246, 0.3)" : "1px solid #f3f4f6",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", cursor: "grab", color: "#d1d5db" }}>
                        {idx > 0 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); moveComponent(idx, idx - 1); }}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "0", lineHeight: 0 }}
                          >
                            <ChevronRight size={12} style={{ transform: "rotate(-90deg)", color: "#9ca3af" }} />
                          </button>
                        )}
                        {idx < currentScreen.layout.children.length - 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); moveComponent(idx, idx + 1); }}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "0", lineHeight: 0 }}
                          >
                            <ChevronRight size={12} style={{ transform: "rotate(90deg)", color: "#9ca3af" }} />
                          </button>
                        )}
                      </div>
                      <Icon size={14} style={{ color: CATEGORY_COLORS[cat], flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "12px",
                            fontWeight: 500,
                            color: "#374151",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {comp.type}
                        </div>
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#9ca3af",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {comp.name || comp.text || comp.label || ""}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeComponent(idx);
                        }}
                        style={{
                          padding: "2px",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#ef4444",
                          opacity: 0.5,
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CENTER PANEL: Preview/JSON Tabs */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Tab Switcher */}
          <div
            style={{
              display: "flex",
              padding: "8px 16px",
              gap: "4px",
              background: "#fff",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <button
              onClick={() => setActiveTab("preview")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "preview" ? "#25D366" : "transparent",
                color: activeTab === "preview" ? "#fff" : "#6b7280",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Smartphone size={15} />
              Preview
            </button>
            <button
              onClick={() => setActiveTab("json")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                border: "none",
                background: activeTab === "json" ? "#25D366" : "transparent",
                color: activeTab === "json" ? "#fff" : "#6b7280",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <Code size={15} />
              JSON Output
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: "20px" }}>
            {activeTab === "preview" ? (
              /* WhatsApp Phone Preview */
              <div
                style={{
                  width: "375px",
                  height: "667px",
                  borderRadius: "40px",
                  background: "#111",
                  padding: "12px",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "30px",
                    background: "#fff",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Phone status bar */}
                  <div
                    style={{
                      height: "44px",
                      background: "#075e54",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 20px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <X size={18} color="#fff" />
                      <span style={{ color: "#fff", fontSize: "15px", fontWeight: 600 }}>
                        {currentScreen?.title || currentScreen?.id || "Flow"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "12px" }}>
                      <span style={{ color: "#fff", fontSize: "18px" }}>&#8942;</span>
                    </div>
                  </div>

                  {/* Phone Content */}
                  <div style={{ flex: 1, overflow: "auto" }}>
                    <PhonePreview screen={currentScreen ? { ...currentScreen } : null} />
                  </div>
                </div>
              </div>
            ) : (
              /* JSON Output */
              <div style={{ width: "100%", maxWidth: "900px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                    Flow JSON Output ({(jsonString.length / 1024).toFixed(1)} KB)
                  </span>
                  <button
                    onClick={copyJSON}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "8px",
                      background: copiedJSON ? "#10b981" : "#25D366",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    {copiedJSON ? <Check size={15} /> : <Copy size={15} />}
                    {copiedJSON ? "Copied!" : "Copy to Clipboard"}
                  </button>
                </div>
                <pre
                  style={{
                    background: "#1e293b",
                    color: "#e2e8f0",
                    padding: "20px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    lineHeight: "1.6",
                    overflow: "auto",
                    maxHeight: "calc(100vh - 300px)",
                    fontFamily: "'Fira Code', 'Cascadia Code', 'JetBrains Mono', monospace",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {jsonString}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Properties Editor */}
        <div
          style={{
            width: "300px",
            flexShrink: 0,
            background: "#fff",
            borderLeft: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
              <Settings2 size={14} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
              Properties
            </span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {selectedComp && selectedTemplate ? (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "16px",
                    padding: "10px",
                    background: `${CATEGORY_COLORS[selectedTemplate.category]}08`,
                    border: `1px solid ${CATEGORY_COLORS[selectedTemplate.category]}20`,
                    borderRadius: "8px",
                  }}
                >
                  <selectedTemplate.icon size={18} style={{ color: CATEGORY_COLORS[selectedTemplate.category] }} />
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{selectedTemplate.label}</div>
                    <div style={{ fontSize: "11px", color: "#6b7280" }}>{selectedTemplate.type}</div>
                  </div>
                </div>
                <PropertiesEditor
                  component={selectedComp}
                  template={selectedTemplate}
                  screenIds={screenIds}
                  formFields={currentFormFields}
                  onChange={(updated) => {
                    if (selectedCompIdx !== null) updateComponent(selectedCompIdx, updated);
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#9ca3af",
                  textAlign: "center",
                  padding: "20px",
                }}
              >
                <Eye size={40} style={{ marginBottom: "12px", opacity: 0.3 }} />
                <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "4px" }}>No component selected</p>
                <p style={{ fontSize: "12px" }}>Click a component in the left panel to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowImportModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              width: "600px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#111827" }}>Import Flow JSON</h3>
              <button
                onClick={() => setShowImportModal(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} color="#6b7280" />
              </button>
            </div>
            <p style={{ fontSize: "13px", color: "#6b7280" }}>
              Paste your WhatsApp Flow JSON below to load it into the builder.
            </p>
            <textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value);
                setImportError("");
              }}
              placeholder='{"version": "7.3", "screens": [...]}'
              style={{
                width: "100%",
                height: "300px",
                padding: "12px",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                fontSize: "13px",
                fontFamily: "monospace",
                outline: "none",
                resize: "none",
              }}
            />
            {importError && (
              <div style={{ fontSize: "13px", color: "#dc2626", display: "flex", alignItems: "center", gap: "6px" }}>
                <AlertCircle size={14} /> {importError}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                onClick={() => setShowImportModal(false)}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  background: "#fff",
                  fontSize: "14px",
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#25D366",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: "#fff",
                }}
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
