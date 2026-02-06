import type {
    FlowJSON,
    FlowScreen,
    Component,
    Action,
    ValidationError,
    ValidationResult,
    NavigateAction,
} from '@/app/types/whatsappFlow';

/**
 * Validates a complete Flow JSON structure
 */
export function validateFlowJSON(flowJSON: FlowJSON): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Validate version
    if (!flowJSON.version) {
        errors.push({
            field: 'version',
            message: 'Flow version is required',
            type: 'error',
            path: 'version',
        });
    }

    // Validate screens
    if (!flowJSON.screens || flowJSON.screens.length === 0) {
        errors.push({
            field: 'screens',
            message: 'At least one screen is required',
            type: 'error',
            path: 'screens',
        });
    } else {
        // Validate each screen
        flowJSON.screens.forEach((screen, index) => {
            const screenErrors = validateScreen(screen, flowJSON.screens);
            screenErrors.forEach((error) => {
                errors.push({
                    ...error,
                    path: `screens[${index}].${error.path || ''}`,
                });
            });
        });

        // Check for duplicate screen IDs
        const screenIds = flowJSON.screens.map((s) => s.id);
        const duplicates = screenIds.filter((id, index) => screenIds.indexOf(id) !== index);
        if (duplicates.length > 0) {
            errors.push({
                field: 'screens',
                message: `Duplicate screen IDs found: ${duplicates.join(', ')}`,
                type: 'error',
                path: 'screens',
            });
        }

        // Check for at least one terminal screen
        const hasTerminal = flowJSON.screens.some((s) => s.terminal);
        if (!hasTerminal) {
            warnings.push({
                field: 'screens',
                message: 'Flow should have at least one terminal screen',
                type: 'warning',
                path: 'screens',
            });
        }

        // Validate navigation references
        const navigationErrors = validateNavigation(flowJSON.screens);
        errors.push(...navigationErrors);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validates a single screen
 */
export function validateScreen(screen: FlowScreen, allScreens: FlowScreen[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate screen ID
    if (!screen.id) {
        errors.push({
            field: 'id',
            message: 'Screen ID is required',
            type: 'error',
            path: 'id',
        });
    } else {
        // Screen ID should be uppercase with underscores
        if (!/^[A-Z][A-Z0-9_]*$/.test(screen.id)) {
            errors.push({
                field: 'id',
                message: 'Screen ID should be uppercase with underscores (e.g., WELCOME_SCREEN)',
                type: 'error',
                path: 'id',
            });
        }
    }

    // Validate layout
    if (!screen.layout) {
        errors.push({
            field: 'layout',
            message: 'Screen layout is required',
            type: 'error',
            path: 'layout',
        });
    } else {
        if (!screen.layout.children || screen.layout.children.length === 0) {
            errors.push({
                field: 'layout.children',
                message: 'Screen must have at least one component',
                type: 'error',
                path: 'layout.children',
            });
        } else {
            // Validate each component
            screen.layout.children.forEach((component, index) => {
                const componentErrors = validateComponent(component, screen);
                componentErrors.forEach((error) => {
                    errors.push({
                        ...error,
                        path: `layout.children[${index}].${error.path || ''}`,
                    });
                });
            });
        }
    }

    // Terminal screens should have success flag
    if (screen.terminal && screen.success === undefined) {
        errors.push({
            field: 'success',
            message: 'Terminal screens should have success flag set',
            type: 'error',
            path: 'success',
        });
    }

    return errors;
}

/**
 * Validates a component
 */
export function validateComponent(component: Component, screen: FlowScreen): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!component.type) {
        errors.push({
            field: 'type',
            message: 'Component type is required',
            type: 'error',
            path: 'type',
        });
        return errors;
    }

    // Validate based on component type
    switch (component.type) {
        case 'TextHeading':
        case 'TextSubheading':
        case 'TextBody':
        case 'TextCaption':
            if (!component.text || component.text.trim() === '') {
                errors.push({
                    field: 'text',
                    message: `${component.type} text cannot be empty`,
                    type: 'error',
                    path: 'text',
                });
            }
            // Check character limits
            const limits: Record<string, number> = {
                TextHeading: 80,
                TextSubheading: 80,
                TextBody: 4096,
                TextCaption: 409,
            };
            if (component.text && component.text.length > limits[component.type]) {
                errors.push({
                    field: 'text',
                    message: `${component.type} exceeds maximum length of ${limits[component.type]} characters`,
                    type: 'error',
                    path: 'text',
                });
            }
            break;

        case 'TextInput':
        case 'TextArea':
            if (!component.name) {
                errors.push({
                    field: 'name',
                    message: `${component.type} must have a name`,
                    type: 'error',
                    path: 'name',
                });
            }
            if (!component.label) {
                errors.push({
                    field: 'label',
                    message: `${component.type} must have a label`,
                    type: 'error',
                    path: 'label',
                });
            }
            // Check if name is in screen data
            if (component.name && screen.data && !screen.data[component.name]) {
                errors.push({
                    field: 'name',
                    message: `Field "${component.name}" not found in screen data`,
                    type: 'error',
                    path: 'name',
                });
            }
            break;

        case 'RadioButtonsGroup':
        case 'CheckboxGroup':
        case 'Dropdown':
            if (!component.name) {
                errors.push({
                    field: 'name',
                    message: `${component.type} must have a name`,
                    type: 'error',
                    path: 'name',
                });
            }
            if (!component['data-source'] || component['data-source'].length === 0) {
                errors.push({
                    field: 'data-source',
                    message: `${component.type} must have at least one option`,
                    type: 'error',
                    path: 'data-source',
                });
            }
            break;

        case 'Footer':
            if (!component.label) {
                errors.push({
                    field: 'label',
                    message: 'Footer button must have a label',
                    type: 'error',
                    path: 'label',
                });
            }
            if (!component['on-click-action']) {
                errors.push({
                    field: 'on-click-action',
                    message: 'Footer button must have an action',
                    type: 'error',
                    path: 'on-click-action',
                });
            }
            break;

        case 'DatePicker':
        case 'CalendarPicker':
            if (!component.name) {
                errors.push({
                    field: 'name',
                    message: `${component.type} must have a name`,
                    type: 'error',
                    path: 'name',
                });
            }
            if (!component.label) {
                errors.push({
                    field: 'label',
                    message: `${component.type} must have a label`,
                    type: 'error',
                    path: 'label',
                });
            }
            break;
    }

    return errors;
}

