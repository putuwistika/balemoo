import type { ChatflowNode, ChatflowEdge } from "@/app/types/chatflow";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateChatflow(
  nodes: ChatflowNode[],
  edges: ChatflowEdge[]
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // No nodes case
  if (nodes.length === 0) {
    errors.push("Flow must have at least one node");
    return { valid: false, errors, warnings };
  }

  // Rule 1: Must have exactly 1 trigger node
  const triggers = nodes.filter((n) => n.type === "trigger");
  if (triggers.length === 0) {
    errors.push("Flow must have a trigger node");
  } else if (triggers.length > 1) {
    errors.push("Flow can only have one trigger node");
  }

  // Rule 2: Must have at least 1 end node
  const ends = nodes.filter((n) => n.type === "end");
  if (ends.length === 0) {
    errors.push("Flow must have at least one end node");
  }

  // Rule 3: All nodes must be connected (except trigger at start)
  const connectedNodes = new Set<string>();
  edges.forEach((e) => {
    connectedNodes.add(e.source);
    connectedNodes.add(e.target);
  });

  const orphans = nodes.filter(
    (n) =>
      !connectedNodes.has(n.id) && n.type !== "trigger" && nodes.length > 1
  );

  if (orphans.length > 0) {
    errors.push(
      `${orphans.length} disconnected node(s): ${orphans.map((n) => n.data.label).join(", ")}`
    );
  }

  // Rule 4: Trigger must have outgoing connection (if not alone)
  if (triggers.length === 1 && nodes.length > 1) {
    const triggerHasOutput = edges.some((e) => e.source === triggers[0].id);
    if (!triggerHasOutput) {
      errors.push("Trigger node must connect to another node");
    }
  }

  // Rule 5: End nodes must have incoming connection
  ends.forEach((endNode) => {
    const hasInput = edges.some((e) => e.target === endNode.id);
    if (!hasInput && nodes.length > 1) {
      errors.push(`End node "${endNode.data.label}" is not connected`);
    }
  });

  // Rule 6: Condition nodes should have 2 outputs
  const conditions = nodes.filter((n) => n.type === "condition");
  conditions.forEach((condNode) => {
    const outputs = edges.filter((e) => e.source === condNode.id);
    if (outputs.length === 0) {
      errors.push(`Condition "${condNode.data.label}" has no outputs`);
    } else if (outputs.length === 1) {
      warnings.push(
        `Condition "${condNode.data.label}" should have 2 outputs (true/false paths)`
      );
    } else if (outputs.length > 2) {
      errors.push(
        `Condition "${condNode.data.label}" has too many outputs (max 2)`
      );
    }
  });

  // Rule 7: Send template nodes must have template selected
  const sendTemplates = nodes.filter((n) => n.type === "send_template");
  sendTemplates.forEach((node) => {
    if (!node.data.config?.templateId) {
      errors.push(
        `Send Template "${node.data.label}" has no template selected`
      );
    }
  });

  // Rule 8: No circular dependencies (infinite loops)
  const hasCircular = detectCircularDependency(nodes, edges);
  if (hasCircular) {
    errors.push("Flow contains circular dependency (infinite loop)");
  }

  // Rule 9: Validate node configurations
  nodes.forEach((node) => {
    // Trigger validation
    if (node.type === "trigger") {
      const config = node.data.config;
      if (config?.type === "keyword" && !config.keyword) {
        errors.push(`Trigger "${node.data.label}" needs a keyword`);
      }
    }

    // Wait reply validation
    if (node.type === "wait_reply") {
      const config = node.data.config;
      if (config?.timeout && config.timeout < 0) {
        errors.push(
          `Wait Reply "${node.data.label}" has invalid timeout value`
        );
      }
    }

    // Condition validation
    if (node.type === "condition") {
      const config = node.data.config;
      if (!config?.variable) {
        errors.push(`Condition "${node.data.label}" needs a variable to check`);
      }
      if (!config?.value) {
        errors.push(
          `Condition "${node.data.label}" needs a value to compare`
        );
      }
    }

    // Delay validation
    if (node.type === "delay") {
      const config = node.data.config;
      if (!config?.duration || config.duration <= 0) {
        errors.push(`Delay "${node.data.label}" needs a valid duration`);
      }
    }

    // Guest form validation
    if (node.type === "guest_form") {
      const config = node.data.config;
      if (!config?.questions || config.questions.length === 0) {
        errors.push(
          `Guest Form "${node.data.label}" needs at least one question`
        );
      } else {
        // Validate each question
        config.questions.forEach((question: { variableName?: string; question?: string; type?: string; options?: string[] }, index: number) => {
          if (!question.variableName) {
            errors.push(
              `Guest Form "${node.data.label}" question ${index + 1} needs a variable name`
            );
          }
          if (!question.question) {
            errors.push(
              `Guest Form "${node.data.label}" question ${index + 1} needs question text`
            );
          }
          if (question.type === "choice" && (!question.options || question.options.length === 0)) {
            errors.push(
              `Guest Form "${node.data.label}" question ${index + 1} (choice type) needs options`
            );
          }
        });
      }
      // Validate confirmation settings
      if (config?.enableConfirmation) {
        if (!config.confirmationMessage) {
          warnings.push(
            `Guest Form "${node.data.label}" has confirmation enabled but no message`
          );
        }
        if (!config.confirmYesKeywords || config.confirmYesKeywords.length === 0) {
          warnings.push(
            `Guest Form "${node.data.label}" has no "Yes" keywords configured`
          );
        }
        if (!config.confirmNoKeywords || config.confirmNoKeywords.length === 0) {
          warnings.push(
            `Guest Form "${node.data.label}" has no "No" keywords configured`
          );
        }
      }
      // Validate jump to node reference
      if (config?.onMaxRetry?.action === "jump_to_node" && !config.onMaxRetry.jumpToNodeId) {
        errors.push(
          `Guest Form "${node.data.label}" has jump action but no target node selected`
        );
      }
      // Validate jump target exists
      if (config?.onMaxRetry?.jumpToNodeId) {
        const targetExists = nodes.some(n => n.id === config.onMaxRetry.jumpToNodeId);
        if (!targetExists) {
          errors.push(
            `Guest Form "${node.data.label}" references a non-existent jump target node`
          );
        }
      }
    }

    // Update guest validation
    if (node.type === "update_guest") {
      const config = node.data.config;
      if (config?.action === "add_tag" && !config.tagName) {
        errors.push(`Update Guest "${node.data.label}" needs a tag name`);
      }
      if (config?.action === "remove_tag" && !config.tagName) {
        errors.push(`Update Guest "${node.data.label}" needs a tag name`);
      }
      if (config?.action === "update_rsvp" && !config.rsvpStatus) {
        errors.push(
          `Update Guest "${node.data.label}" needs an RSVP status`
        );
      }
      if (config?.action === "update_field" && !config.fieldName) {
        errors.push(`Update Guest "${node.data.label}" needs a field name`);
      }
      if (config?.action === "map_from_variables") {
        if (!config.variableMappings || config.variableMappings.length === 0) {
          errors.push(
            `Update Guest "${node.data.label}" needs at least one variable mapping`
          );
        } else {
          // Validate each mapping
          config.variableMappings.forEach((mapping: { sourceVariable?: string; targetField?: string }, index: number) => {
            if (!mapping.sourceVariable) {
              errors.push(
                `Update Guest "${node.data.label}" mapping ${index + 1} needs a source variable`
              );
            }
            if (!mapping.targetField) {
              errors.push(
                `Update Guest "${node.data.label}" mapping ${index + 1} needs a target field`
              );
            }
          });
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function detectCircularDependency(
  nodes: ChatflowNode[],
  edges: ChatflowEdge[]
): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const outgoingEdges = edges.filter((e) => e.source === nodeId);

    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (dfs(edge.target)) return true;
      } else if (recursionStack.has(edge.target)) {
        return true; // Circular dependency found
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  // Start DFS from trigger node
  const trigger = nodes.find((n) => n.type === "trigger");
  if (!trigger) return false;

  return dfs(trigger.id);
}
