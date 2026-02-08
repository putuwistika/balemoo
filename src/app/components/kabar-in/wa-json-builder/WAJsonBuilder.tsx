import { useState, useCallback, useMemo, useEffect } from "react";
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
      { key: "markdown", label: "Markdown", type: "boolean" },
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
      { key: "markdown", label: "Markdown", type: "boolean" },
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
      { key: "pattern", label: "Pattern (Regex)", type: "text", placeholder: "e.g. ^[0-9]{4}$" },
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
      { key: "src", label: "Image Source", type: "image-upload" },
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
      { key: "images", label: "Images", type: "image-carousel" },
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
    // Strip pattern from TextInput if input-type doesn't support it
    if (key === "pattern" && comp.type === "TextInput") {
      const inputType = comp["input-type"] || "text";
      if (!["text", "number", "password", "passcode"].includes(inputType)) continue;
    }
    // Validate navigate actions - remove references to non-existent screens
    if ((key === "on-click-action" || key === "on-select-action") && value?.name === "navigate") {
      if (!value.next?.name || !validScreenIds.has(value.next.name)) {
        // Skip invalid navigate action - convert to complete instead
        cleaned[key] = { name: "complete", payload: value.payload || {} };
        continue;
      }
    }
    // Clean NavigationList list-items: validate per-item navigate actions
    if (key === "list-items" && comp.type === "NavigationList" && Array.isArray(value)) {
      cleaned[key] = value.map((item: any) => {
        if (item["on-click-action"]?.name === "navigate") {
          if (!item["on-click-action"].next?.name || !validScreenIds.has(item["on-click-action"].next.name)) {
            const { "on-click-action": _, ...rest } = item;
            return { ...rest, "on-click-action": { name: "complete", payload: item["on-click-action"].payload || {} } };
          }
        }
        return item;
      });
      continue;
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
    // Also check inside Form children
    if (c.type === "Form" && Array.isArray(c.children)) {
      targets.push(...collectNavigateTargets(c.children));
    }
    // Check inside NavigationList list-items for per-item navigate actions
    if (c.type === "NavigationList" && Array.isArray(c["list-items"])) {
      c["list-items"].forEach((item: any) => {
        if (item["on-click-action"]?.name === "navigate" && item["on-click-action"]?.next?.name) {
          targets.push(item["on-click-action"].next.name);
        }
      });
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

  // Component types that must be inside a Form wrapper
  const FORM_CHILD_TYPES = new Set([
    "TextInput", "TextArea", "DatePicker", "CalendarPicker",
    "RadioButtonsGroup", "CheckboxGroup", "Dropdown", "OptIn",
    "Footer", "ChipsSelector", "PhotoPicker",
  ]);

  flow.screens = screens.map((s) => {
    const screen: any = { id: s.id };
    if (s.title) screen.title = s.title;
    if (s.terminal) screen.terminal = true;
    if (s.terminal && s.success !== false) screen.success = true;
    if (s.data && Object.keys(s.data).length > 0) screen.data = s.data;

    const cleaned = s.layout.children.map((c) => cleanComponent(c, screenIdSet));
    const hasFormChildren = cleaned.some((c) => FORM_CHILD_TYPES.has(c.type));

    if (hasFormChildren) {
      // Split into non-form (before) and form children
      const beforeForm: FlowComponent[] = [];
      const formChildren: FlowComponent[] = [];
      let hitForm = false;
      for (const c of cleaned) {
        if (FORM_CHILD_TYPES.has(c.type)) {
          hitForm = true;
          formChildren.push(c);
        } else if (!hitForm) {
          beforeForm.push(c);
        } else {
          // Non-form component after form started - put inside form too
          formChildren.push(c);
        }
      }
      // Build Form wrapper
      const formMeta = (s as any)._formMeta;
      const form: any = {
        type: "Form",
        name: formMeta?.name || "flow_form",
        children: formChildren,
      };
      // Build init-values from components with default values
      const initValues: Record<string, any> = formMeta?.["init-values"] || {};
      form["init-values"] = Object.keys(initValues).length > 0 ? initValues : undefined;
      if (!form["init-values"]) delete form["init-values"];

      screen.layout = {
        type: "SingleColumnLayout",
        children: [...beforeForm, form],
      };
    } else {
      screen.layout = {
        type: "SingleColumnLayout",
        children: cleaned,
      };
    }
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
          <PhoneComponent key={idx} component={comp} screenData={screen.data} />
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
function processInline(text: string): (string | JSX.Element)[] {
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
    // Inline code: `code`
    const codeMatch = remaining.match(/`([^`]+)`/);
    // Image: ![alt](src) - supports base64 and URLs
    const imgMatch = remaining.match(/!\[([^\]]*)\]\(([^)]+)\)/);
    // Link: [text](url)
    const linkMatch = remaining.match(/\[(.+?)\]\((.+?)\)/);

    // Find earliest match
    const matches = [
      boldMatch ? { type: "bold", match: boldMatch, idx: boldMatch.index! } : null,
      italicMatch ? { type: "italic", match: italicMatch, idx: italicMatch.index! } : null,
      strikeMatch ? { type: "strike", match: strikeMatch, idx: strikeMatch.index! } : null,
      codeMatch ? { type: "code", match: codeMatch, idx: codeMatch.index! } : null,
      imgMatch ? { type: "img", match: imgMatch, idx: imgMatch.index! } : null,
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
    } else if (first.type === "code") {
      parts.push(
        <code key={`c${keyIdx}`} style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "3px", fontSize: "13px", fontFamily: "monospace" }}>
          {first.match![1]}
        </code>
      );
      remaining = remaining.substring(first.idx + first.match![0].length);
    } else if (first.type === "img") {
      const alt = first.match![1];
      const src = resolveImageSrc(first.match![2]);
      parts.push(
        <img key={`img${keyIdx}`} src={src} alt={alt} style={{ maxWidth: "100%", borderRadius: "8px", margin: "4px 0" }} />
      );
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
}

function parseMarkdownLine(line: string): JSX.Element {
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
  // Image line (standalone): ![alt](src)
  const imgLineMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (imgLineMatch) {
    const src = resolveImageSrc(imgLineMatch[2]);
    return <img src={src} alt={imgLineMatch[1]} style={{ maxWidth: "100%", borderRadius: "8px", margin: "4px 0" }} />;
  }
  // Empty line = spacing
  if (line.trim() === "") {
    return <div style={{ height: "8px" }} />;
  }
  // Normal paragraph
  return <div style={{ marginBottom: "2px" }}>{processInline(line)}</div>;
}

// --- Table parser for markdown tables ---
function parseMarkdownTable(lines: string[]): { tableLines: string[][]; headerLine: number; endIndex: number } | null {
  // A table needs at least header + separator
  if (lines.length < 2) return null;
  const cells = (line: string) =>
    line.split("|").map((c) => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length); // trim outer empty from leading/trailing |
  const isSeparator = (line: string) => /^\|?[\s\-:|]+\|[\s\-:|]+\|?$/.test(line);

  if (!isSeparator(lines[1])) return null;

  const tableLines: string[][] = [];
  tableLines.push(cells(lines[0]));
  let endIndex = 1;
  for (let i = 2; i < lines.length; i++) {
    if (lines[i].includes("|")) {
      tableLines.push(cells(lines[i]));
      endIndex = i;
    } else {
      break;
    }
  }
  return { tableLines, headerLine: 0, endIndex };
}

function RichTextPreview({ text }: { text: string | string[] }) {
  const lines = Array.isArray(text) ? text : (text || "Rich text content").split("\n");
  const elements: JSX.Element[] = [];
  let i = 0;

  while (i < lines.length) {
    // Try parsing a table starting at current line
    const tableResult = parseMarkdownTable(lines.slice(i));
    if (tableResult && tableResult.tableLines.length >= 2) {
      const { tableLines, endIndex } = tableResult;
      const headerCells = tableLines[0];
      const bodyRows = tableLines.slice(1);
      elements.push(
        <div key={`tbl-${i}`} style={{ overflowX: "auto", margin: "6px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr>
                {headerCells.map((cell, ci) => (
                  <th key={ci} style={{ border: "1px solid #d1d5db", padding: "6px 8px", background: "#f9fafb", fontWeight: 600, textAlign: "left", color: "#111827" }}>
                    {processInline(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ border: "1px solid #d1d5db", padding: "6px 8px", color: "#374151" }}>
                      {processInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      i += endIndex + 1;
    } else {
      elements.push(<div key={i}>{parseMarkdownLine(lines[i])}</div>);
      i++;
    }
  }

  return (
    <div style={{ fontSize: "14px", color: "#374151", lineHeight: "1.5" }}>
      {elements}
    </div>
  );
}

// --- Base64 Image helper ---
function resolveImageSrc(src: string): string {
  if (!src) return "";
  if (src.startsWith("data:")) return src;
  // Try to detect image type from base64 header (legacy raw base64)
  if (src.startsWith("/9j/")) return `data:image/jpeg;base64,${src}`;
  if (src.startsWith("iVBOR")) return `data:image/png;base64,${src}`;
  if (src.startsWith("R0lGOD")) return `data:image/gif;base64,${src}`;
  if (src.startsWith("UklGR")) return `data:image/webp;base64,${src}`;
  // Default to png
  return `data:image/png;base64,${src}`;
}

/** Get approximate original file size in KB from a base64 or data URI string */
function getBase64SizeKB(val: string): number {
  const raw = val.includes(",") ? val.split(",")[1] : val;
  return Math.round((raw?.length || 0) * 0.75 / 1024);
}

/**
 * Read file → raw base64 (no data: prefix).
 * If original file ≤ 300KB → use original bytes (best Meta compatibility).
 * If > 300KB → resize via Canvas to fit under 300KB.
 */
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const rawBase64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      const originalSizeKB = rawBase64.length * 0.75 / 1024;

      // Under 300KB — use original file bytes directly (guaranteed Meta compatible)
      if (originalSizeKB <= 300) {
        resolve(rawBase64);
        return;
      }

      // Over 300KB — need to compress via Canvas to meet Meta's limit
      const img = new window.Image();
      img.onload = () => {
        const { naturalWidth: w, naturalHeight: h } = img;
        // Scale down proportionally: try multiple sizes until under 300KB
        const tryCompress = (scale: number, q: number): string => {
          const canvas = document.createElement("canvas");
          canvas.width = Math.round(w * scale);
          canvas.height = Math.round(h * scale);
          canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
          const out = canvas.toDataURL("image/jpeg", q);
          return out.includes(",") ? out.split(",")[1] : out;
        };

        // Try progressively smaller sizes until under 300KB (~400KB base64)
        const attempts: [number, number][] = [
          [1, 0.7], [0.8, 0.7], [0.6, 0.6], [0.5, 0.5], [0.4, 0.4], [0.3, 0.3],
        ];
        for (const [scale, q] of attempts) {
          const result = tryCompress(scale, q);
          if (result.length * 0.75 / 1024 <= 300) {
            resolve(result);
            return;
          }
        }
        // Last resort: smallest attempt
        resolve(tryCompress(0.25, 0.3));
      };
      img.onerror = () => resolve(rawBase64); // fallback
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function PhoneComponent({ component, screenData }: { component: FlowComponent; screenData?: Record<string, any> }) {
  const style: Record<string, any> = { marginBottom: "12px" };

  // Helper to resolve dynamic text for preview
  const rd = (val: any) => resolveDynamic(val, screenData);

  switch (component.type) {
    case "TextHeading":
      return (
        <div style={{ ...style, fontWeight: 700, fontSize: "18px", color: "#111827" }}>
          {rd(component.text) || "Heading"}
        </div>
      );
    case "TextSubheading":
      return (
        <div style={{ ...style, fontWeight: 600, fontSize: "15px", color: "#1f2937" }}>
          {rd(component.text) || "Subheading"}
        </div>
      );
    case "TextBody": {
      const bodyText = rd(component.text) || "Body text";
      return (
        <div
          style={{
            ...style,
            fontSize: "14px",
            color: "#374151",
            fontWeight: component["font-weight"] === "bold" || component["font-weight"] === "bold_italic" ? 700 : 400,
            fontStyle: component["font-weight"] === "italic" || component["font-weight"] === "bold_italic" ? "italic" : "normal",
            textDecoration: component.strikethrough ? "line-through" : "none",
          }}
        >
          {component.markdown ? <RichTextPreview text={bodyText} /> : bodyText}
        </div>
      );
    }
    case "TextCaption": {
      const captionText = rd(component.text) || "Caption";
      return (
        <div
          style={{
            ...style,
            fontSize: "12px",
            color: "#6b7280",
            fontWeight: component["font-weight"] === "bold" || component["font-weight"] === "bold_italic" ? 700 : 400,
            fontStyle: component["font-weight"] === "italic" || component["font-weight"] === "bold_italic" ? "italic" : "normal",
            textDecoration: component.strikethrough ? "line-through" : "none",
          }}
        >
          {component.markdown ? <RichTextPreview text={captionText} /> : captionText}
        </div>
      );
    }
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
              {rd(component.label) || "Text Input"} {component.required && "*"}
            </span>
            <div style={{ fontSize: "14px", color: "#9ca3af", marginTop: "4px" }}>
              {rd(component["init-value"]) || rd(component.label) || "Enter text"}
            </div>
          </div>
          {component["helper-text"] && (
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "4px", paddingLeft: "4px" }}>
              {rd(component["helper-text"])}
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
    case "RadioButtonsGroup": {
      const radioDs = resolveDataSource(component["data-source"], screenData);
      const radioLabel = resolveDynamic(component.label, screenData) || "Select option";
      return (
        <div style={style}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
            {radioLabel}
          </div>
          {radioDs.isDynamic && radioDs.dynamicRef && (
            <div style={{ fontSize: "10px", color: "#8b5cf6", marginBottom: "4px", fontStyle: "italic" }}>
              {radioDs.dynamicRef}{radioDs.items.length > 0 ? " (example)" : ""}
            </div>
          )}
          {radioDs.items.length > 0 ? radioDs.items.map((opt: any, i: number) => (
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
              {opt.image && (
                <img src={resolveImageSrc(opt.image)} alt={opt["alt-text"] || opt.title} style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", color: "#111827", fontWeight: 500 }}>{opt.title}</div>
                {opt.description && (
                  <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.3" }}>{opt.description}</div>
                )}
              </div>
            </div>
          )) : radioDs.isDynamic && (
            <div style={{ padding: "10px", background: "#f9fafb", borderRadius: "6px", fontSize: "12px", color: "#6b7280", fontStyle: "italic" }}>
              No example data
            </div>
          )}
        </div>
      );
    }
    case "CheckboxGroup": {
      const cbDs = resolveDataSource(component["data-source"], screenData);
      const cbLabel = resolveDynamic(component.label, screenData) || "Select options";
      const cbDesc = resolveDynamic(component.description, screenData);
      return (
        <div style={style}>
          <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "8px" }}>
            {cbLabel}
          </div>
          {cbDesc && (
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>{cbDesc}</div>
          )}
          {cbDs.isDynamic && cbDs.dynamicRef && (
            <div style={{ fontSize: "10px", color: "#8b5cf6", marginBottom: "4px", fontStyle: "italic" }}>
              {cbDs.dynamicRef}{cbDs.items.length > 0 ? " (example)" : ""}
            </div>
          )}
          {cbDs.items.length > 0 ? cbDs.items.map((opt: any, i: number) => (
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
              {opt.image && (
                <img src={resolveImageSrc(opt.image)} alt={opt["alt-text"] || opt.title} style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", flexShrink: 0 }} />
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", color: "#111827" }}>{opt.title}</div>
                {opt.description && (
                  <div style={{ fontSize: "12px", color: "#6b7280", lineHeight: "1.3" }}>{opt.description}</div>
                )}
              </div>
            </div>
          )) : cbDs.isDynamic && (
            <div style={{ padding: "10px", background: "#f9fafb", borderRadius: "6px", fontSize: "12px", color: "#6b7280", fontStyle: "italic" }}>
              No example data
            </div>
          )}
        </div>
      );
    }
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
            <span style={{ fontSize: "14px", color: "#6b7280" }}>{rd(component.label) || "Select"}</span>
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
    case "ImageCarousel": {
      const carouselImages = (() => {
        const val = component.images;
        if (Array.isArray(val)) return val;
        if (typeof val === "string" && val.startsWith("${data.")) {
          const resolved = resolveDynamic(val, screenData);
          if (Array.isArray(resolved)) return resolved;
        }
        return [];
      })();
      const carouselIsDynamic = typeof component.images === "string" && component.images.startsWith("${data.");
      return (
        <div style={style}>
          {carouselIsDynamic && (
            <div style={{ fontSize: "10px", color: "#8b5cf6", marginBottom: "4px", fontStyle: "italic" }}>
              {component.images}{carouselImages.length > 0 ? " (example)" : ""}
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              padding: "4px 0",
            }}
          >
            {carouselImages.length > 0 ? carouselImages.map((img: any, i: number) => (
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
                  overflow: "hidden",
                }}
              >
                {img.src ? (
                  <img
                    src={resolveImageSrc(img.src)}
                    alt={img["alt-text"] || `Slide ${i + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: component["scale-type"] === "cover" ? "cover" : "contain", borderRadius: "8px" }}
                  />
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <Images size={24} />
                    <div style={{ fontSize: "10px", marginTop: "2px" }}>Slide {i + 1}</div>
                  </div>
                )}
              </div>
            )) : (
              <div style={{ padding: "16px", background: "#f9fafb", borderRadius: "8px", textAlign: "center", color: "#9ca3af", fontSize: "12px", width: "100%" }}>
                {carouselIsDynamic ? "No example data" : "No images added"}
              </div>
            )}
          </div>
        </div>
      );
    }
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
    case "ChipsSelector": {
      const chipsDs = resolveDataSource(component["data-source"], screenData);
      const chipsLabel = resolveDynamic(component.label, screenData) || "Select options";
      const chipsDesc = resolveDynamic(component.description, screenData);
      return (
        <div style={style}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
            {chipsLabel}
          </div>
          {chipsDesc && (
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>{chipsDesc}</div>
          )}
          {chipsDs.isDynamic && chipsDs.dynamicRef && (
            <div style={{ fontSize: "10px", color: "#8b5cf6", marginBottom: "4px", fontStyle: "italic" }}>
              {chipsDs.dynamicRef}{chipsDs.items.length > 0 ? " (example)" : ""}
            </div>
          )}
          {chipsDs.items.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {chipsDs.items.map((opt: any, i: number) => (
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
          ) : chipsDs.isDynamic && (
            <div style={{ padding: "10px", background: "#f9fafb", borderRadius: "6px", fontSize: "12px", color: "#6b7280", fontStyle: "italic" }}>
              No example data
            </div>
          )}
        </div>
      );
    }
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
            {(component["list-items"] || []).map((item: any, i: number) => {
              const itemAction = item["on-click-action"] || component["on-click-action"];
              const navTarget = itemAction?.name === "navigate" ? itemAction?.next?.name : null;
              return (
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
                  {/* Start image thumbnail */}
                  {item.start?.src && (
                    <img
                      src={resolveImageSrc(item.start.src)}
                      alt={item.start?.["alt-text"] || ""}
                      style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover", flexShrink: 0, marginRight: "10px" }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                        {item["main-content"]?.title || `Item ${i + 1}`}
                      </div>
                      {item.badge && (
                        <span style={{ fontSize: "10px", background: "#dcfce7", color: "#16a34a", padding: "1px 6px", borderRadius: "8px", fontWeight: 600 }}>
                          {item.badge}
                        </span>
                      )}
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
                    {/* Tags */}
                    {item.tags?.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", marginTop: "4px", flexWrap: "wrap" }}>
                        {item.tags.map((tag: string, ti: number) => (
                          <span key={ti} style={{ fontSize: "9px", background: "#f3f4f6", color: "#6b7280", padding: "1px 6px", borderRadius: "4px" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Navigate target indicator */}
                    {navTarget && (
                      <div style={{ fontSize: "9px", color: "#8b5cf6", marginTop: "3px" }}>
                        → {navTarget}
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
                      {item.end.metadata && (
                        <div style={{ fontSize: "10px", color: "#9ca3af" }}>{item.end.metadata}</div>
                      )}
                    </div>
                  )}
                  <ChevronRight size={16} color="#d1d5db" style={{ marginLeft: "8px", flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        </div>
      );
    case "Form":
      // Form is a transparent wrapper - render its children directly
      return (
        <div style={style}>
          {(component.children || []).map((child: any, ci: number) => (
            <PhoneComponent key={ci} component={child} screenData={screenData} />
          ))}
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

// --- Helper: resolve dynamic ${data.xxx} references using screen data's __example__ ---
function resolveDynamic(value: any, screenData?: Record<string, any>): any {
  if (typeof value !== "string" || !value.startsWith("${data.")) return value;
  if (!screenData) return value;
  const match = value.match(/^\$\{data\.(.+)\}$/);
  if (!match) return value;
  const key = match[1];
  const entry = screenData[key];
  if (!entry) return value;
  // Use __example__ if available (WA Flows data schema pattern)
  if (entry.__example__ !== undefined) return entry.__example__;
  return value;
}

// --- Helper: resolve data-source (can be array or dynamic string) ---
function resolveDataSource(ds: any, screenData?: Record<string, any>): { items: any[]; isDynamic: boolean; dynamicRef: string } {
  if (Array.isArray(ds)) return { items: ds, isDynamic: false, dynamicRef: "" };
  if (typeof ds === "string" && ds.startsWith("${")) {
    const resolved = resolveDynamic(ds, screenData);
    if (Array.isArray(resolved)) return { items: resolved, isDynamic: true, dynamicRef: ds };
    return { items: [], isDynamic: true, dynamicRef: ds };
  }
  return { items: [], isDynamic: false, dynamicRef: "" };
}

// --- Options Editor (for data-source) ---
function OptionsEditor({
  options,
  onChange,
}: {
  options: Record<string, any>[];
  onChange: (opts: Record<string, any>[]) => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const addOption = () => {
    const num = options.length + 1;
    onChange([...options, { id: `option_${num}`, title: `Option ${num}` }]);
  };

  const removeOption = (idx: number) => {
    if (expandedIdx === idx) setExpandedIdx(null);
    onChange(options.filter((_, i) => i !== idx));
  };

  const updateOption = (idx: number, field: string, value: string) => {
    const updated = [...options];
    updated[idx] = { ...updated[idx], [field]: value || undefined };
    // Clean up undefined values
    if (!value) delete updated[idx][field];
    onChange(updated);
  };

  const handleImageUpload = (idx: number, file: File) => {
    readFileAsBase64(file).then((base64) => {
      const updated = [...options];
      updated[idx] = { ...updated[idx], image: base64 };
      onChange(updated);
    }).catch(() => alert("Failed to process image"));
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
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {options.map((opt, idx) => (
        <div key={idx} style={{ border: "1px solid #f3f4f6", borderRadius: "8px", padding: "6px", background: expandedIdx === idx ? "#fafafa" : "#fff" }}>
          {/* Compact row: ID + Title + actions */}
          <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
            {opt.image && (
              <img src={resolveImageSrc(opt.image)} alt="" style={{ width: "24px", height: "24px", borderRadius: "4px", objectFit: "cover", flexShrink: 0 }} />
            )}
            <input value={opt.id || ""} onChange={(e) => updateOption(idx, "id", e.target.value)} placeholder="ID" style={{ ...inputStyle, flex: 1 }} />
            <input value={opt.title || ""} onChange={(e) => updateOption(idx, "title", e.target.value)} placeholder="Title" style={{ ...inputStyle, flex: 2 }} />
            <button
              onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
              title="More fields"
              style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: expandedIdx === idx ? "#8b5cf6" : "#9ca3af", fontSize: "14px" }}
            >
              {expandedIdx === idx ? "▾" : "▸"}
            </button>
            <button onClick={() => removeOption(idx)} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}>
              <X size={14} />
            </button>
          </div>
          {/* Expanded: description, image, alt-text */}
          {expandedIdx === idx && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #f3f4f6" }}>
              <input value={opt.description || ""} onChange={(e) => updateOption(idx, "description", e.target.value)} placeholder="Description (optional)" style={inputStyle} />
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <input value={opt["alt-text"] || ""} onChange={(e) => updateOption(idx, "alt-text", e.target.value)} placeholder="Alt text (optional)" style={{ ...inputStyle, flex: 1 }} />
                <label style={{ padding: "5px 8px", background: "#f3f4f6", borderRadius: "6px", fontSize: "11px", color: "#6b7280", cursor: "pointer", whiteSpace: "nowrap" }}>
                  {opt.image ? "Change img" : "Upload img"}
                  <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(idx, e.target.files[0])} style={{ display: "none" }} />
                </label>
                {opt.image && (
                  <button onClick={() => updateOption(idx, "image", "")} style={{ padding: "4px", background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "11px" }}>
                    Remove
                  </button>
                )}
              </div>
              {opt.image && (
                <img src={resolveImageSrc(opt.image)} alt={opt["alt-text"] || ""} style={{ width: "60px", height: "60px", borderRadius: "6px", objectFit: "cover" }} />
              )}
            </div>
          )}
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
  screenIds,
  formFields,
  version,
  allFormFields,
  currentScreenId,
}: {
  items: any[];
  onChange: (items: any[]) => void;
  screenIds: string[];
  formFields: { name: string; type: string }[];
  version: string;
  allFormFields: { screenId: string; name: string; type: string }[];
  currentScreenId: string;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [showSections, setShowSections] = useState<Record<number, Set<string>>>({});

  const toggleSection = (idx: number, section: string) => {
    setShowSections((prev) => {
      const curr = new Set(prev[idx] || []);
      if (curr.has(section)) curr.delete(section); else curr.add(section);
      return { ...prev, [idx]: curr };
    });
  };

  const isSectionVisible = (idx: number, section: string) => showSections[idx]?.has(section) || false;

  const addItem = () => {
    const num = items.length + 1;
    onChange([...items, { id: `item_${num}`, "main-content": { title: `Item ${num}`, description: "" } }]);
  };

  const removeItem = (idx: number) => {
    if (expandedIdx === idx) setExpandedIdx(null);
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateItemField = (idx: number, path: string, value: any) => {
    const updated = [...items];
    const item = { ...updated[idx] };
    if (path.includes(".")) {
      const [parent, child] = path.split(".");
      item[parent] = { ...(item[parent] || {}), [child]: value || undefined };
      // Clean up empty objects
      if (value === "" || value === undefined) {
        delete item[parent][child];
        if (Object.keys(item[parent]).length === 0) delete item[parent];
      }
    } else {
      if (value === "" || value === undefined) delete item[path];
      else item[path] = value;
    }
    updated[idx] = item;
    onChange(updated);
  };

  const updateItemAction = (idx: number, action: any) => {
    const updated = [...items];
    // Ensure navigate action has next.type = "screen"
    if (action.name === "navigate" && action.next && !action.next.type) {
      action.next.type = "screen";
    }
    updated[idx] = { ...updated[idx], "on-click-action": action };
    onChange(updated);
  };

  const removeItemAction = (idx: number) => {
    const updated = [...items];
    const { "on-click-action": _, ...rest } = updated[idx];
    updated[idx] = rest;
    onChange(updated);
  };

  const handleStartImage = (idx: number, file: File) => {
    readFileAsBase64(file).then((base64) => {
      updateItemField(idx, "start.src", base64);
    }).catch(() => alert("Failed to process image"));
  };

  const updateTags = (idx: number, tags: string[]) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], tags: tags.length > 0 ? tags : undefined };
    onChange(updated);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "6px 8px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "12px",
    outline: "none",
    background: "#fff",
  };

  const sectionBtnStyle: React.CSSProperties = {
    padding: "3px 8px",
    background: "rgba(139, 92, 246, 0.08)",
    border: "1px solid #e5e7eb",
    borderRadius: "4px",
    color: "#8b5cf6",
    fontSize: "10px",
    cursor: "pointer",
    fontWeight: 500,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {items.map((item, idx) => {
        const isExpanded = expandedIdx === idx;
        const itemTitle = item["main-content"]?.title || `Item ${idx + 1}`;
        const itemAction = item["on-click-action"];
        const actionTarget = itemAction?.name === "navigate" ? itemAction?.next?.name : itemAction?.name;
        const hasStart = item.start?.src;
        const hasEnd = item.end?.title || item.end?.description || item.end?.metadata;
        const hasBadge = !!item.badge;
        const hasTags = item.tags?.length > 0;

        return (
          <div key={idx} style={{
            border: `1px solid ${isExpanded ? "#c4b5fd" : "#f3f4f6"}`,
            borderRadius: "8px",
            background: isExpanded ? "#faf5ff" : "#f9fafb",
            overflow: "hidden",
          }}>
            {/* Collapsed header */}
            <div
              style={{
                display: "flex", alignItems: "center", gap: "6px", padding: "8px",
                cursor: "pointer", userSelect: "none",
              }}
              onClick={() => setExpandedIdx(isExpanded ? null : idx)}
            >
              <span style={{ fontSize: "10px", color: "#9ca3af" }}>{isExpanded ? "▾" : "▸"}</span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#374151", flex: 1 }}>
                {itemTitle}
              </span>
              {actionTarget && (
                <span style={{ fontSize: "10px", color: "#8b5cf6", background: "rgba(139,92,246,0.1)", padding: "2px 6px", borderRadius: "4px" }}>
                  → {actionTarget}
                </span>
              )}
              {hasBadge && <span style={{ fontSize: "9px", background: "#dcfce7", color: "#16a34a", padding: "1px 5px", borderRadius: "8px" }}>{item.badge}</span>}
              <button
                onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
                style={{ padding: "2px", background: "none", border: "none", cursor: "pointer", color: "#ef4444" }}
              >
                <X size={12} />
              </button>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <div style={{ padding: "0 8px 8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* ID */}
                <div>
                  <label style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "2px" }}>ID</label>
                  <input value={item.id || ""} onChange={(e) => updateItemField(idx, "id", e.target.value)} placeholder="item_id" style={inputStyle} />
                </div>

                {/* Main Content */}
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "6px" }}>
                  <label style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "4px" }}>Main Content</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <input value={item["main-content"]?.title || ""} onChange={(e) => updateItemField(idx, "main-content.title", e.target.value)} placeholder="Title *" style={inputStyle} />
                    <input value={item["main-content"]?.description || ""} onChange={(e) => updateItemField(idx, "main-content.description", e.target.value)} placeholder="Description" style={inputStyle} />
                    <input value={item["main-content"]?.metadata || ""} onChange={(e) => updateItemField(idx, "main-content.metadata", e.target.value)} placeholder="Metadata" style={inputStyle} />
                  </div>
                </div>

                {/* Section toggles */}
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  <button onClick={() => toggleSection(idx, "start")} style={{ ...sectionBtnStyle, background: hasStart ? "rgba(16,185,129,0.1)" : undefined }}>
                    {isSectionVisible(idx, "start") ? "▾" : "+"} Start Image
                  </button>
                  <button onClick={() => toggleSection(idx, "end")} style={{ ...sectionBtnStyle, background: hasEnd ? "rgba(16,185,129,0.1)" : undefined }}>
                    {isSectionVisible(idx, "end") ? "▾" : "+"} End Add-on
                  </button>
                  <button onClick={() => toggleSection(idx, "badge")} style={{ ...sectionBtnStyle, background: hasBadge ? "rgba(16,185,129,0.1)" : undefined }}>
                    {isSectionVisible(idx, "badge") ? "▾" : "+"} Badge
                  </button>
                  <button onClick={() => toggleSection(idx, "tags")} style={{ ...sectionBtnStyle, background: hasTags ? "rgba(16,185,129,0.1)" : undefined }}>
                    {isSectionVisible(idx, "tags") ? "▾" : "+"} Tags
                  </button>
                  <button onClick={() => toggleSection(idx, "action")} style={{ ...sectionBtnStyle, background: itemAction ? "rgba(16,185,129,0.1)" : undefined }}>
                    {isSectionVisible(idx, "action") ? "▾" : "+"} Action
                  </button>
                </div>

                {/* Start Image Section */}
                {isSectionVisible(idx, "start") && (
                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "6px" }}>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "4px" }}>Start (Image)</label>
                    {item.start?.src && (
                      <img src={resolveImageSrc(item.start.src)} alt={item.start?.["alt-text"] || ""} style={{ width: "48px", height: "48px", objectFit: "cover", borderRadius: "6px", marginBottom: "4px" }} />
                    )}
                    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                      <label style={{ padding: "5px 8px", background: "#f3f4f6", borderRadius: "6px", fontSize: "11px", color: "#6b7280", cursor: "pointer", whiteSpace: "nowrap" }}>
                        {item.start?.src ? "Change" : "Upload"}
                        <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleStartImage(idx, e.target.files[0])} style={{ display: "none" }} />
                      </label>
                      {item.start?.src && (
                        <button onClick={() => updateItemField(idx, "start.src", "")} style={{ padding: "4px 8px", background: "none", border: "1px solid #fca5a5", borderRadius: "4px", color: "#ef4444", fontSize: "10px", cursor: "pointer" }}>
                          Remove
                        </button>
                      )}
                    </div>
                    <input value={item.start?.["alt-text"] || ""} onChange={(e) => updateItemField(idx, "start.alt-text", e.target.value)} placeholder="Alt text" style={{ ...inputStyle, marginTop: "4px" }} />
                  </div>
                )}

                {/* End Add-on Section */}
                {isSectionVisible(idx, "end") && (
                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "6px" }}>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "4px" }}>End Add-on</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      <input value={item.end?.title || ""} onChange={(e) => updateItemField(idx, "end.title", e.target.value)} placeholder="Title" style={inputStyle} />
                      <input value={item.end?.description || ""} onChange={(e) => updateItemField(idx, "end.description", e.target.value)} placeholder="Description" style={inputStyle} />
                      <input value={item.end?.metadata || ""} onChange={(e) => updateItemField(idx, "end.metadata", e.target.value)} placeholder="Metadata" style={inputStyle} />
                    </div>
                  </div>
                )}

                {/* Badge Section */}
                {isSectionVisible(idx, "badge") && (
                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "6px" }}>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "4px" }}>Badge (max 15 chars, only 1 item can have badge)</label>
                    <input value={item.badge || ""} onChange={(e) => updateItemField(idx, "badge", e.target.value)} placeholder="Badge text" maxLength={15} style={inputStyle} />
                  </div>
                )}

                {/* Tags Section */}
                {isSectionVisible(idx, "tags") && (
                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "6px" }}>
                    <label style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280", display: "block", marginBottom: "4px" }}>Tags (max 3, 15 chars each)</label>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "4px" }}>
                      {(item.tags || []).map((tag: string, ti: number) => (
                        <div key={ti} style={{ display: "flex", alignItems: "center", gap: "2px", background: "#f3f4f6", borderRadius: "4px", padding: "2px 6px", fontSize: "11px" }}>
                          <input
                            value={tag}
                            onChange={(e) => {
                              const updated = [...(item.tags || [])];
                              updated[ti] = e.target.value;
                              updateTags(idx, updated);
                            }}
                            maxLength={15}
                            style={{ border: "none", background: "transparent", fontSize: "11px", width: "60px", outline: "none" }}
                          />
                          <button onClick={() => updateTags(idx, (item.tags || []).filter((_: string, i: number) => i !== ti))} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "0", fontSize: "12px" }}>×</button>
                        </div>
                      ))}
                      {(!item.tags || item.tags.length < 3) && (
                        <button onClick={() => updateTags(idx, [...(item.tags || []), ""])} style={{ padding: "2px 8px", background: "none", border: "1px dashed #d1d5db", borderRadius: "4px", fontSize: "10px", color: "#6b7280", cursor: "pointer" }}>
                          + Tag
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Per-item Action Section */}
                {isSectionVisible(idx, "action") && (
                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <label style={{ fontSize: "10px", fontWeight: 600, color: "#6b7280" }}>Per-item Action</label>
                      {itemAction && (
                        <button onClick={() => removeItemAction(idx)} style={{ fontSize: "10px", color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
                          Remove action
                        </button>
                      )}
                    </div>
                    {itemAction ? (
                      <ActionEditor
                        action={itemAction}
                        onChange={(a) => updateItemAction(idx, a)}
                        screenIds={screenIds}
                        formFields={formFields}
                        version={version}
                        allFormFields={allFormFields}
                        currentScreenId={currentScreenId}
                      />
                    ) : (
                      <button
                        onClick={() => updateItemAction(idx, { name: "navigate", next: { type: "screen", name: "" }, payload: {} })}
                        style={{ padding: "6px", background: "rgba(139,92,246,0.08)", border: "1px dashed #c4b5fd", borderRadius: "6px", color: "#8b5cf6", fontSize: "11px", cursor: "pointer", fontWeight: 500, width: "100%" }}
                      >
                        + Add navigate action
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
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
  version,
  allFormFields,
  currentScreenId,
}: {
  action: any;
  onChange: (a: any) => void;
  screenIds: string[];
  formFields: { name: string; type: string }[];
  version: string;
  allFormFields: { screenId: string; name: string; type: string }[];
  currentScreenId: string;
}) {
  const actionType = action?.name || "navigate";
  const nextScreen = action?.next?.name || "";
  const payload = action?.payload || {};
  const [showPayload, setShowPayload] = useState(Object.keys(payload).length > 0);

  const ver = parseFloat(version);

  const autoFillPayload = (mode: "current" | "all" = "current") => {
    const newPayload: Record<string, string> = {};

    if (mode === "all" && ver >= 4.0) {
      // v4.0+: collect from all screens with global refs
      allFormFields.forEach((f) => {
        newPayload[f.name] = `\${screen.${f.screenId}.form.${f.name}}`;
      });
    } else {
      // Current screen fields with ${form.field}
      formFields.forEach((f) => {
        newPayload[f.name] = `\${form.${f.name}}`;
      });
    }

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
              {/* Info banner for navigate on v4.0+ */}
              {actionType === "navigate" && ver >= 4.0 && (
                <div style={{ fontSize: "11px", color: "#15803d", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "8px 10px", borderRadius: "6px", lineHeight: "1.5" }}>
                  <strong>Flow v{version}:</strong> Data otomatis bisa diakses global. Payload bisa kosong <code style={{ background: "#dcfce7", padding: "1px 4px", borderRadius: "3px" }}>{"{}"}</code> karena screen tujuan bisa pakai <code style={{ background: "#dcfce7", padding: "1px 4px", borderRadius: "3px" }}>{`\${screen.SCREEN_NAME.form.field}`}</code>
                </div>
              )}

              {/* Info banner for complete action */}
              {actionType === "complete" && ver >= 4.0 && allFormFields.length > 0 && (
                <div style={{ fontSize: "11px", color: "#1e40af", background: "#eff6ff", border: "1px solid #bfdbfe", padding: "8px 10px", borderRadius: "6px", lineHeight: "1.5" }}>
                  <strong>Complete action</strong> mengirim semua data ke webhook. Gunakan &quot;Auto-fill semua screen&quot; untuk mengumpulkan field dari {allFormFields.length} field di semua screen dengan <code style={{ background: "#dbeafe", padding: "1px 4px", borderRadius: "3px" }}>{`\${screen.SCREEN.form.field}`}</code>
                </div>
              )}

              {/* Auto-fill buttons */}
              {actionType === "complete" && ver >= 4.0 && allFormFields.length > 0 && (
                <button
                  onClick={() => autoFillPayload("all")}
                  style={{
                    padding: "12px 16px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.3)";
                  }}
                >
                  ✨ Auto-fill semua screen ({allFormFields.length} fields)
                </button>
              )}
              {formFields.length > 0 && (
                <button
                  onClick={() => autoFillPayload("current")}
                  style={{
                    padding: "12px 16px",
                    background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: "0 2px 8px rgba(37, 211, 102, 0.3)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(37, 211, 102, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(37, 211, 102, 0.3)";
                  }}
                >
                  🎯 Auto-fill screen ini ({formFields.length} fields)
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
              {Object.keys(payload).length === 0 && !(actionType === "navigate" && ver >= 4.0) && (
                <div style={{ fontSize: "10px", color: "#9ca3af", background: "#fefce8", padding: "6px 8px", borderRadius: "6px", lineHeight: "1.4" }}>
                  {actionType === "complete" && ver >= 4.0
                    ? <>Payload kosong! Klik &quot;Auto-fill semua screen&quot; untuk mengumpulkan data dari semua screen, atau tambah manual dengan format: <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "3px" }}>{`\${screen.SCREEN_ID.form.field}`}</code></>
                    : <>Payload kosong = tidak ada data yang dikirim! Klik &quot;Auto-fill&quot; atau tambah manual dengan format: <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "3px" }}>{`\${form.nama_field}`}</code></>
                  }
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Screen Data Editor (for __example__ / dynamic references) ---
function ScreenDataEditor({
  data,
  onChange,
}: {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const entries = Object.entries(data || {});

  const addEntry = () => {
    const key = `new_field_${entries.length + 1}`;
    onChange({ ...data, [key]: { type: "string", __example__: "" } });
    setEditingKey(key);
    setExpanded(true);
  };

  const removeEntry = (key: string) => {
    const updated = { ...data };
    delete updated[key];
    onChange(updated);
    if (editingKey === key) setEditingKey(null);
  };

  const renameEntry = (oldKey: string, newKey: string) => {
    if (!newKey || newKey === oldKey || data[newKey]) return;
    const sanitized = newKey.replace(/[^a-zA-Z0-9_]/g, "_");
    const updated: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      updated[k === oldKey ? sanitized : k] = v;
    }
    onChange(updated);
    if (editingKey === oldKey) setEditingKey(sanitized);
  };

  const updateType = (key: string, type: string) => {
    const entry = data[key] || {};
    const updated = { ...entry, type };
    if (type === "array" && !updated.items) {
      updated.items = { type: "object", properties: { id: { type: "string" }, title: { type: "string" } } };
      if (!updated.__example__) updated.__example__ = [{ id: "1", title: "Example" }];
    }
    if (type === "string" && Array.isArray(updated.__example__)) {
      updated.__example__ = "";
      delete updated.items;
    }
    onChange({ ...data, [key]: updated });
  };

  const updateExample = (key: string, example: any) => {
    onChange({ ...data, [key]: { ...data[key], __example__: example } });
  };

  const inputSm: React.CSSProperties = {
    width: "100%", padding: "5px 7px", border: "1px solid #e5e7eb",
    borderRadius: "5px", fontSize: "11px", outline: "none", background: "#fff",
  };

  return (
    <div style={{ marginTop: "8px" }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "6px 0", background: "none", border: "none", cursor: "pointer",
          fontSize: "12px", fontWeight: 600, color: "#6b7280",
        }}
      >
        <span>Screen Data {entries.length > 0 && `(${entries.length})`}</span>
        <span style={{ fontSize: "10px" }}>{expanded ? "▾" : "▸"}</span>
      </button>
      {expanded && (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {entries.map(([key, entry]) => (
            <div key={key} style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px", background: editingKey === key ? "#fafafa" : "#fff" }}>
              {/* Header: key name + type + actions */}
              <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                <code style={{ fontSize: "11px", color: "#8b5cf6", flex: 1, cursor: "pointer" }} onClick={() => setEditingKey(editingKey === key ? null : key)}>
                  {key}
                </code>
                <span style={{ fontSize: "10px", color: "#9ca3af", background: "#f3f4f6", padding: "1px 5px", borderRadius: "3px" }}>
                  {entry.type || "string"}
                </span>
                <button onClick={() => setEditingKey(editingKey === key ? null : key)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "12px" }}>
                  {editingKey === key ? "▾" : "▸"}
                </button>
                <button onClick={() => removeEntry(key)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "2px" }}>
                  <X size={12} />
                </button>
              </div>
              {/* Expanded: edit key, type, __example__ */}
              {editingKey === key && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "6px", paddingTop: "6px", borderTop: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <input
                      defaultValue={key}
                      onBlur={(e) => renameEntry(key, e.target.value)}
                      placeholder="field_name"
                      style={{ ...inputSm, flex: 1, fontFamily: "monospace" }}
                    />
                    <select
                      value={entry.type || "string"}
                      onChange={(e) => updateType(key, e.target.value)}
                      style={{ ...inputSm, flex: 1 }}
                    >
                      <option value="string">string</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="array">array</option>
                      <option value="object">object</option>
                    </select>
                  </div>
                  {/* __example__ editor */}
                  <label style={{ fontSize: "10px", fontWeight: 500, color: "#6b7280" }}>__example__</label>
                  {(entry.type === "string" || entry.type === "number" || !entry.type) && (
                    <input
                      value={entry.__example__ ?? ""}
                      onChange={(e) => updateExample(key, entry.type === "number" ? Number(e.target.value) || 0 : e.target.value)}
                      placeholder="Example value"
                      type={entry.type === "number" ? "number" : "text"}
                      style={inputSm}
                    />
                  )}
                  {entry.type === "boolean" && (
                    <select value={String(entry.__example__ ?? "true")} onChange={(e) => updateExample(key, e.target.value === "true")} style={inputSm}>
                      <option value="true">true</option>
                      <option value="false">false</option>
                    </select>
                  )}
                  {entry.type === "array" && (
                    <ArrayExampleEditor
                      items={Array.isArray(entry.__example__) ? entry.__example__ : []}
                      properties={entry.items?.properties || {}}
                      onChange={(items) => updateExample(key, items)}
                    />
                  )}
                  <div style={{ fontSize: "10px", color: "#9ca3af" }}>
                    Ref: <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "3px" }}>{`\${data.${key}}`}</code>
                  </div>
                </div>
              )}
            </div>
          ))}
          <button
            onClick={addEntry}
            style={{ padding: "5px", background: "rgba(139,92,246,0.08)", border: "1px dashed #8b5cf6", borderRadius: "6px", color: "#8b5cf6", fontSize: "11px", cursor: "pointer", fontWeight: 500 }}
          >
            + Add Data Entry
          </button>
        </div>
      )}
    </div>
  );
}

// --- Array __example__ editor for screen data ---
function ArrayExampleEditor({
  items,
  properties,
  onChange,
}: {
  items: Record<string, any>[];
  properties: Record<string, any>;
  onChange: (items: Record<string, any>[]) => void;
}) {
  const propKeys = Object.keys(properties).length > 0 ? Object.keys(properties) : ["id", "title"];

  const addItem = () => {
    const newItem: Record<string, any> = {};
    propKeys.forEach((k) => { newItem[k] = ""; });
    onChange([...items, newItem]);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, value: string) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const inputSm: React.CSSProperties = {
    width: "100%", padding: "4px 6px", border: "1px solid #e5e7eb",
    borderRadius: "4px", fontSize: "10px", outline: "none", background: "#fff",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {/* Header row */}
      <div style={{ display: "flex", gap: "3px", paddingRight: "22px" }}>
        {propKeys.map((pk) => (
          <div key={pk} style={{ flex: 1, fontSize: "9px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>{pk}</div>
        ))}
      </div>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: "flex", gap: "3px", alignItems: "center" }}>
          {propKeys.map((pk) => (
            <input key={pk} value={item[pk] ?? ""} onChange={(e) => updateItem(idx, pk, e.target.value)} placeholder={pk} style={{ ...inputSm, flex: 1 }} />
          ))}
          <button onClick={() => removeItem(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "2px", flexShrink: 0 }}>
            <X size={10} />
          </button>
        </div>
      ))}
      <button onClick={addItem} style={{ padding: "3px", background: "none", border: "1px dashed #d1d5db", borderRadius: "4px", color: "#6b7280", fontSize: "10px", cursor: "pointer" }}>
        + Add Item
      </button>
    </div>
  );
}