/**
 * Validates navigation between screens
 */
export function validateNavigation(screens: FlowScreen[]): ValidationError[] {
    const errors: ValidationError[] = [];
    const screenIds = screens.map((s) => s.id);

    screens.forEach((screen, screenIndex) => {
        if (!screen.layout?.children) return;

        screen.layout.children.forEach((component, componentIndex) => {
            // Check Footer actions
            if (component.type === 'Footer' && component['on-click-action']) {
                const action = component['on-click-action'];
                if (action.name === 'navigate') {
                    const navigateAction = action as NavigateAction;
                    if (navigateAction.next?.name && !screenIds.includes(navigateAction.next.name)) {
                        errors.push({
                            field: 'on-click-action',
                            message: `Navigation target "${navigateAction.next.name}" does not exist`,
                            type: 'error',
                            path: `screens[${screenIndex}].layout.children[${componentIndex}].on-click-action`,
                        });
                    }
                }
            }
        });
    });

    return errors;
}

/**
 * Generates a unique screen ID
 */
export function generateScreenId(existingIds: string[], baseName: string = 'SCREEN'): string {
    let counter = 1;
    let id = baseName;

    while (existingIds.includes(id)) {
        id = `${baseName}_${counter}`;
        counter++;
    }

    return id;
}

/**
 * Generates a unique component name
 */
export function generateComponentName(existingNames: string[], baseName: string = 'field'): string {
    let counter = 1;
    let name = baseName;

    while (existingNames.includes(name)) {
        name = `${baseName}_${counter}`;
        counter++;
    }

    return name;
}

/**
 * Checks if a screen is reachable from the first screen
 */
export function isScreenReachable(
    targetScreenId: string,
    screens: FlowScreen[],
    startScreenId?: string
): boolean {
    if (!screens || screens.length === 0) return false;

    const firstScreen = startScreenId
        ? screens.find(s => s.id === startScreenId)
        : screens[0];

    if (!firstScreen) return false;
    if (firstScreen.id === targetScreenId) return true;

    const visited = new Set<string>();
    const queue = [firstScreen.id];

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        if (currentId === targetScreenId) return true;

        const currentScreen = screens.find((s) => s.id === currentId);
        if (!currentScreen) continue;

        // Find all navigation actions in this screen
        currentScreen.layout?.children?.forEach((component) => {
            if (component.type === 'Footer' && component['on-click-action']) {
                const action = component['on-click-action'];
                if (action.name === 'navigate') {
                    const navigateAction = action as NavigateAction;
                    if (navigateAction.next?.name) {
                        queue.push(navigateAction.next.name);
                    }
                }
            }
        });
    }

    return false;
}

/**
 * Gets all unreachable screens
 */
export function getUnreachableScreens(screens: FlowScreen[]): string[] {
    if (!screens || screens.length === 0) return [];

    const unreachable: string[] = [];

    screens.forEach((screen, index) => {
        if (index === 0) return; // First screen is always reachable
        if (!isScreenReachable(screen.id, screens)) {
            unreachable.push(screen.id);
        }
    });

    return unreachable;
}
