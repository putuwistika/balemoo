import type {
    WhatsAppFlow,
    FlowJSON,
    FlowScreen,
    Component,
    ComponentType,
} from '@/app/types/whatsappFlow';

/**
 * Clones a flow with a new name
 */
export function cloneFlow(flow: WhatsAppFlow, newName: string): Partial<WhatsAppFlow> {
    return {
        name: newName,
        description: flow.description,
        category: flow.category,
        flow_json: JSON.parse(JSON.stringify(flow.flow_json)), // Deep clone
        version: flow.version,
        status: 'draft',
    };
}

/**
 * Exports Flow JSON as a downloadable file
 */
export function exportFlowJSON(flow: WhatsAppFlow): void {
    const dataStr = JSON.stringify(flow.flow_json, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${flow.name.replace(/\s+/g, '_').toLowerCase()}_flow.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

/**
 * Imports Flow JSON from a file
 */
export async function importFlowJSON(file: File): Promise<FlowJSON> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                resolve(json);
            } catch (error) {
                reject(new Error('Invalid JSON file'));
            }
        };

        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };

        reader.readAsText(file);
    });
}

/**
 * Creates a default empty screen
 */
export function createDefaultScreen(id: string, title?: string): FlowScreen {
    return {
        id,
        title: title || id,
        terminal: false,
        data: {},
        layout: {
            type: 'SingleColumnLayout',
            children: [],
        },
    };
}

/**
 * Generates a unique screen ID
 */
export function generateScreenId(existingIds: string[], prefix: string = 'SCREEN'): string {
    let counter = 1;
    let newId = `${prefix}_${counter}`;

    while (existingIds.includes(newId)) {
        counter++;
        newId = `${prefix}_${counter}`;
    }

    return newId;
}


/**
 * Generates a unique component name
 */
export function generateComponentName(existingNames: string[], baseName: string): string {
    let counter = 1;
    let newName = `${baseName}_${counter}`;

    while (existingNames.includes(newName)) {
        counter++;
        newName = `${baseName}_${counter}`;
    }

    return newName;
}

/**
 * Creates a default component based on type
 */
export function createDefaultComponent(type: ComponentType): Component {
    const defaults: Record<ComponentType, Component> = {
        TextHeading: {
            type: 'TextHeading',
            text: 'Heading Text',
        },
        TextSubheading: {
            type: 'TextSubheading',
            text: 'Subheading Text',
        },
        TextBody: {
            type: 'TextBody',
            text: 'Body text goes here',
        },
        TextCaption: {
            type: 'TextCaption',
            text: 'Caption text',
        },
        TextInput: {
            type: 'TextInput',
            name: 'field_name',
            label: 'Label',
            required: false,
            'input-type': 'text',
        },
        TextArea: {
            type: 'TextArea',
            name: 'field_name',
            label: 'Label',
            required: false,
        },
        RadioButtonsGroup: {
            type: 'RadioButtonsGroup',
            name: 'field_name',
            label: 'Select an option',
            'data-source': [
                { id: 'option1', title: 'Option 1' },
                { id: 'option2', title: 'Option 2' },
            ],
            required: false,
        },
        CheckboxGroup: {
            type: 'CheckboxGroup',
            name: 'field_name',
            label: 'Select options',
            'data-source': [
                { id: 'option1', title: 'Option 1' },
                { id: 'option2', title: 'Option 2' },
            ],
            required: false,
        },
        Dropdown: {
            type: 'Dropdown',
            name: 'field_name',
            label: 'Select from dropdown',
            'data-source': [
                { id: 'option1', title: 'Option 1' },
                { id: 'option2', title: 'Option 2' },
            ],
            required: false,
        },
        DatePicker: {
            type: 'DatePicker',
            name: 'field_name',
            label: 'Select a date',
            required: false,
        },
        CalendarPicker: {
            type: 'CalendarPicker',
            name: 'field_name',
            title: 'Select a date',
            mode: 'single',
            required: false,
        },
        Footer: {
            type: 'Footer',
            label: 'Continue',
            'on-click-action': {
                name: 'complete',
                payload: {},
            },
        },
        OptIn: {
            type: 'OptIn',
            name: 'field_name',
            label: 'I agree to the terms',
            required: false,
        },
        EmbeddedLink: {
            type: 'EmbeddedLink',
            text: 'Click here',
            'on-click-action': {
                name: 'open_url',
                payload: {
                    url: 'https://example.com',
                },
            },
        },
        Image: {
            type: 'Image',
            src: 'https://via.placeholder.com/300',
            'scale-type': 'cover',
        },
        ImageCarousel: {
            type: 'ImageCarousel',
            images: [
                { src: 'https://via.placeholder.com/300', 'alt-text': 'Image 1' },
                { src: 'https://via.placeholder.com/300', 'alt-text': 'Image 2' },
            ],
        },
        ChipsSelector: {
            type: 'ChipsSelector',
            name: 'field_name',
            label: 'Select chips',
            'data-source': [
                { id: 'chip1', title: 'Chip 1' },
                { id: 'chip2', title: 'Chip 2' },
            ],
            required: false,
        },
        NavigationList: {
            type: 'NavigationList',
            'data-source': [
                { id: 'item1', title: 'Item 1' },
                { id: 'item2', title: 'Item 2' },
            ],
        },
        PhotoPicker: {
            type: 'PhotoPicker',
            name: 'field_name',
            label: 'Upload photo',
            'photo-source': 'camera_gallery',
            required: false,
        },
        If: {
            type: 'If',
            condition: 'true',
            then: [],
        },
        Switch: {
            type: 'Switch',
            cases: [
                {
                    condition: 'true',
                    components: [],
                },
            ],
        },
    };

    return defaults[type];
}