// --- Name sanitizer ---
const INVALID_NAME_RE = /[^a-zA-Z0-9_\-]/;
const MAX_IMAGE_BYTES = 300 * 1024; // 300KB Meta's per-image limit
const MAX_JSON_BYTES = 10 * 1024 * 1024; // 10MB WhatsApp Flow JSON limit
function sanitizeName(name: string): string {
  return name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-]/g, "");
}

// --- Dynamic data reference picker ---
// Fields that support dynamic ${data.xxx} references
const DYNAMIC_TEXT_FIELDS = new Set(["label", "text", "description", "helper-text", "init-value", "error-message"]);
const DYNAMIC_BOOL_FIELDS = new Set(["visible", "required", "enabled"]);

function DataRefPicker({
  dataEntries,
  filterType,
  onSelect,
  currentValue,
}: {
  dataEntries: [string, any][];
  filterType: string | string[];
  onSelect: (ref: string) => void;
  currentValue?: any;
}) {
  const [open, setOpen] = useState(false);
  const types = Array.isArray(filterType) ? filterType : [filterType];
  const compatible = dataEntries.filter(([, entry]) => types.includes(entry.type || "string"));
  if (compatible.length === 0 && !open) return null;

  const isDynamic = typeof currentValue === "string" && currentValue.startsWith("${data.");

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen(!open)}
        title="Use dynamic data reference"
        style={{
          padding: "3px 5px",
          background: isDynamic ? "rgba(139,92,246,0.15)" : "none",
          border: `1px solid ${isDynamic ? "#8b5cf6" : "#d1d5db"}`,
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "10px",
          fontFamily: "monospace",
          color: isDynamic ? "#8b5cf6" : "#9ca3af",
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {"${}"}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "4px",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            zIndex: 50,
            minWidth: "180px",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "6px 8px", fontSize: "10px", color: "#6b7280", borderBottom: "1px solid #f3f4f6", fontWeight: 600 }}>
            Select data reference
          </div>
          {compatible.length === 0 ? (
            <div style={{ padding: "8px", fontSize: "11px", color: "#9ca3af" }}>
              No {types.join("/")} entries in Screen Data
            </div>
          ) : (
            compatible.map(([key, entry]) => (
              <button
                key={key}
                onClick={() => { onSelect(`\${data.${key}}`); setOpen(false); }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "6px 8px",
                  background: currentValue === `\${data.${key}}` ? "rgba(139,92,246,0.08)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: "12px",
                  color: "#374151",
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.background = "rgba(139,92,246,0.08)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.background = currentValue === `\${data.${key}}` ? "rgba(139,92,246,0.08)" : "transparent"; }}
              >
                <code style={{ color: "#8b5cf6", fontSize: "11px" }}>{key}</code>
                <span style={{ fontSize: "10px", color: "#9ca3af", marginLeft: "6px" }}>{entry.type}</span>
                {entry.__example__ !== undefined && (
                  <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    ex: {Array.isArray(entry.__example__) ? `[${entry.__example__.length} items]` : String(entry.__example__)}
                  </div>
                )}
              </button>
            ))
          )}
          {isDynamic && (
            <button
              onClick={() => { onSelect(""); setOpen(false); }}
              style={{
                display: "block", width: "100%", padding: "6px 8px",
                background: "transparent", border: "none", borderTop: "1px solid #f3f4f6",
                cursor: "pointer", textAlign: "left", fontSize: "11px", color: "#ef4444",
              }}
            >
              Clear dynamic reference
            </button>
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
  screenData,
  onChange,
  version,
  allFormFields,
  currentScreenId,
}: {
  component: FlowComponent;
  template: ComponentTemplate | undefined;
  screenIds: string[];
  formFields: { name: string; type: string }[];
  screenData?: Record<string, any>;
  onChange: (updated: FlowComponent) => void;
  version: string;
  allFormFields: { screenId: string; name: string; type: string }[];
  currentScreenId: string;
}) {
  if (!template) return null;

  const dataEntries = Object.entries(screenData || {});

  const updateField = (key: string, value: any) => {
    onChange({ ...component, [key]: value });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {template.editableFields.map((field) => {
        // Pattern field: only show for supported input-types
        const PATTERN_SUPPORTED_TYPES = new Set(["text", "number", "password", "passcode"]);
        if (field.key === "pattern" && component.type === "TextInput") {
          const inputType = component["input-type"] || "text";
          if (!PATTERN_SUPPORTED_TYPES.has(inputType)) return null;
        }

        if (field.type === "text") {
          const isNameField = field.key === "name";
          const isPatternField = field.key === "pattern" && component.type === "TextInput";
          const isLabelField = field.key === "label";
          const labelValue = isLabelField ? (component[field.key] || "") : "";
          const labelTooLong = isLabelField && (component.type === "TextInput" || component.type === "TextArea") && labelValue.length > 20;
          const nameValue = isNameField ? (component[field.key] || "") : "";
          const hasInvalidName = isNameField && nameValue && INVALID_NAME_RE.test(nameValue);
          const patternValue = isPatternField ? (component[field.key] || "") : "";
          const patternMissingHelper = isPatternField && patternValue && !component["helper-text"];
          const canBeDynamic = DYNAMIC_TEXT_FIELDS.has(field.key) && !isNameField && !isPatternField;
          const fieldIsDynamic = canBeDynamic && typeof component[field.key] === "string" && component[field.key]?.startsWith("${data.");
          return (
            <div key={field.key}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280" }}>
                  {field.label}
                  {isLabelField && (component.type === "TextInput" || component.type === "TextArea") && (
                    <span style={{
                      marginLeft: "6px",
                      fontSize: "10px",
                      color: labelTooLong ? "#ef4444" : "#9ca3af",
                      fontWeight: labelTooLong ? 600 : 400
                    }}>
                      ({labelValue.length}/20)
                    </span>
                  )}
                </label>
                {canBeDynamic && dataEntries.length > 0 && (
                  <DataRefPicker
                    dataEntries={dataEntries}
                    filterType="string"
                    currentValue={component[field.key]}
                    onSelect={(ref) => updateField(field.key, ref || "")}
                  />
                )}
              </div>
              {fieldIsDynamic ? (
                <div style={{
                  padding: "8px 10px", border: "1px solid #8b5cf6", borderRadius: "6px",
                  fontSize: "12px", fontFamily: "monospace", color: "#8b5cf6", background: "rgba(139,92,246,0.04)",
                }}>
                  {component[field.key]}
                </div>
              ) : (
                <input
                  value={component[field.key] || ""}
                  onChange={(e) => {
                    if (isNameField) {
                      updateField(field.key, e.target.value.replace(/\s/g, "_"));
                    } else if (isLabelField && (component.type === "TextInput" || component.type === "TextArea")) {
                      // Limit to 20 characters for TextInput and TextArea labels
                      const newValue = e.target.value.slice(0, 20);
                      updateField(field.key, newValue);
                    } else {
                      updateField(field.key, e.target.value);
                    }
                  }}
                  onBlur={() => {
                    if (isNameField && component[field.key]) {
                      updateField(field.key, sanitizeName(component[field.key]));
                    }
                  }}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: `1px solid ${hasInvalidName || patternMissingHelper || labelTooLong ? "#ef4444" : "#e5e7eb"}`,
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    background: "#fff",
                  }}
                />
              )}
              {hasInvalidName && (
                <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "3px" }}>
                  Gunakan huruf, angka, _ atau - saja (tanpa spasi)
                </div>
              )}
              {labelTooLong && (
                <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "3px" }}>
                  ⚠️ Label terlalu panjang! Meta membatasi label maksimal 20 karakter untuk menghindari truncation.
                </div>
              )}
              {isNameField && !hasInvalidName && nameValue && (
                <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>
                  Payload ref: <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "3px" }}>{`\${form.${nameValue}}`}</code>
                </div>
              )}
              {patternMissingHelper && (
                <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "3px" }}>
                  helper-text wajib diisi jika menggunakan pattern
                </div>
              )}
              {isPatternField && patternValue && (
                <div style={{ fontSize: "10px", color: "#9ca3af", marginTop: "2px" }}>
                  Raw regex (tanpa /.../) — contoh: <code style={{ background: "#f3f4f6", padding: "1px 4px", borderRadius: "3px" }}>^[0-9]{'{'}4{'}'}$</code>
                </div>
              )}
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
          const boolCanBeDynamic = DYNAMIC_BOOL_FIELDS.has(field.key);
          const boolIsDynamic = boolCanBeDynamic && typeof component[field.key] === "string" && component[field.key]?.startsWith("${data.");
          return (
            <div key={field.key} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {boolIsDynamic ? (
                <code style={{ fontSize: "11px", color: "#8b5cf6", background: "rgba(139,92,246,0.06)", padding: "2px 6px", borderRadius: "4px" }}>
                  {component[field.key]}
                </code>
              ) : (
                <input
                  type="checkbox"
                  checked={component[field.key] ?? (field.key === "visible" ? true : field.key === "enabled" ? true : false)}
                  onChange={(e) => updateField(field.key, e.target.checked)}
                  style={{ width: "16px", height: "16px", accentColor: "#8b5cf6" }}
                />
              )}
              <label style={{ fontSize: "13px", color: "#374151", flex: 1 }}>{field.label}</label>
              {boolCanBeDynamic && dataEntries.length > 0 && (
                <DataRefPicker
                  dataEntries={dataEntries}
                  filterType="boolean"
                  currentValue={component[field.key]}
                  onSelect={(ref) => updateField(field.key, ref || (field.key === "visible" || field.key === "enabled" ? true : false))}
                />
              )}
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
          const dsValue = component[field.key];
          const dsResolved = resolveDataSource(dsValue);
          const arrayEntries = dataEntries.filter(([, e]) => e.type === "array");
          return (
            <div key={field.key}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280" }}>
                  {field.label}
                </label>
                {dataEntries.length > 0 && (
                  <DataRefPicker
                    dataEntries={dataEntries}
                    filterType="array"
                    currentValue={dsValue}
                    onSelect={(ref) => updateField(field.key, ref || [{ id: "option_1", title: "Option 1" }])}
                  />
                )}
              </div>
              {dsResolved.isDynamic ? (
                <div>
                  <div style={{
                    padding: "8px 10px", border: "1px solid #8b5cf6", borderRadius: "6px",
                    fontSize: "12px", fontFamily: "monospace", color: "#8b5cf6", background: "rgba(139,92,246,0.04)",
                  }}>
                    {dsValue}
                  </div>
                  {arrayEntries.length === 0 && (
                    <div style={{ fontSize: "10px", color: "#f59e0b", marginTop: "3px" }}>
                      No array entries in Screen Data. Add one via Screen Data panel.
                    </div>
                  )}
                  <button
                    onClick={() => updateField(field.key, [{ id: "option_1", title: "Option 1" }])}
                    style={{
                      marginTop: "4px",
                      padding: "4px 8px",
                      background: "rgba(139, 92, 246, 0.1)",
                      border: "1px solid #8b5cf6",
                      borderRadius: "4px",
                      color: "#8b5cf6",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Switch to static options
                  </button>
                </div>
              ) : (
                <div>
                  <OptionsEditor
                    options={Array.isArray(dsValue) ? dsValue : []}
                    onChange={(opts) => updateField(field.key, opts)}
                  />
                </div>
              )}
            </div>
          );
        }
        if (field.type === "image-upload") {
          const imgVal = component[field.key] || "";
          const imgPreview = imgVal ? resolveImageSrc(imgVal) : "";
          return (
            <div key={field.key}>
              <label style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", marginBottom: "4px", display: "block" }}>
                {field.label}
              </label>
              {imgPreview && (
                <img src={imgPreview} alt="Preview" style={{ width: "100%", maxHeight: "120px", objectFit: "contain", borderRadius: "6px", marginBottom: "6px", background: "#f9fafb" }} />
              )}
              <div style={{ display: "flex", gap: "4px" }}>
                <label style={{
                  flex: 1, padding: "8px", background: "#f3f4f6", border: "1px dashed #d1d5db",
                  borderRadius: "6px", fontSize: "12px", color: "#6b7280", cursor: "pointer",
                  textAlign: "center", fontWeight: 500,
                }}>
                  {imgVal ? "Change Image" : "Upload Image"}
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    readFileAsBase64(file).then((base64) => {
                      updateField(field.key, base64);
                    }).catch(() => alert("Failed to process image"));
                  }} />
                </label>
                {imgVal && (
                  <button onClick={() => updateField(field.key, "")} style={{
                    padding: "8px 12px", background: "none", border: "1px solid #fca5a5",
                    borderRadius: "6px", color: "#ef4444", fontSize: "11px", cursor: "pointer",
                  }}>
                    Remove
                  </button>
                )}
              </div>
              {imgVal && (() => {
                const sizeKB = getBase64SizeKB(imgVal);
                const overLimit = sizeKB > MAX_IMAGE_BYTES / 1024;
                return (
                  <div style={{ fontSize: "10px", color: overLimit ? "#dc2626" : "#9ca3af", marginTop: "3px" }}>
                    {sizeKB}KB {overLimit ? "(exceeds Meta 300KB limit!)" : ""}
                  </div>
                );
              })()}
            </div>
          );
        }
        if (field.type === "image-carousel") {
          const imagesVal = component[field.key];
          const imagesIsDynamic = typeof imagesVal === "string" && imagesVal.startsWith("${data.");
          const imagesList: { src: string; "alt-text": string }[] = Array.isArray(imagesVal) ? imagesVal : [];

          const updateImage = (idx: number, updates: Record<string, any>) => {
            const updated = [...imagesList];
            updated[idx] = { ...updated[idx], ...updates };
            updateField(field.key, updated);
          };
          const addImage = () => {
            if (imagesList.length >= 3) return;
            updateField(field.key, [...imagesList, { src: "", "alt-text": `Image ${imagesList.length + 1}` }]);
          };
          const removeImage = (idx: number) => {
            updateField(field.key, imagesList.filter((_, i) => i !== idx));
          };
          const handleImgUpload = (idx: number, file: File) => {
            readFileAsBase64(file).then((base64) => {
              updateImage(idx, { src: base64 });
            }).catch(() => alert("Failed to process image"));
          };

          return (
            <div key={field.key}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <label style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280" }}>
                  {field.label} {!imagesIsDynamic && `(${imagesList.length}/3)`}
                </label>
                {dataEntries.length > 0 && (
                  <DataRefPicker
                    dataEntries={dataEntries}
                    filterType="array"
                    currentValue={imagesVal}
                    onSelect={(ref) => updateField(field.key, ref || [{ src: "", "alt-text": "Image 1" }])}
                  />
                )}
              </div>
              {imagesIsDynamic ? (
                <div>
                  <div style={{
                    padding: "8px 10px", border: "1px solid #8b5cf6", borderRadius: "6px",
                    fontSize: "12px", fontFamily: "monospace", color: "#8b5cf6", background: "rgba(139,92,246,0.04)",
                  }}>
                    {imagesVal}
                  </div>
                  <button
                    onClick={() => updateField(field.key, [{ src: "", "alt-text": "Image 1" }])}
                    style={{ marginTop: "4px", padding: "4px 8px", background: "rgba(139,92,246,0.1)", border: "1px solid #8b5cf6", borderRadius: "4px", color: "#8b5cf6", fontSize: "11px", cursor: "pointer" }}
                  >
                    Switch to static images
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {imagesList.map((img, idx) => {
                    const preview = img.src ? resolveImageSrc(img.src) : "";
                    return (
                      <div key={idx} style={{ border: "1px solid #e5e7eb", borderRadius: "6px", padding: "6px", background: "#fafafa" }}>
                        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                          {preview ? (
                            <img src={preview} alt="" style={{ width: "48px", height: "36px", objectFit: "cover", borderRadius: "4px", flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: "48px", height: "36px", background: "#f3f4f6", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Images size={16} color="#9ca3af" />
                            </div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <input
                              value={img["alt-text"] || ""}
                              onChange={(e) => updateImage(idx, { "alt-text": e.target.value })}
                              placeholder="Alt text"
                              style={{ width: "100%", padding: "4px 6px", border: "1px solid #e5e7eb", borderRadius: "4px", fontSize: "11px", outline: "none" }}
                            />
                          </div>
                          <button onClick={() => removeImage(idx)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "2px" }}>
                            <X size={14} />
                          </button>
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          <label style={{
                            display: "block", padding: "6px", background: "#f3f4f6", border: "1px dashed #d1d5db",
                            borderRadius: "4px", fontSize: "11px", color: "#6b7280", cursor: "pointer", textAlign: "center",
                          }}>
                            {img.src ? "Change" : "Upload Image"}
                            <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleImgUpload(idx, e.target.files[0])} />
                          </label>
                        </div>
                        {img.src && (() => {
                          const sizeKB = getBase64SizeKB(img.src);
                          const overLimit = sizeKB > MAX_IMAGE_BYTES / 1024;
                          return (
                            <div style={{ fontSize: "10px", color: overLimit ? "#dc2626" : "#9ca3af", marginTop: "2px" }}>
                              {sizeKB}KB {overLimit ? "(exceeds Meta 300KB limit!)" : ""}
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })}
                  {imagesList.length < 3 && (
                    <button onClick={addImage} style={{
                      padding: "6px", background: "rgba(16,185,129,0.1)", border: "1px dashed #10b981",
                      borderRadius: "6px", color: "#10b981", fontSize: "12px", cursor: "pointer", fontWeight: 500,
                    }}>
                      + Add Image
                    </button>
                  )}
                </div>
              )}
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
                version={version}
                allFormFields={allFormFields}
                currentScreenId={currentScreenId}
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
                screenIds={screenIds}
                formFields={formFields}
                version={version}
                allFormFields={allFormFields}
                currentScreenId={currentScreenId}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

// --- Validation Panel ---
function ValidationPanel({ errors, onClose, onAutoFix }: { errors: string[]; onClose: () => void; onAutoFix: () => void }) {
  const dataModelErrors = errors.filter((e) => e.includes("data model") || e.includes("${data.") || e.includes("data_api_version"));
  const otherErrors = errors.filter((e) => !e.includes("data model") && !e.includes("${data.") && !e.includes("data_api_version"));

  return (
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
          {errors.length} Validation Error{errors.length > 1 ? "s" : ""}
        </span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <X size={14} color="#dc2626" />
        </button>
      </div>
      {dataModelErrors.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", marginBottom: "2px" }}>
          <span style={{ fontSize: "12px", color: "#1e40af", flex: 1 }}>
            {dataModelErrors.length} masalah Data Model
          </span>
          <button
            onClick={onAutoFix}
            style={{
              padding: "4px 10px",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Auto-fix Data Model
          </button>
        </div>
      )}
      {otherErrors.map((err, i) => (
        <div key={`o${i}`} style={{ fontSize: "12px", color: "#b91c1c" }}>
          - {err}
        </div>
      ))}
      {dataModelErrors.map((err, i) => (
        <div key={`d${i}`} style={{ fontSize: "12px", color: "#6b7280" }}>
          - {err}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export function WAJsonBuilder() {
  // Flow state
  const [version, setVersion] = useState("7.3");
  const [dataApiVersion, setDataApiVersion] = useState<string | undefined>(undefined);
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
  const jsonSizeBytes = useMemo(() => new Blob([jsonString]).size, [jsonString]);

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
        parsed.screens.map((s: any) => {
          // Flatten Form wrappers: extract Form.children into the flat list
          const rawChildren: any[] = s.layout?.children || [];
          const flatChildren: any[] = [];
          let formMeta: { name?: string; "init-values"?: Record<string, any> } | null = null;
          for (const c of rawChildren) {
            if (c.type === "Form" && Array.isArray(c.children)) {
              // Sanitize init-values keys too
              const rawInitValues = c["init-values"] || {};
              const cleanInitValues: Record<string, any> = {};
              for (const [k, v] of Object.entries(rawInitValues)) {
                cleanInitValues[sanitizeName(k)] = v;
              }
              formMeta = { name: c.name, "init-values": cleanInitValues };
              for (const fc of c.children) {
                const sanitized = { ...fc, _id: generateId() };
                if (sanitized.name) sanitized.name = sanitizeName(sanitized.name);
                flatChildren.push(sanitized);
              }
            } else {
              const sanitized = { ...c, _id: generateId() };
              if (sanitized.name) sanitized.name = sanitizeName(sanitized.name);
              flatChildren.push(sanitized);
            }
          }
          return {
            ...s,
            _key: generateId(),
            _formMeta: formMeta,
            layout: { ...s.layout, children: flatChildren },
          };
        })
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

    // Check if flow uses data_exchange and requires data_api_version
    const hasDataExchange = screens.some(s =>
      s.layout.children.some(c => {
        const actions = [c["on-click-action"], c["on-select-action"]];
        if (c.type === "NavigationList" && Array.isArray(c["list-items"])) {
          (c["list-items"] as any[]).forEach(item => actions.push(item["on-click-action"]));
        }
        return actions.some(a => a?.name === "data_exchange");
      })
    );

    if (hasDataExchange && !dataApiVersion) {
      errors.push("Flow uses data_exchange action but missing root-level \"data_api_version\" property. Click Auto-fix to add it.");
    }

    const ids = screens.map((s) => s.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) errors.push("Screen IDs must be unique");

    // Track connected screens
    const connectedScreens = new Set<string>();
    if (screens.length > 0) connectedScreens.add(screens[0].id); // First screen is always reachable

    const flowVer = parseFloat(version);

    screens.forEach((s) => {
      if (!s.id) errors.push(`Screen is missing an ID`);
      if (s.id === "SUCCESS") errors.push(`"SUCCESS" is a reserved screen ID`);
      if (s.layout.children.length === 0) errors.push(`Screen "${s.id}" has no components`);

      // Check NavigationList presence
      const navListComps = s.layout.children.filter((c) => c.type === "NavigationList");
      const hasNavList = navListComps.length > 0;

      // Check Footer count — NavigationList screens don't need a Footer
      const footerCount = s.layout.children.filter((c) => c.type === "Footer").length;
      if (footerCount > 1) errors.push(`Screen "${s.id}" has ${footerCount} Footers (max 1 allowed)`);
      if (footerCount === 0 && !hasNavList) errors.push(`Screen "${s.id}" must have a Footer component`);

      // Check TextInput and TextArea label length (Meta requirement: max 20 chars)
      s.layout.children.forEach((c) => {
        if ((c.type === "TextInput" || c.type === "TextArea") && c.label && c.label.length > 20) {
          errors.push(`Screen "${s.id}" → ${c.type} "${c.name || 'unnamed'}" label is ${c.label.length} characters (max 20). Shorten to avoid truncation.`);
        }
      });

      // RichText restriction: can only be alone or with Footer
      const hasRichText = s.layout.children.some((c) => c.type === "RichText");
      if (hasRichText) {
        const nonFooterNonRichText = s.layout.children.filter((c) => c.type !== "RichText" && c.type !== "Footer");
        if (nonFooterNonRichText.length > 0) {
          errors.push(`Screen "${s.id}": RichText can only be paired with Footer. Remove ${nonFooterNonRichText.map((c) => c.type).join(", ")} or move RichText to its own screen`);
        }
      }

      // NavigationList validations
      if (hasNavList) {
        const navLists = s.layout.children.filter((c) => c.type === "NavigationList");
        if (s.terminal) {
          errors.push(`Screen "${s.id}": NavigationList cannot be used on a terminal screen`);
        }
        if (s.id !== "TERMINAL" && navLists.length > 2) {
          errors.push(`Screen "${s.id}" has ${navLists.length} NavigationLists (max 2)`);
        }
        // Check if NavigationList is mixed with other interactive components (Form pattern)
        // Meta rule: NavigationList should generally be the main content. 
        // We simply warn if there are many other input components.
        const otherInputs = s.layout.children.filter(c => c.type !== "NavigationList" && c.type !== "Footer" && c.type !== "TextHeading" && c.type !== "TextBody" && c.type !== "Image");
        if (otherInputs.length > 0) {
          // This is a soft warning or strict error? Meta says "Please remove other components".
          // We'll add an error.
          errors.push(`Screen "${s.id}" contains NavigationList mixed with other input components (${otherInputs.map(c => c.type).join(", ")}). NavigationList screens should be dedicated menus.`);
        }

        navLists.forEach((nl, idx) => {
          const nlLabel = nl.name || `NavigationList #${idx + 1}`;
          if (!nl.name) {
            errors.push(`Screen "${s.id}" → NavigationList #${idx + 1}: Missing "name" property (Required)`);
          }

          // Strict Action Check: Cannot have on-click-action on BOTH list and items
          if (nl["on-click-action"] && nl["list-items"]?.some((item: any) => item["on-click-action"])) {
            errors.push(`Screen "${s.id}" → ${nlLabel}: Conflicting actions. You have an action on the NavigationList itself AND on individual items. Remove one.`);
          }

          if (Array.isArray(nl["list-items"])) {
            const listItems = nl["list-items"];
            if (Array.isArray(listItems)) {
              if (listItems.length < 1) {
                errors.push(`Screen "${s.id}" → ${nlLabel}: list-items must have at least 1 item`);
              }
              if (listItems.length > 20) {
                errors.push(`Screen "${s.id}" → ${nlLabel}: list-items has ${listItems.length} items (max 20)`);
              }
              // Check if action is on both component-level AND item-level
              const hasComponentAction = nl["on-click-action"]?.name === "navigate";
              const hasItemActions = listItems.some((item: any) => item["on-click-action"]?.name === "navigate");
              if (hasComponentAction && hasItemActions) {
                errors.push(`Screen "${s.id}" → ${nlLabel}: Cannot have navigate action on both component-level AND individual items`);
              }
              // Only 1 item can have badge
              const badgeItems = listItems.filter((item: any) => item.badge);
              if (badgeItems.length > 1) {
                errors.push(`Screen "${s.id}" → ${nlLabel}: Only 1 item can have a badge (found ${badgeItems.length})`);
              }
              // Validate per-item navigate actions
              listItems.forEach((item: any, idx: number) => {
                const itemAction = item["on-click-action"];
                if (itemAction?.name === "navigate") {
                  const target = itemAction.next?.name;
                  if (!target) {
                    errors.push(`Screen "${s.id}" → ${nlLabel} item ${idx + 1}: Navigate action has no target screen`);
                  } else if (!uniqueIds.has(target)) {
                    errors.push(`Screen "${s.id}" → ${nlLabel} item ${idx + 1}: Navigate to unknown screen "${target}"`);
                  } else {
                    connectedScreens.add(target);
                    // Validate per-item navigate payload vs target data model
                    const targetScr = screens.find((ts) => ts.id === target);
                    const itemPayloadKeys = Object.keys(itemAction.payload || {});
                    const itemPayloadNonEmpty = itemPayloadKeys.length > 0;

                    // Check: payload sends data but target has NO data model
                    if (itemPayloadNonEmpty && targetScr && (!targetScr.data || Object.keys(targetScr.data).length === 0)) {
                      errors.push(`Screen "${s.id}" → ${nlLabel} item ${idx + 1}: Navigate to "${target}" mengirim payload [${itemPayloadKeys.join(", ")}] tapi screen "${target}" tidak punya data model. Tambahkan data model di screen tujuan, atau kosongkan payload`);
                    }

                    // Check: payload references ${data.xxx} but current screen has no matching data model
                    const currentDataKeys = new Set(Object.keys(s.data || {}));
                    itemPayloadKeys.forEach((pk) => {
                      const pVal = (itemAction.payload || {})[pk] as string;
                      const dataMatch = pVal?.match(/^\$\{data\.(.+)\}$/);
                      if (dataMatch && !currentDataKeys.has(dataMatch[1])) {
                        errors.push(`Screen "${s.id}" → ${nlLabel} item ${idx + 1}: Payload references "\${data.${dataMatch[1]}}" tapi "${dataMatch[1]}" tidak ada di data model screen "${s.id}". Tambahkan data model atau gunakan \${screen.SCREEN_ID.form.${dataMatch[1]}} (v4.0+)`);
                      }
                    });

                    if (targetScr?.data) {
                      const expectedFields = Object.keys(targetScr.data);
                      const missing = expectedFields.filter((f) => !itemPayloadKeys.includes(f));
                      if (missing.length > 0) {
                        if (flowVer >= 4.0) {
                          errors.push(`Screen "${s.id}" → ${nlLabel} item ${idx + 1}: Navigate to "${target}" — payload missing [${missing.join(", ")}]. Tip v4.0+: Hapus "data" di screen "${target}" jika field-nya form field, dan pakai \${screen.*.form.*} langsung`);
                        } else {
                          errors.push(`Screen "${s.id}" → ${nlLabel} item ${idx + 1}: Navigate to "${target}" — payload missing [${missing.join(", ")}] dari data model`);
                        }
                      }
                    }
                  }
                }
              });
            }
          }
        });
      }

      // Max 3 images per screen
      const imageCount = s.layout.children.filter((c) => c.type === "Image").length;
      if (imageCount > 3) errors.push(`Screen "${s.id}" has ${imageCount} Images (max 3 allowed)`);

      // ImageCarousel: max 2 per screen, each must have 1-3 images (static)
      const carouselComps = s.layout.children.filter((c) => c.type === "ImageCarousel");
      if (carouselComps.length > 2) {
        errors.push(`Screen "${s.id}" has ${carouselComps.length} ImageCarousels (max 2 per screen)`);
      }
      carouselComps.forEach((c, ci) => {
        const imgs = c.images;
        if (Array.isArray(imgs)) {
          if (imgs.length < 1) errors.push(`Screen "${s.id}" → ImageCarousel #${ci + 1}: Must have at least 1 image`);
          if (imgs.length > 3) errors.push(`Screen "${s.id}" → ImageCarousel #${ci + 1}: Has ${imgs.length} images (max 3)`);
        }
      });

      if (s.layout.children.length > 50) errors.push(`Screen "${s.id}" exceeds 50 component limit`);

      // Check component names uniqueness and format
      const names = new Set<string>();
      s.layout.children.forEach((c) => {
        if (c.name) {
          if (names.has(c.name)) errors.push(`Duplicate component name "${c.name}" in screen "${s.id}"`);
          if (INVALID_NAME_RE.test(c.name)) {
            errors.push(`Screen "${s.id}" → ${c.type}: Name "${c.name}" contains invalid characters (spaces/special chars). Use only letters, numbers, _ or -`);
          }
          names.add(c.name);
        }

        // Validate pattern usage on TextInput
        if (c.type === "TextInput" && c.pattern) {
          const patternSupportedTypes = new Set(["text", "number", "password", "passcode"]);
          const inputType = c["input-type"] || "text";
          if (!patternSupportedTypes.has(inputType)) {
            errors.push(`Screen "${s.id}" → TextInput "${c.name || c.label}": Pattern is not supported for input-type "${inputType}". Only text, number, password, passcode are supported`);
          }
          if (!c["helper-text"]) {
            errors.push(`Screen "${s.id}" → TextInput "${c.name || c.label}": helper-text is required when using pattern`);
          }
        }

        // Validate data-source options (CheckboxGroup, RadioButtonsGroup, ChipsSelector, Dropdown)
        if (Array.isArray(c["data-source"])) {
          const opts = c["data-source"];
          const compLabel = c.name || c.label || c.type;
          if (opts.length < 1) {
            errors.push(`Screen "${s.id}" → ${c.type} "${compLabel}": data-source must have at least 1 option`);
          }
          if (opts.length > 20) {
            errors.push(`Screen "${s.id}" → ${c.type} "${compLabel}": data-source has ${opts.length} options (max 20)`);
          }
          opts.forEach((opt: any, oi: number) => {
            if (opt.title && opt.title.length > 30) {
              errors.push(`Screen "${s.id}" → ${c.type} "${compLabel}": Option ${oi + 1} title exceeds 30 chars (${opt.title.length})`);
            }
            if (opt.description && opt.description.length > 300) {
              errors.push(`Screen "${s.id}" → ${c.type} "${compLabel}": Option ${oi + 1} description exceeds 300 chars (${opt.description.length})`);
            }
            if (opt.metadata && opt.metadata.length > 20) {
              errors.push(`Screen "${s.id}" → ${c.type} "${compLabel}": Option ${oi + 1} metadata exceeds 20 chars (${opt.metadata.length})`);
            }
          });
        }

        // Validate dynamic ${data.xxx} references exist in screen data
        const screenDataKeys = new Set(Object.keys(s.data || {}));
        const checkDynRef = (val: any, context: string) => {
          if (typeof val === "string") {
            const dataRefs = val.matchAll(/\$\{data\.([^}]+)\}/g);
            for (const match of dataRefs) {
              const fullKey = match[1];
              const rootKey = fullKey.split(".")[0].split("[")[0];
              if (!screenDataKeys.has(rootKey)) {
                errors.push(`Screen "${s.id}" → ${context}: References "\${data.${fullKey}}" but root key "${rootKey}" is not defined in Screen Data`);
              }
            }
          } else if (typeof val === "object" && val !== null) {
            Object.entries(val).forEach(([k, v]) => {
              checkDynRef(v, `${context}.${k}`);
            });
          }
        };

        // Helper to validate an action (navigate, complete, data_exchange)
        const validateAction = (action: any, contextStr: string, sourceComp: any) => {
          if (!action) return;

          if (action.name === "navigate") {
            const targetScreen = action.next?.name;
            if (!targetScreen) {
              errors.push(`${contextStr}: Navigate action has no target screen`);
            } else if (!action.next.type) {
              errors.push(`${contextStr}: Navigate action "next" missing "type: screen"`);
            } else if (!uniqueIds.has(targetScreen)) {
              errors.push(`${contextStr}: Navigate to unknown screen "${targetScreen}"`);
            } else {
              connectedScreens.add(targetScreen);
              const targetScr = screens.find((ts) => ts.id === targetScreen);
              const payloadKeys = Object.keys(action.payload || {});
              const payloadNonEmpty = payloadKeys.length > 0;

              if (payloadNonEmpty && targetScr && (!targetScr.data || Object.keys(targetScr.data).length === 0)) {
                errors.push(`${contextStr}: Navigate to "${targetScreen}" sends payload [${payloadKeys.join(", ")}] but target has no data model. Add data model to target or empty payload.`);
              }

              const currentScreenDataKeys = new Set(Object.keys(s.data || {}));
              payloadKeys.forEach((pk) => {
                const payloadVal = (action.payload || {})[pk];
                if (typeof payloadVal === "string") {
                  const dataMatch = payloadVal.match(/^\$\{data\.(.+)\}$/);
                  if (dataMatch && !currentScreenDataKeys.has(dataMatch[1])) {
                    errors.push(`${contextStr}: Payload references "\${data.${dataMatch[1]}}" but "${dataMatch[1]}" is not in screen data model. Add it or use \${screen.ID.form...}`);
                  }
                }
              });

              if (targetScr?.data) {
                const expectedFields = Object.keys(targetScr.data);
                const missing = expectedFields.filter((f) => !payloadKeys.includes(f));
                if (missing.length > 0) {
                  if (flowVer >= 4.0) {
                    errors.push(`${contextStr}: Navigate to "${targetScreen}" — payload missing [${missing.join(", ")}]. Tip v4.0+: Remove "data" in target screen if referencing form fields directly.`);
                  } else {
                    errors.push(`${contextStr}: Navigate to "${targetScreen}\" — payload missing [${missing.join(", ")}] required by target data model.`);
                  }
                }

                payloadKeys.forEach((pk) => {
                  const payloadVal = (action.payload || {})[pk];
                  if (typeof payloadVal === "string") {
                    const formMatch = payloadVal.match(/^\$\{form\.(.+)\}$/);
                    if (formMatch) {
                      const sourceFieldName = formMatch[1];
                      const sourceCompRef = s.layout.children.find((comp) => comp.name === sourceFieldName);
                      const targetType = targetScr.data?.[pk]?.type;
                      if (sourceCompRef && targetType) {
                        const inputType = sourceCompRef["input-type"] || "text";
                        const isNumberInput = inputType === "number";
                        const isStringTarget = targetType === "string";
                        if (isNumberInput && isStringTarget) {
                          errors.push(`${contextStr}: Field "${sourceFieldName}" is number but target data "${pk}" is string. Mismatch.`);
                        }
                        if (!isNumberInput && targetType === "number") {
                          errors.push(`${contextStr}: Field "${sourceFieldName}" is ${inputType} but target data "${pk}" is number. Mismatch.`);
                        }
                      }
                    }
                  }
                });
              }
            }
          }

          if (action.name === "complete") {
            if (!s.terminal) {
              errors.push(`${contextStr}: "complete" action allowed only on Terminal screens.`);
            }
            if (sourceComp.type === "Footer") {
              const payload = action.payload;
              if (!payload || Object.keys(payload).length === 0) {
                const allFieldsCount = screens.reduce((count, scr) => {
                  return count + scr.layout.children.filter((comp) => comp.name && comp.type !== "Footer" && comp.type !== "NavigationList").length;
                }, 0);
                if (allFieldsCount > 0) {
                  errors.push(`${contextStr}: Complete action has empty payload. Click "Auto-fill" to collect data.`);
                }
              }
            }
          }

          // Note: data_api_version is a root-level property, not action-level
          // Validation for data_exchange actions is done at flow level

          if (action.payload && action.name !== "navigate") {
            Object.entries(action.payload).forEach(([pk, pv]) => {
              checkDynRef(pv, `${contextStr} payload.${pk}`);
            });
          }
        };

        s.layout.children.forEach((c) => {
          const label = c.name || c.label || c.type;
          checkDynRef(c.label, `${c.type} "${label}" label`);
          checkDynRef(c.text, `${c.type} "${label}" text`);
          checkDynRef(c.description, `${c.type} "${label}" description`);

          if (Array.isArray(c["data-source"])) {
            c["data-source"].forEach((item: any, idx: number) => {
              Object.entries(item).forEach(([k, v]) => {
                checkDynRef(v, `${c.type} "${label}" data-source[${idx}].${k}`);
              });
            });
          } else {
            checkDynRef(c["data-source"], `${c.type} "${label}" data-source`);
          }

          checkDynRef(c["helper-text"], `${c.type} "${label}" helper-text`);
          checkDynRef(c["init-value"], `${c.type} "${label}" init-value`);

          // Validate Main Action
          validateAction(c["on-click-action"], `Screen "${s.id}" → ${c.type}`, c);
          validateAction(c["on-select-action"], `Screen "${s.id}" → ${c.type}`, c);

          // Validate NavigationList Items
          if (c.type === "NavigationList" && Array.isArray(c["list-items"])) {
            (c["list-items"] as any[]).forEach((item, idx) => {
              validateAction(item["on-click-action"], `Screen "${s.id}" → ${c.type} Item ${idx + 1}`, c);
            });
          }

          // Check for Footer on Terminal screens
          if (s.terminal) {
            const hasFooter = s.layout.children.some(ch => ch.type === "Footer");
            if (!hasFooter) {
              errors.push(`Screen "${s.id}" is a Terminal screen but missing a Footer component.`);
            }
          }
        });

      });
    });

    // Max 3 ImageCarousel per flow
    const totalCarousels = screens.reduce((sum, s) => sum + s.layout.children.filter((c) => c.type === "ImageCarousel").length, 0);
    if (totalCarousels > 3) {
      errors.push(`Flow has ${totalCarousels} ImageCarousels total (max 3 per flow)`);
    }

    // Check JSON size (10MB limit)
    if (jsonSizeBytes > MAX_JSON_BYTES) {
      const overBy = ((jsonSizeBytes - MAX_JSON_BYTES) / 1024).toFixed(0);
      errors.push(`Flow JSON size (${(jsonSizeBytes / (1024 * 1024)).toFixed(2)}MB) exceeds 10MB limit by ${overBy}KB. Reduce image sizes or remove images.`);
    } else if (jsonSizeBytes > MAX_JSON_BYTES * 0.8) {
      errors.push(`Warning: Flow JSON size is ${(jsonSizeBytes / (1024 * 1024)).toFixed(2)}MB (approaching 10MB limit)`);
    }

    // Check for unconnected screens (Reachability Check)
    // improved: BFS from first screen (entry point)
    const reachable = new Set<string>();
    if (screens.length > 0) {
      const queue = [screens[0].id];
      reachable.add(screens[0].id);

      // Helper to collect targets from a component
      const collectTargets = (c: any): string[] => {
        const targets: string[] = [];
        const actions = [c["on-click-action"], c["on-select-action"]];
        if (c.type === "NavigationList" && Array.isArray(c["list-items"])) {
          (c["list-items"] as any[]).forEach((item: any) => actions.push(item["on-click-action"]));
        }
        actions.forEach(a => {
          if (a?.name === "navigate" && a.next?.name) {
            targets.push(a.next.name);
          }
        });
        return targets;
      };

      let head = 0;
      while (head < queue.length) {
        const currId = queue[head++];
        const currScreen = screens.find(s => s.id === currId);
        if (!currScreen) continue;

        currScreen.layout.children.forEach(c => {
          const targets = collectTargets(c);
          targets.forEach(tId => {
            if (!reachable.has(tId)) {
              reachable.add(tId);
              queue.push(tId);
            }
          });
        });
      }

      screens.forEach((s) => {
        if (!reachable.has(s.id)) {
          errors.push(`Screen "${s.id}" is orphaned (not reachable from the start screen "${screens[0].id}")`);
        }
      });
    }

    // Global Payload Completeness Check (Meta Requirement)
    // For every screen S that requires data D, check all incoming edges (navigate actions to S).
    // If any edge does NOT provide D (and D is required), flag error on the SOURCE screen.
    screens.forEach(targetScreen => {
      if (!targetScreen.data || Object.keys(targetScreen.data).length === 0) return;
      const requiredFields = Object.keys(targetScreen.data);

      screens.forEach((sourceScreen) => {
        sourceScreen.layout.children.forEach(comp => {
          const actions = [comp["on-click-action"], comp["on-select-action"]];
          if (comp.type === "NavigationList" && Array.isArray(comp["list-items"])) {
            (comp["list-items"] as any[]).forEach(item => actions.push(item["on-click-action"]));
          }

          actions.forEach(action => {
            if (action?.name === "navigate" && action.next?.name === targetScreen.id) {
              const payload = action.payload || {};
              const providedKeys = Object.keys(payload);
              const missing = requiredFields.filter(f => !providedKeys.includes(f));

              if (missing.length > 0) {
                // Check version: v4.0+ allows referencing form fields directly without passing in payload
                // But strict mode or older versions require it.
                // We'll enforce it for now to be safe, or check if flow version < 4.0
                if (flowVer < 4.0) {
                  errors.push(`Screen "${sourceScreen.id}" → navigate to "${targetScreen.id}" missing payload fields: [${missing.join(", ")}]. Target screen requires these fields.`);
                } else {
                  // v4.0+: It's okay IF the data is not needed OR referenced via ${screen.X.form.Y}
                  // warning only?
                }
              }
            }
          });
        });
      });
    });

    setValidationErrors(errors);
  }, [screens, jsonSizeBytes, version, dataApiVersion]);

  // CRITICAL: Actually call validate when dependencies change
  useEffect(() => {
    validate();
  }, [validate]);

  // Auto-sync data models: ensure screens have data models matching incoming payloads
  const syncDataModels = useCallback(() => {
    let changed = false;
    const updated = screens.map((s) => ({ ...s }));

    // Build map: targetScreenId → { fieldName → { type, __example__ } }
    const dataNeeds: Record<string, Record<string, { type: string; __example__: string }>> = {};



    screens.forEach((srcScreen) => {
      // Helper to process actions and infer types
      const processActionWithScreen = (action: any) => {
        if (action?.name !== "navigate" || !action.next?.name) return;
        const targetId = action.next.name;
        const payload = action.payload || {};
        const payloadKeys = Object.keys(payload);
        if (payloadKeys.length === 0) return;

        if (!dataNeeds[targetId]) dataNeeds[targetId] = {};

        Object.entries(payload).forEach(([key, val]) => {
          if (dataNeeds[targetId][key]) return; // already defined

          let type = "string";
          let example = "";

          // 1. Check if value is ${form.xxx} and infer from source component
          if (typeof val === "string") {
            const formMatch = val.match(/^\$\{form\.(.+)\}$/);
            if (formMatch) {
              const sourceFieldName = formMatch[1];
              const sourceComp = srcScreen.layout.children.find(c => c.name === sourceFieldName);
              if (sourceComp && sourceComp["input-type"] === "number") {
                type = "number";
                example = "123";
              }
            }
          }

          // 2. Fallback to value type inspection (for static values)
          if (type === "string") {
            if (typeof val === "number") {
              type = "number";
              example = String(val);
            } else if (typeof val === "boolean") {
              type = "boolean";
              example = String(val);
            } else if (Array.isArray(val)) {
              type = "array";
              example = "[]";
            } else if (typeof val === "object" && val !== null) {
              type = "object";
              example = "{}";
            }
          }

          dataNeeds[targetId][key] = { type, __example__: example };
        });
      };

      srcScreen.layout.children.forEach((comp) => {
        // Note: data_api_version is now handled at root level, not per-action

        processActionWithScreen(comp["on-click-action"]);
        processActionWithScreen(comp["on-select-action"]);
        if (comp.type === "NavigationList" && Array.isArray(comp["list-items"])) {
          (comp["list-items"] as any[]).forEach((item) => {
            processActionWithScreen(item["on-click-action"]);
          });
        }
      });
    });

    // Apply: add missing data model entries to target screens
    updated.forEach((screen, idx) => {
      const needs = dataNeeds[screen.id];
      if (!needs) return;

      const currentData = { ...(screen.data || {}) };
      let screenChanged = false;
      Object.entries(needs).forEach(([key, val]) => {
        if (!currentData[key]) {
          currentData[key] = val;
          screenChanged = true;
          changed = true;
        }
      });

      if (screenChanged) {
        updated[idx] = { ...screen, data: currentData };
      }
    });

    // Also: ensure ${data.xxx} refs in payloads have matching data model on source screen
    updated.forEach((screen, idx) => {
      const currentData = { ...(screen.data || {}) };
      let screenChanged = false;

      // Recursive scanner for data refs
      const scanForRefs = (val: any) => {
        if (typeof val === "string") {
          const matches = val.matchAll(/\$\{data\.([^}]+)\}/g);
          for (const match of matches) {
            const fullKey = match[1];
            const rootKey = fullKey.split(".")[0].split("[")[0];
            if (!currentData[rootKey]) {
              // Infer type: if it looks like an object access, default to object, else string
              const type = fullKey.includes(".") || fullKey.includes("[") ? "object" : "string";
              currentData[rootKey] = { type, __example__: "" };
              screenChanged = true;
              changed = true;
            }
          }
        } else if (typeof val === "object" && val !== null) {
          Object.values(val).forEach(v => scanForRefs(v));
        }
      };

      // Check all component props/labels/text
      screen.layout.children.forEach((comp) => {
        scanForRefs(comp.label);
        scanForRefs(comp.text);
        scanForRefs(comp.description);
        scanForRefs(comp["helper-text"]);
        scanForRefs(comp["init-value"]);

        if (Array.isArray(comp["data-source"])) {
          scanForRefs(comp["data-source"]);
        }

        const action = comp["on-click-action"] || comp["on-select-action"];
        // Note: data_api_version is now handled at root level

        if (action?.payload) scanForRefs(action.payload);

        // Check NavigationList items for actions
        if (comp.type === "NavigationList" && Array.isArray(comp["list-items"])) {
          (comp["list-items"] as any[]).forEach((item) => {
            const itemAction = item["on-click-action"];
            if (itemAction?.name === "navigate") {
              // Check if target screen needs data from this payload
              const targetName = itemAction.next?.name;
              const targetScreen = screens.find(ts => ts.id === targetName);

              // DATA MODEL SYNC: If payload sends data that target doesn't have, add it to target
              if (targetScreen && itemAction.payload) {
                Object.entries(itemAction.payload).forEach(([key, val]) => {
                  // Only add if target doesn't have it
                  if (!targetScreen.data?.[key]) {
                    if (!dataNeeds[targetName]) dataNeeds[targetName] = {};
                    // Infer type
                    let type = "string";
                    if (typeof val === "number") type = "number";
                    else if (typeof val === "boolean") type = "boolean";
                    else if (typeof val === "string" && val.startsWith("${form.")) {
                      // Try to find source form field to infer type
                      const match = val.match(/^\${form\.([^}]+)}$/);
                      if (match) {
                        const fieldName = match[1];
                        const sourceField = screen.layout.children.find(c => c.name === fieldName);
                        if (sourceField?.["input-type"] === "number") type = "number";
                      }
                    }

                    dataNeeds[targetName][key] = { type, __example__: "" };
                  }
                });
              }
            }
          });
        }

        if (comp.type === "NavigationList" && Array.isArray(comp["list-items"])) {
          (comp["list-items"] as any[]).forEach((item) => {
            if (item["on-click-action"]?.payload) scanForRefs(item["on-click-action"].payload);
          });
        }
      });

      if (screenChanged) {
        updated[idx] = { ...screen, data: currentData };
      }
    });

    // Auto-fix: Set dataApiVersion if flow uses data_exchange
    const hasDataExchange = updated.some(s =>
      s.layout.children.some(c => {
        const actions = [c["on-click-action"], c["on-select-action"]];
        if (c.type === "NavigationList" && Array.isArray(c["list-items"])) {
          (c["list-items"] as any[]).forEach(item => actions.push(item["on-click-action"]));
        }
        return actions.some(a => a?.name === "data_exchange");
      })
    );

    if (hasDataExchange && !dataApiVersion) {
      setDataApiVersion("3.0");
      changed = true;
    }

    if (changed) {
      setScreens(updated);
    }
    return changed;
  }, [screens, dataApiVersion]);

  // ============================================================
  // RENDER
  // ============================================================

  const selectedComp = currentScreen && selectedCompIdx !== null ? currentScreen.layout.children[selectedCompIdx] : null;
  const selectedTemplate = selectedComp ? COMPONENT_CATALOG.find((c) => c.type === selectedComp.type) : undefined;

  // Collect form fields from current screen (components with a 'name' property)
  const currentFormFields = useMemo(() => {
    if (!currentScreen) return [];
    return currentScreen.layout.children
      .filter((c) => c.name && c.type !== "Footer")
      .map((c) => ({ name: c.name as string, type: c.type }));
  }, [currentScreen]);

  // Collect form fields from ALL screens (for complete action's global payload)
  const allFormFields = useMemo(() => {
    const result: { screenId: string; name: string; type: string }[] = [];
    screens.forEach((s) => {
      s.layout.children.forEach((c) => {
        if (c.name && c.type !== "Footer") {
          result.push({ screenId: s.id, name: c.name as string, type: c.type });
        }
      });
    });
    return result;
  }, [screens]);

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
          <div style={{
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "11px",
            fontWeight: 600,
            background: jsonSizeBytes > MAX_JSON_BYTES ? "#fef2f2" : jsonSizeBytes > MAX_JSON_BYTES * 0.8 ? "#fffbeb" : "#f0fdf4",
            color: jsonSizeBytes > MAX_JSON_BYTES ? "#dc2626" : jsonSizeBytes > MAX_JSON_BYTES * 0.8 ? "#d97706" : "#16a34a",
            border: `1px solid ${jsonSizeBytes > MAX_JSON_BYTES ? "#fecaca" : jsonSizeBytes > MAX_JSON_BYTES * 0.8 ? "#fde68a" : "#bbf7d0"}`,
            whiteSpace: "nowrap",
          }}>
            {jsonSizeBytes < 1024 ? `${jsonSizeBytes}B` : jsonSizeBytes < 1024 * 1024 ? `${(jsonSizeBytes / 1024).toFixed(0)}KB` : `${(jsonSizeBytes / (1024 * 1024)).toFixed(2)}MB`} / 10MB
          </div>
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
        <ValidationPanel
          errors={validationErrors}
          onClose={() => setValidationErrors([])}
          onAutoFix={() => { syncDataModels(); setTimeout(validate, 50); }}
        />
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
                {/* Screen Data Editor */}
                <ScreenDataEditor
                  data={currentScreen.data || {}}
                  onChange={(newData) => updateScreen(selectedScreenIdx, { data: Object.keys(newData).length > 0 ? newData : undefined })}
                />
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
                  screenData={currentScreen?.data}
                  onChange={(updated) => {
                    if (selectedCompIdx !== null) updateComponent(selectedCompIdx, updated);
                  }}
                  version={version}
                  allFormFields={allFormFields}
                  currentScreenId={currentScreen?.id || ""}
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
