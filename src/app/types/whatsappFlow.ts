// WhatsApp Flow Types
// Based on Meta WhatsApp Flows API specification

export type FlowCategory =
  | 'SIGN_UP'
  | 'SIGN_IN'
  | 'APPOINTMENT_BOOKING'
  | 'LEAD_GENERATION'
  | 'CONTACT_US'
  | 'CUSTOMER_SUPPORT'
  | 'SURVEY'
  | 'OTHER';

export type FlowStatus = 'draft' | 'published' | 'deprecated';

export interface WhatsAppFlow {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  category: FlowCategory;
  status: FlowStatus;
  flow_json: FlowJSON;
  version: string;
  endpoint_uri?: string;
  flow_id?: string; // Meta Flow ID
  created_at: string;
  updated_at: string;
  created_by?: string;
  published_at?: string;
}

export interface WhatsAppFlowTemplate {
  id: string;
  name: string;
  description?: string;
  category: FlowCategory;
  thumbnail_url?: string;
  flow_json: FlowJSON;
  is_public: boolean;
  created_at: string;
}

// Flow JSON Structure

export interface FlowJSON {
  version: string;
  screens: FlowScreen[];
  data_api_version?: string;
  routing_model?: RoutingModel;
}

export interface FlowScreen {
  id: string;
  title?: string;
  terminal?: boolean;
  success?: boolean;
  refresh_on_back?: boolean;
  data?: Record<string, DataField>;
  layout: Layout;
}

export interface DataField {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  __example__?: any;
  [key: string]: any;
}

export interface Layout {
  type: 'SingleColumnLayout';
  children: Component[];
}

export interface RoutingModel {
  [screenId: string]: string[];
}

// Component Types

export type Component =
  | TextHeadingComponent
  | TextSubheadingComponent
  | TextBodyComponent
  | TextCaptionComponent
  | TextInputComponent
  | TextAreaComponent
  | RadioButtonsGroupComponent
  | CheckboxGroupComponent
  | DropdownComponent
  | DatePickerComponent
  | CalendarPickerComponent
  | FooterComponent
  | OptInComponent
  | EmbeddedLinkComponent
  | ImageComponent
  | ImageCarouselComponent
  | ChipsSelectorComponent
  | NavigationListComponent
  | IfComponent
  | SwitchComponent
  | PhotoPickerComponent;

export type ComponentType =
  | 'TextHeading'
  | 'TextSubheading'
  | 'TextBody'
  | 'TextCaption'
  | 'TextInput'
  | 'TextArea'
  | 'RadioButtonsGroup'
  | 'CheckboxGroup'
  | 'Dropdown'
  | 'DatePicker'
  | 'CalendarPicker'
  | 'Footer'
  | 'OptIn'
  | 'EmbeddedLink'
  | 'Image'
  | 'ImageCarousel'
  | 'ChipsSelector'
  | 'NavigationList'
  | 'If'
  | 'Switch'
  | 'PhotoPicker';

// Text Components

export interface TextHeadingComponent {
  type: 'TextHeading';
  text: string;
  visible?: boolean;
}

export interface TextSubheadingComponent {
  type: 'TextSubheading';
  text: string;
  visible?: boolean;
}

export interface TextBodyComponent {
  type: 'TextBody';
  text: string;
  'font-weight'?: 'normal' | 'bold' | 'italic' | 'bold_italic';
  strikethrough?: boolean;
  visible?: boolean;
  markdown?: boolean;
}

export interface TextCaptionComponent {
  type: 'TextCaption';
  text: string;
  'font-weight'?: 'normal' | 'bold' | 'italic' | 'bold_italic';
  strikethrough?: boolean;
  visible?: boolean;
  markdown?: boolean;
}

// Input Components

export type InputType = 'text' | 'number' | 'email' | 'password' | 'passcode' | 'phone';

export interface TextInputComponent {
  type: 'TextInput';
  name: string;
  label: string;
  'input-type'?: InputType;
  pattern?: string;
  required?: boolean;
  'min-chars'?: number;
  'max-chars'?: number;
  'helper-text'?: string;
  'error-message'?: string;
  'init-value'?: string;
  visible?: boolean;
  enabled?: boolean;
}

export interface TextAreaComponent {
  type: 'TextArea';
  name: string;
  label: string;
  required?: boolean;
  'max-length'?: number;
  'helper-text'?: string;
  'error-message'?: string;
  'init-value'?: string;
  visible?: boolean;
  enabled?: boolean;
}

export interface DataSourceItem {
  id: string;
  title: string;
  description?: string;
  metadata?: string;
  enabled?: boolean;
}

export interface RadioButtonsGroupComponent {
  type: 'RadioButtonsGroup';
  name: string;
  label?: string;
  'data-source': DataSourceItem[];
  required?: boolean;
  visible?: boolean;
  enabled?: boolean;
  'on-select-action'?: Action;
  'init-value'?: string;
  'error-message'?: string;
}

export interface CheckboxGroupComponent {
  type: 'CheckboxGroup';
  name: string;
  label?: string;
  'data-source': DataSourceItem[];
  'min-selected-items'?: number;
  'max-selected-items'?: number;
  required?: boolean;
  visible?: boolean;
  enabled?: boolean;
  'on-select-action'?: Action;
  'on-unselect-action'?: Action;
  description?: string;
  'init-value'?: string[];
  'error-message'?: string;
}