/**
 * Gets component display name
 */
export function getComponentDisplayName(type: ComponentType): string {
    const names: Record<ComponentType, string> = {
        TextHeading: 'Heading',
        TextSubheading: 'Subheading',
        TextBody: 'Body Text',
        TextCaption: 'Caption',
        TextInput: 'Text Input',
        TextArea: 'Text Area',
        RadioButtonsGroup: 'Radio Buttons',
        CheckboxGroup: 'Checkbox Group',
        Dropdown: 'Dropdown',
        DatePicker: 'Date Picker',
        CalendarPicker: 'Calendar Picker',
        Footer: 'Button',
        OptIn: 'Opt-in Checkbox',
        EmbeddedLink: 'Link',
        Image: 'Image',
        ImageCarousel: 'Image Carousel',
        ChipsSelector: 'Chips Selector',
        NavigationList: 'Navigation List',
        PhotoPicker: 'Photo Picker',
        If: 'Conditional (If)',
        Switch: 'Switch',
    };

    return names[type] || type;
}

/**
 * Gets component description
 */
export function getComponentDescription(type: ComponentType): string {
    const descriptions: Record<ComponentType, string> = {
        TextHeading: 'Large heading text (max 80 chars)',
        TextSubheading: 'Subheading text (max 80 chars)',
        TextBody: 'Body text with markdown support (max 4096 chars)',
        TextCaption: 'Small caption text (max 409 chars)',
        TextInput: 'Single-line text input field',
        TextArea: 'Multi-line text input field',
        RadioButtonsGroup: 'Single selection from options',
        CheckboxGroup: 'Multiple selection from options',
        Dropdown: 'Dropdown selection',
        DatePicker: 'Date selection',
        CalendarPicker: 'Calendar-based date picker',
        Footer: 'Action button',
        OptIn: 'Checkbox for consent/agreement',
        EmbeddedLink: 'Clickable link',
        Image: 'Display an image',
        ImageCarousel: 'Multiple images in carousel',
        ChipsSelector: 'Chip-based selection',
        NavigationList: 'List with navigation',
        PhotoPicker: 'Upload photos from device',
        If: 'Conditional rendering',
        Switch: 'Multiple conditional branches',
    };

    return descriptions[type] || '';
}

/**
 * Extracts all field names from a screen
 */
export function extractFieldNames(screen: FlowScreen): string[] {
    const names: string[] = [];

    screen.layout?.children?.forEach((component) => {
        if ('name' in component && component.name) {
            names.push(component.name);
        }
    });

    return names;
}

/**
 * Updates screen data based on components
 */
export function syncScreenData(screen: FlowScreen): FlowScreen {
    const fieldNames = extractFieldNames(screen);
    const newData: Record<string, any> = {};

    fieldNames.forEach((name) => {
        if (screen.data && screen.data[name]) {
            newData[name] = screen.data[name];
        } else {
            // Create default data field
            newData[name] = {
                type: 'string',
                __example__: '',
            };
        }
    });

    return {
        ...screen,
        data: newData,
    };
}