export interface DropdownComponent {
  type: 'Dropdown';
  name: string;
  label: string;
  'data-source': DataSourceItem[];
  required?: boolean;
  enabled?: boolean;
  visible?: boolean;
  'on-select-action'?: Action;
  'init-value'?: string;
  'error-message'?: string;
}

export interface DatePickerComponent {
  type: 'DatePicker';
  name: string;
  label: string;
  'min-date'?: string;
  'max-date'?: string;
  'unavailable-dates'?: string[];
  required?: boolean;
  visible?: boolean;
  enabled?: boolean;
  'helper-text'?: string;
  'init-value'?: string;
  'error-message'?: string;
  'on-select-action'?: Action;
}

export interface CalendarPickerComponent {
  type: 'CalendarPicker';
  name: string;
  title?: string;
  description?: string;
  mode?: 'single' | 'range';
  'min-date'?: string;
  'max-date'?: string;
  'unavailable-dates'?: string[];
  required?: boolean;
  visible?: boolean;
  enabled?: boolean;
  'init-value'?: string | string[];
  'error-message'?: string;
  'on-select-action'?: Action;
}

// Interactive Components

export interface FooterComponent {
  type: 'Footer';
  label: string;
  'on-click-action': Action;
  enabled?: boolean;
  visible?: boolean;
}

export interface OptInComponent {
  type: 'OptIn';
  name: string;
  label: string;
  required?: boolean;
  'init-value'?: boolean;
  'on-click-action'?: Action;
  visible?: boolean;
}

export interface EmbeddedLinkComponent {
  type: 'EmbeddedLink';
  text: string;
  'on-click-action': OpenUrlAction;
  visible?: boolean;
}

export interface ImageComponent {
  type: 'Image';
  src: string;
  width?: number;
  height?: number;
  'scale-type'?: 'cover' | 'contain';
  'aspect-ratio'?: number;
  'alt-text'?: string;
  visible?: boolean;
}

export interface ImageCarouselComponent {
  type: 'ImageCarousel';
  images: Array<{
    src: string;
    'alt-text'?: string;
  }>;
  visible?: boolean;
}

export interface ChipsSelectorComponent {
  type: 'ChipsSelector';
  name: string;
  label?: string;
  'data-source': DataSourceItem[];
  'min-selected-items'?: number;
  'max-selected-items'?: number;
  required?: boolean;
  visible?: boolean;
  'init-value'?: string[];
  'error-message'?: string;
}

export interface NavigationListComponent {
  type: 'NavigationList';
  'data-source': DataSourceItem[];
  visible?: boolean;
}

export interface PhotoPickerComponent {
  type: 'PhotoPicker';
  name: string;
  label: string;
  description?: string;
  'photo-source'?: 'camera_gallery' | 'camera' | 'gallery';
  'min-uploaded-photos'?: number;
  'max-uploaded-photos'?: number;
  'max-file-size-kb'?: number;
  required?: boolean;
  visible?: boolean;
}

// Logic Components

export interface IfComponent {
  type: 'If';
  condition: string;
  then: Component[];
  else?: Component[];
}

export interface SwitchComponent {
  type: 'Switch';
  cases: Array<{
    condition: string;
    components: Component[];
  }>;
  default?: Component[];
}

// Actions

export type ActionType = 'navigate' | 'complete' | 'data_exchange' | 'update_data' | 'open_url';

export type Action = NavigateAction | CompleteAction | DataExchangeAction | UpdateDataAction | OpenUrlAction;

export interface NavigateAction {
  name: 'navigate';
  next: {
    type: 'screen';
    name: string;
  };
  payload?: Record<string, any>;
}

export interface CompleteAction {
  name: 'complete';
  payload?: Record<string, any>;
}

export interface DataExchangeAction {
  name: 'data_exchange';
  payload?: Record<string, any>;
}

export interface UpdateDataAction {
  name: 'update_data';
  payload: Record<string, any>;
}

export interface OpenUrlAction {
  name: 'open_url';
  payload: {
    url: string;
  };
}

// Validation Types

export interface ValidationError {
  field?: string;
  message: string;
  type: 'error' | 'warning';
  path?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Component Categories for UI

export interface ComponentCategory {
  name: string;
  label: string;
  icon?: string;
  components: ComponentType[];
}

export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  {
    name: 'text',
    label: 'Text Components',
    components: ['TextHeading', 'TextSubheading', 'TextBody', 'TextCaption'],
  },
  {
    name: 'input',
    label: 'Input Components',
    components: [
      'TextInput',
      'TextArea',
      'RadioButtonsGroup',
      'CheckboxGroup',
      'Dropdown',
      'DatePicker',
      'CalendarPicker',
    ],
  },
  {
    name: 'interactive',
    label: 'Interactive Components',
    components: [
      'Footer',
      'OptIn',
      'EmbeddedLink',
      'Image',
      'ImageCarousel',
      'ChipsSelector',
      'NavigationList',
      'PhotoPicker',
    ],
  },
  {
    name: 'logic',
    label: 'Logic Components',
    components: ['If', 'Switch'],
  },
];

// Helper type for creating new components
export type ComponentDefaults = {
  [K in ComponentType]: Extract<Component, { type: K }>;
};
