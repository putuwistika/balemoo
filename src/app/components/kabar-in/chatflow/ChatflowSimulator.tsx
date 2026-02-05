import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X, Play, RotateCcw, Send } from "lucide-react";
import type { Chatflow, ChatflowNode, GuestFormConfig, FormQuestion } from "@/app/types/chatflow";
import { useTemplates } from "@/app/contexts/TemplateContext";

interface ChatflowSimulatorProps {
  chatflow: Chatflow;
  onClose: () => void;
}

interface Message {
  id: string;
  type: "sent" | "received";
  content: string;
  timestamp: Date;
}

interface LogEntry {
  timestamp: Date;
  nodeId: string;
  nodeName: string;
  action: string;
  result: "success" | "error" | "waiting";
  message: string;
}

export function ChatflowSimulator({
  chatflow,
  onClose,
}: ChatflowSimulatorProps) {
  const { templates } = useTemplates();
  const [messages, setMessages] = useState<Message[]>([]);
  const [executionLog, setExecutionLog] = useState<LogEntry[]>([]);
  const [variables, setVariables] = useState<Record<string, any>>({
    "guest.name": "Test User",
    "guest.phone": "+6281234567890",
    "guest.email": "test@example.com",
    "event.name": "Wedding Event",
    "event.date": "January 20, 2026",
    "event.venue": "Grand Ballroom",
  });
  
  // Use ref to always get latest variables value
  const variablesRef = useRef(variables);
  variablesRef.current = variables;
  
  // Ref for auto-scrolling execution log
  const executionLogRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [userInput, setUserInput] = useState("");
  
  // Retry tracking for wait_reply validation
  const [retryCount, setRetryCount] = useState(0);
  
  // Guest Form state
  const [guestFormState, setGuestFormState] = useState<{
    isActive: boolean;
    nodeId: string | null;
    currentQuestionIndex: number;
    questionRetryCount: number;
    confirmRetryCount: number;
    isConfirmationPhase: boolean;
    collectedAnswers: Record<string, string>;
  }>({
    isActive: false,
    nodeId: null,
    currentQuestionIndex: 0,
    questionRetryCount: 0,
    confirmRetryCount: 0,
    isConfirmationPhase: false,
    collectedAnswers: {},
  });
  
  // Auto-scroll execution log to bottom when new log added
  useEffect(() => {
    if (executionLogRef.current) {
      executionLogRef.current.scrollTop = executionLogRef.current.scrollHeight;
    }
  }, [executionLog]);
  
  // Auto-scroll messages to bottom when new message added
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: Date.now().toString(),
        timestamp: new Date(),
      },
    ]);
  };

  const addLog = (log: Omit<LogEntry, "timestamp">) => {
    setExecutionLog((prev) => [
      ...prev,
      {
        ...log,
        timestamp: new Date(),
      },
    ]);
  };

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const findNextNode = (currentNodeId: string, sourceHandle?: string): ChatflowNode | null => {
    // If sourceHandle is specified (for condition nodes), find edge with matching sourceHandle
    const edge = sourceHandle
      ? chatflow.edges.find((e) => e.source === currentNodeId && e.sourceHandle === sourceHandle)
      : chatflow.edges.find((e) => e.source === currentNodeId);
    
    if (!edge) return null;
    return chatflow.nodes.find((n) => n.id === edge.target) || null;
  };

  const executeNode = async (node: ChatflowNode) => {
    console.log('⚡ [EXECUTE NODE] Starting:', node.type, node.data.label, node.id);
    setCurrentNodeId(node.id);

    try {
    switch (node.type) {
      case "trigger":
        addLog({
          nodeId: node.id,
          nodeName: node.data.label,
          action: "Start Flow",
          result: "success",
          message: "Flow triggered",
        });

        const nextNode = findNextNode(node.id);
        if (nextNode) {
          await delay(500);
          await executeNode(nextNode);
        }
        break;

      case "send_template":
        const templateConfig = node.data.config;
        const templateId = templateConfig?.templateId;

        // Find the template
        const template = templates.find((t) => t.id === templateId);

        if (template) {
          addLog({
            nodeId: node.id,
            nodeName: node.data.label,
            action: "Send Template",
            result: "success",
            message: `Sending "${template.name}"`,
          });

          // Replace variables in template body
          let messageContent = template.content.body.text;
          
          console.log('📤 [SEND TEMPLATE] Original message:', messageContent);
          console.log('📤 [SEND TEMPLATE] Config variables:', templateConfig?.variables);
          console.log('📤 [SEND TEMPLATE] Available variables:', variablesRef.current);

          // Replace from config variable mapping
          if (templateConfig?.variables) {
            Object.entries(templateConfig.variables).forEach(([placeholderName, mapping]) => {
              // placeholderName: "name", "time", "location", etc (tanpa {{}})
              // mapping: "{{guest.name}}", "{{event.date}}", etc (dengan {{}})
              
              // Clean mapping dari {{}} untuk lookup di variables
              const cleanMapping = (mapping as string).replace(/\{\{|\}\}/g, '');
              
              // Get value from variables
              const value = variablesRef.current[cleanMapping] || `[${placeholderName}]`;
              
              console.log(`📤 [SEND TEMPLATE] Replace {{${placeholderName}}} with "${value}" (from ${cleanMapping})`);
              
              // Replace {{placeholderName}} in message
              const regex = new RegExp(`\\{\\{${placeholderName}\\}\\}`, "g");
              messageContent = messageContent.replace(regex, value as string);
            });
          }
          
          // Also replace any remaining {{variable}} with direct values from variables
          Object.entries(variablesRef.current).forEach(([key, value]) => {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
            messageContent = messageContent.replace(regex, value);
          });
          
          console.log('📤 [SEND TEMPLATE] Final message:', messageContent);

          addMessage({
            type: "sent",
            content: messageContent,
          });
        } else {
          addLog({
            nodeId: node.id,
            nodeName: node.data.label,
            action: "Send Template",
            result: "error",
            message: "Template not found or not configured",
          });

          addMessage({
            type: "sent",
            content: "[Template not configured]",
          });
        }

        const nextSend = findNextNode(node.id);
        if (nextSend) {
          await delay(1000);
          await executeNode(nextSend);
        }
        break;

      case "wait_reply":
        const waitConfig = node.data.config;
        addLog({
          nodeId: node.id,
          nodeName: node.data.label,
          action: "Wait Reply",
          result: "waiting",
          message: waitConfig?.expectedValues
            ? `Waiting for user input (expected: ${waitConfig.expectedValues.join(", ")})...`
            : "Waiting for user input...",
        });

        setIsPaused(true);
        setRetryCount(0); // Reset retry count
        break;

      case "condition":
        const condConfig = node.data.config;
        
        console.log('🔍 [CONDITION NODE] Starting evaluation:', {
          nodeId: node.id,
          nodeName: node.data.label,
          config: condConfig,
          allVariables: variablesRef.current,
        });
        
        // Get variable value from ref (always latest)
        const variableValue = variablesRef.current[condConfig?.variable || ""];
        const compareValue = condConfig?.value || "";
        const operator = condConfig?.operator || "equals";
        const caseSensitive = condConfig?.caseSensitive || false;
        
        console.log('🔍 [CONDITION NODE] Values to compare:', {
          variableName: condConfig?.variable,
          variableValue,
          compareValue,
          operator,
          caseSensitive,
        });
        
        // Prepare values for comparison (handle case sensitivity)
        let varVal = variableValue !== undefined ? String(variableValue) : "";
        let compVal = compareValue;
        
        if (!caseSensitive) {
          varVal = varVal.toLowerCase();
          compVal = compVal.toLowerCase();
        }
        
        console.log('🔍 [CONDITION NODE] After case handling:', {
          varVal,
          compVal,
        });
        
        // Evaluate condition based on operator
        let conditionResult = false;
        
        try {
          switch (operator) {
            case "equals":
              conditionResult = varVal === compVal;
              break;
            case "not_equals":
              conditionResult = varVal !== compVal;
              break;
            case "contains":
              conditionResult = varVal.includes(compVal);
              break;
            case "matches":
              // Regex matching
              const regex = new RegExp(compVal, caseSensitive ? "" : "i");
              conditionResult = regex.test(String(variableValue));
              break;
            default:
              conditionResult = false;
          }
        } catch (error) {
          console.error("Error evaluating condition:", error);
          conditionResult = false;
        }
        
        console.log('🔍 [CONDITION NODE] Condition result:', conditionResult);
        
        addLog({
          nodeId: node.id,
          nodeName: node.data.label,
          action: "Evaluate Condition",
          result: "success",
          message: `${condConfig?.variable} ${operator} "${compareValue}" → ${conditionResult ? "TRUE" : "FALSE"} (value: "${variableValue}")`,
        });

        // Find all edges from this node
        const allEdgesFromNode = chatflow.edges.filter(e => e.source === node.id);
        console.log('🔍 [CONDITION NODE] All edges from this node:', allEdgesFromNode);
        
        // Find next node based on condition result
        const targetHandle = conditionResult ? "true" : "false";
        console.log('🔍 [CONDITION NODE] Looking for edge with sourceHandle:', targetHandle);
        
        const nextCond = findNextNode(node.id, targetHandle);
        console.log('🔍 [CONDITION NODE] Next node found:', nextCond?.id, nextCond?.data?.label);
        
        if (nextCond) {
          await delay(800);
          await executeNode(nextCond);
        } else {
          addLog({
            nodeId: node.id,
            nodeName: node.data.label,
            action: "Condition Error",
            result: "error",
            message: `No ${conditionResult ? "TRUE" : "FALSE"} path defined. Please connect both true and false edges.`,
          });
          setIsRunning(false);
        }
        break;

      case "delay":
        const duration = node.data.config?.duration || 1;
        addLog({
          nodeId: node.id,
          nodeName: node.data.label,
          action: "Delay",
          result: "success",
          message: `Waiting ${duration} seconds...`,
        });

        await delay(duration * 1000);

        const nextDelay = findNextNode(node.id);
        if (nextDelay) {
          await executeNode(nextDelay);
        }
        break;

      case "set_variable":
        const setVarConfig = node.data.config;
        if (setVarConfig?.variableName && setVarConfig?.value) {
          setVariables((prev) => ({
            ...prev,
            [setVarConfig.variableName]: setVarConfig.value,
          }));
          
          addLog({
            nodeId: node.id,
            nodeName: node.data.label,
            action: "Set Variable",
            result: "success",
            message: `Set ${setVarConfig.variableName} = "${setVarConfig.value}"`,
          });
        } else {
          addLog({
            nodeId: node.id,
            nodeName: node.data.label,
            action: "Set Variable",
            result: "error",
            message: "Variable name or value not configured",
          });
        }

        const nextSetVar = findNextNode(node.id);
        if (nextSetVar) {
          await delay(500);
          await executeNode(nextSetVar);
        }
        break;

      case "update_guest":
        const updateGuestConfig = node.data.config;
        addLog({
          nodeId: node.id,
          nodeName: node.data.label,
          action: "Update Guest",
          result: "success",
          message: `Guest data would be updated (simulation only)`,
        });

        const nextUpdateGuest = findNextNode(node.id);
        if (nextUpdateGuest) {
          await delay(500);
          await executeNode(nextUpdateGuest);
        }
        break;

      case "guest_form":
        const guestFormConfig = node.data.config as GuestFormConfig | null;
        
        if (!guestFormConfig || !guestFormConfig.questions || guestFormConfig.questions.length === 0) {
          addLog({
            nodeId: node.id,
            nodeName: node.data.label,
            action: "Guest Form Error",
            result: "error",
            message: "No questions configured in guest form",
          });
          
          const nextAfterError = findNextNode(node.id);
          if (nextAfterError) {
            await delay(500);
            await executeNode(nextAfterError);
          }
          break;
        }
        
        addLog({
          nodeId: node.id,
          nodeName: node.data.label,
          action: "Start Guest Form",
          result: "success",
          message: `Starting form with ${guestFormConfig.questions.length} question(s)`,
        });
        
        // Initialize guest form state
        setGuestFormState({
          isActive: true,
          nodeId: node.id,
          currentQuestionIndex: 0,
          questionRetryCount: 0,
          confirmRetryCount: 0,
          isConfirmationPhase: false,
          collectedAnswers: {},
        });
        
        // Ask first question
        const firstQuestion = guestFormConfig.questions[0];
        const firstQuestionText = firstQuestion.promptMessage || firstQuestion.question;
        
        // Add options if it's a choice question
        let questionMessage = firstQuestionText;
        if (firstQuestion.type === 'choice' && firstQuestion.options && firstQuestion.options.length > 0) {
          questionMessage += `\n\nPilihan: ${firstQuestion.options.join(", ")}`;
        }
        
        addMessage({
          type: "sent",
          content: questionMessage,
        });
        
        addLog({
          nodeId: node.id,
          nodeName: node.data.label,
          action: "Ask Question",
          result: "waiting",
          message: `Q1/${guestFormConfig.questions.length}: ${firstQuestion.variableName}`,
        });
        
        setIsPaused(true);
        break;

      case "end":
        addLog({
          nodeId: node.id,
          nodeName: node.data.label,
          action: "End Flow",
          result: "success",
          message: "Flow completed",
        });

        setIsRunning(false);
        setCurrentNodeId(null);
        break;
    }
    } catch (error) {
      console.error('⚡ [EXECUTE NODE] Error executing node:', node.id, error);
      addLog({
        nodeId: node.id,
        nodeName: node.data.label,
        action: "Execution Error",
        result: "error",
        message: `Error: ${error instanceof Error ? error.message : String(error)}`,
      });
      setIsRunning(false);
    }
  };

  const handleStart = async () => {
    console.log('🎮 [SIMULATOR] Starting flow test...');

    // Safety check
    if (!chatflow || !chatflow.nodes || chatflow.nodes.length === 0) {
      console.error('🎮 [SIMULATOR] No nodes in chatflow!');
      addLog({
        nodeId: 'system',
        nodeName: 'System',
        action: 'Error',
        result: 'error',
        message: 'No nodes found in chatflow. Please add nodes to the flow first.',
      });
      return;
    }

    const triggerNode = chatflow.nodes.find((n) => n.type === "trigger");

    if (!triggerNode) {
      console.error('🎮 [SIMULATOR] No trigger node found!');
      addLog({
        nodeId: 'system',
        nodeName: 'System',
        action: 'Error',
        result: 'error',
        message: 'No trigger node found. Please add a Trigger node to start the flow.',
      });
      setIsRunning(true);
      return;
    }

    setMessages([]);
    setExecutionLog([]);
    // Keep default variables for testing
    setVariables({
      "guest.name": "Test User",
      "guest.phone": "+6281234567890",
      "guest.email": "test@example.com",
      "event.name": "Wedding Event",
      "event.date": "January 20, 2026",
      "event.venue": "Grand Ballroom",
    });
    setIsRunning(true);
    setIsPaused(false);
    setRetryCount(0);

    try {
      await executeNode(triggerNode);
    } catch (error) {
      console.error('🎮 [SIMULATOR] Execution error:', error);
      addLog({
        nodeId: 'system',
        nodeName: 'System',
        action: 'Error',
        result: 'error',
        message: `Execution error: ${error instanceof Error ? error.message : String(error)}`,
      });
      setIsRunning(false);
    }
  };

  const handleSendReply = async () => {
    if (!userInput.trim() || !isPaused) return;

    console.log('💬 [SEND REPLY] User input:', userInput);
    console.log('💬 [SEND REPLY] Current node ID:', currentNodeId);
    console.log('💬 [SEND REPLY] Guest form active:', guestFormState.isActive);

    addMessage({
      type: "received",
      content: userInput,
    });

    // Handle Guest Form responses
    if (guestFormState.isActive && guestFormState.nodeId) {
      await handleGuestFormReply(userInput.trim());
      setUserInput("");
      return;
    }

    // Get current wait_reply node
    const currentNode = chatflow.nodes.find((n) => n.id === currentNodeId);
    console.log('💬 [SEND REPLY] Current node:', currentNode);
    console.log('💬 [SEND REPLY] Config saveAs:', currentNode?.data.config?.saveAs);
    
    // Validate input if expectedValues is configured
    const waitConfig = currentNode?.data.config;
    if (waitConfig?.expectedValues && waitConfig.expectedValues.length > 0) {
      const caseSensitive = waitConfig.caseSensitive || false;
      const userInputNormalized = caseSensitive ? userInput.trim() : userInput.trim().toLowerCase();
      const expectedValuesNormalized = waitConfig.expectedValues.map((v: string) => 
        caseSensitive ? v : v.toLowerCase()
      );
      
      console.log('🔍 [VALIDATION] Expected values:', expectedValuesNormalized);
      console.log('🔍 [VALIDATION] User input (normalized):', userInputNormalized);
      
      const isValid = expectedValuesNormalized.includes(userInputNormalized);
      console.log('🔍 [VALIDATION] Is valid:', isValid);
      
      if (!isValid) {
        // Invalid input - check retry count
        const maxRetries = waitConfig.maxRetries || 3;
        const currentRetry = retryCount + 1;
        
        console.log('⚠️ [VALIDATION] Invalid input. Retry', currentRetry, '/', maxRetries);
        
        if (currentRetry < maxRetries) {
          // Send retry message
          const retryMessage = waitConfig.retryMessage || 
            `Maaf, mohon jawab dengan salah satu dari: ${waitConfig.expectedValues.join(", ")}`;
          
          addMessage({
            type: "sent",
            content: retryMessage,
          });
          
          addLog({
            nodeId: currentNode!.id,
            nodeName: currentNode!.data.label,
            action: "Validation Failed",
            result: "error",
            message: `Invalid input "${userInput}". Retry ${currentRetry}/${maxRetries}`,
          });
          
          setRetryCount(currentRetry);
          setUserInput("");
          // Stay paused, wait for another input
          return;
        } else {
          // Max retries reached
          const fallbackAction = waitConfig.fallbackAction || 'end';
          const fallbackMessage = waitConfig.fallbackMessage || 
            "Maaf, kami tidak dapat memproses jawaban Anda.";
          
          addLog({
            nodeId: currentNode!.id,
            nodeName: currentNode!.data.label,
            action: "Max Retries Reached",
            result: "error",
            message: `Max retries (${maxRetries}) reached. Action: ${fallbackAction}`,
          });
          
          // Send fallback message
          addMessage({
            type: "sent",
            content: fallbackMessage,
          });
          
          setRetryCount(0);
          setUserInput("");
          
          if (fallbackAction === 'end') {
            // End flow
            setIsPaused(false);
            addLog({
              nodeId: currentNode!.id,
              nodeName: currentNode!.data.label,
              action: "End Flow",
              result: "error",
              message: "Flow ended due to max retries reached",
            });
            setIsRunning(false);
            setCurrentNodeId(null);
            return; // Don't continue to next node
          } else if (fallbackAction === 'wait_again') {
            // Wait for reply again (stay paused, reset retry count)
            addLog({
              nodeId: currentNode!.id,
              nodeName: currentNode!.data.label,
              action: "Wait for Reply Again",
              result: "error",
              message: "Waiting for user input again (unlimited retries after fallback)",
            });
            // Stay paused (isPaused is already true)
            // Retry count already reset to 0
            return; // Don't continue, wait for new input
          }
          
          // If fallbackAction === 'continue', flow continues below to save variable
          setIsPaused(false);
          addLog({
            nodeId: currentNode!.id,
            nodeName: currentNode!.data.label,
            action: "Continue with Invalid",
            result: "error",
            message: `Continuing flow with invalid input: "${userInput}"`,
          });
        }
      } else {
        // Valid input
        addLog({
          nodeId: currentNode!.id,
          nodeName: currentNode!.data.label,
          action: "Validation Success",
          result: "success",
          message: `Valid input: "${userInput}"`,
        });
        setRetryCount(0);
      }
    }
    
    let updatedVariables = variablesRef.current;
    
    if (currentNode?.data.config?.saveAs) {
      const variableName = currentNode.data.config.saveAs;
      console.log('💬 [SEND REPLY] Saving to variable:', variableName, '=', userInput);
      
      // Update variables synchronously for immediate use
      updatedVariables = {
        ...variablesRef.current,
        [variableName]: userInput,
      };
      
      setVariables(updatedVariables);
      console.log('💬 [SEND REPLY] Updated variables:', updatedVariables);
    } else {
      console.log('⚠️ [SEND REPLY] No saveAs configured, variable NOT saved');
    }

    setUserInput("");
    setIsPaused(false);

    // Wait a bit for state to update, then continue to next node
    await delay(100);
    
    // Continue to next node
    if (currentNodeId) {
      const nextNode = findNextNode(currentNodeId);
      console.log('💬 [SEND REPLY] Next node:', nextNode?.id, nextNode?.data?.label);
      if (nextNode) {
        await delay(400);
        await executeNode(nextNode);
      }
    }
  };

  // Handle Guest Form Reply
  const handleGuestFormReply = async (input: string) => {
    const formNode = chatflow.nodes.find((n) => n.id === guestFormState.nodeId);
    if (!formNode) return;
    
    const config = formNode.data.config as GuestFormConfig;
    const questions = config.questions;
    
    // If in confirmation phase
    if (guestFormState.isConfirmationPhase) {
      const yesKeywords = config.confirmYesKeywords || ['ya', 'yes', 'benar', 'ok'];
      const noKeywords = config.confirmNoKeywords || ['tidak', 'no', 'salah', 'ulang'];
      
      const inputLower = input.toLowerCase();
      
      if (yesKeywords.some(k => inputLower === k.toLowerCase())) {
        // Confirmed! Save all variables and continue
        addLog({
          nodeId: formNode.id,
          nodeName: formNode.data.label,
          action: "Form Confirmed",
          result: "success",
          message: "User confirmed all answers",
        });
        
        // Save all collected answers to variables
        const newVariables = { ...variablesRef.current, ...guestFormState.collectedAnswers };
        setVariables(newVariables);
        variablesRef.current = newVariables;
        
        // Reset form state
        setGuestFormState({
          isActive: false,
          nodeId: null,
          currentQuestionIndex: 0,
          questionRetryCount: 0,
          confirmRetryCount: 0,
          isConfirmationPhase: false,
          collectedAnswers: {},
        });
        
        setIsPaused(false);
        
        // Continue to next node (confirmed path)
        const nextNode = findNextNode(formNode.id, "confirmed");
        if (nextNode) {
          await delay(500);
          await executeNode(nextNode);
        } else {
          // Try default path
          const defaultNext = findNextNode(formNode.id);
          if (defaultNext) {
            await delay(500);
            await executeNode(defaultNext);
          }
        }
        return;
        
      } else if (noKeywords.some(k => inputLower === k.toLowerCase())) {
        // User wants to re-enter - restart form
        const newConfirmRetry = guestFormState.confirmRetryCount + 1;
        const maxConfirmRetries = config.maxConfirmRetries || 3;
        
        if (newConfirmRetry >= maxConfirmRetries) {
          // Max confirm retries reached
          addLog({
            nodeId: formNode.id,
            nodeName: formNode.data.label,
            action: "Max Confirm Retries",
            result: "error",
            message: `Max confirmation retries (${maxConfirmRetries}) reached`,
          });
          
          await handleGuestFormMaxRetry(formNode, config);
          return;
        }
        
        addLog({
          nodeId: formNode.id,
          nodeName: formNode.data.label,
          action: "Re-enter Data",
          result: "success",
          message: `User wants to re-enter. Retry ${newConfirmRetry}/${maxConfirmRetries}`,
        });
        
        // Restart from first question
        setGuestFormState(prev => ({
          ...prev,
          currentQuestionIndex: 0,
          questionRetryCount: 0,
          confirmRetryCount: newConfirmRetry,
          isConfirmationPhase: false,
          collectedAnswers: {},
        }));
        
        // Ask first question again
        const firstQ = questions[0];
        let qMessage = firstQ.promptMessage || firstQ.question;
        if (firstQ.type === 'choice' && firstQ.options) {
          qMessage += `\n\nPilihan: ${firstQ.options.join(", ")}`;
        }
        
        addMessage({ type: "sent", content: qMessage });
        return;
        
      } else {
        // Invalid confirmation response
        addMessage({
          type: "sent",
          content: `Mohon jawab dengan "${yesKeywords[0]}" atau "${noKeywords[0]}"`,
        });
        return;
      }
    }
    
    // Regular question phase
    const currentQuestion = questions[guestFormState.currentQuestionIndex];
    
    // Validate answer
    const validationResult = validateQuestionAnswer(currentQuestion, input);
    
    if (!validationResult.valid) {
      const newRetry = guestFormState.questionRetryCount + 1;
      const maxRetries = config.maxQuestionRetries || 3;
      
      if (newRetry >= maxRetries) {
        // Max question retries reached
        addLog({
          nodeId: formNode.id,
          nodeName: formNode.data.label,
          action: "Max Question Retries",
          result: "error",
          message: `Max retries for question "${currentQuestion.variableName}"`,
        });
        
        await handleGuestFormMaxRetry(formNode, config);
        return;
      }
      
      addLog({
        nodeId: formNode.id,
        nodeName: formNode.data.label,
        action: "Invalid Answer",
        result: "error",
        message: `${validationResult.error}. Retry ${newRetry}/${maxRetries}`,
      });
      
      setGuestFormState(prev => ({
        ...prev,
        questionRetryCount: newRetry,
      }));
      
      // Send error message
      const errorMsg = currentQuestion.errorMessage || validationResult.error || "Jawaban tidak valid";
      addMessage({ type: "sent", content: errorMsg });
      return;
    }
    
    // Valid answer - save and move to next question
    const newAnswers = {
      ...guestFormState.collectedAnswers,
      [currentQuestion.variableName]: input,
    };
    
    addLog({
      nodeId: formNode.id,
      nodeName: formNode.data.label,
      action: "Answer Saved",
      result: "success",
      message: `${currentQuestion.variableName} = "${input}"`,
    });
    
    const nextIndex = guestFormState.currentQuestionIndex + 1;
    
    if (nextIndex < questions.length) {
      // More questions to ask
      setGuestFormState(prev => ({
        ...prev,
        currentQuestionIndex: nextIndex,
        questionRetryCount: 0,
        collectedAnswers: newAnswers,
      }));
      
      const nextQ = questions[nextIndex];
      let qMessage = nextQ.promptMessage || nextQ.question;
      if (nextQ.type === 'choice' && nextQ.options) {
        qMessage += `\n\nPilihan: ${nextQ.options.join(", ")}`;
      }
      
      await delay(500);
      addMessage({ type: "sent", content: qMessage });
      
      addLog({
        nodeId: formNode.id,
        nodeName: formNode.data.label,
        action: "Ask Question",
        result: "waiting",
        message: `Q${nextIndex + 1}/${questions.length}: ${nextQ.variableName}`,
      });
      
    } else {
      // All questions answered
      setGuestFormState(prev => ({
        ...prev,
        collectedAnswers: newAnswers,
      }));
      
      if (config.enableConfirmation) {
        // Show confirmation
        let confirmMsg = config.confirmationMessage || "Data yang Anda masukkan:\n";
        
        // Replace variables in confirmation message
        Object.entries(newAnswers).forEach(([key, value]) => {
          const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
          confirmMsg = confirmMsg.replace(regex, value);
        });
        
        // If no custom message, build default summary
        if (!config.confirmationMessage) {
          confirmMsg = "Data yang Anda masukkan:\n";
          questions.forEach(q => {
            confirmMsg += `• ${q.question}: ${newAnswers[q.variableName] || '-'}\n`;
          });
          confirmMsg += "\nApakah sudah benar? (Ya/Tidak)";
        }
        
        setGuestFormState(prev => ({
          ...prev,
          isConfirmationPhase: true,
          collectedAnswers: newAnswers,
        }));
        
        await delay(500);
        addMessage({ type: "sent", content: confirmMsg });
        
        addLog({
          nodeId: formNode.id,
          nodeName: formNode.data.label,
          action: "Confirm Data",
          result: "waiting",
          message: "Waiting for confirmation...",
        });
        
      } else {
        // No confirmation needed - save and continue
        addLog({
          nodeId: formNode.id,
          nodeName: formNode.data.label,
          action: "Form Complete",
          result: "success",
          message: "All questions answered",
        });
        
        // Save all collected answers to variables
        const finalVariables = { ...variablesRef.current, ...newAnswers };
        setVariables(finalVariables);
        variablesRef.current = finalVariables;
        
        // Reset form state
        setGuestFormState({
          isActive: false,
          nodeId: null,
          currentQuestionIndex: 0,
          questionRetryCount: 0,
          confirmRetryCount: 0,
          isConfirmationPhase: false,
          collectedAnswers: {},
        });
        
        setIsPaused(false);
        
        // Continue to next node
        const nextNode = findNextNode(formNode.id, "confirmed") || findNextNode(formNode.id);
        if (nextNode) {
          await delay(500);
          await executeNode(nextNode);
        }
      }
    }
  };

  // Validate question answer based on type
  const validateQuestionAnswer = (question: FormQuestion, answer: string): { valid: boolean; error?: string } => {
    if (question.required && !answer.trim()) {
      return { valid: false, error: "Jawaban tidak boleh kosong" };
    }
    
    switch (question.type) {
      case 'number':
        const num = parseInt(answer);
        if (isNaN(num)) {
          return { valid: false, error: "Mohon masukkan angka" };
        }
        if (question.min !== undefined && num < question.min) {
          return { valid: false, error: `Minimal ${question.min}` };
        }
        if (question.max !== undefined && num > question.max) {
          return { valid: false, error: `Maksimal ${question.max}` };
        }
        return { valid: true };
        
      case 'choice':
        if (question.options && question.options.length > 0) {
          const optionsLower = question.options.map(o => o.toLowerCase());
          if (!optionsLower.includes(answer.toLowerCase())) {
            return { valid: false, error: `Pilih salah satu: ${question.options.join(", ")}` };
          }
        }
        return { valid: true };
        
      case 'text':
      default:
        return { valid: true };
    }
  };

  // Handle max retry for guest form
  const handleGuestFormMaxRetry = async (formNode: ChatflowNode, config: GuestFormConfig) => {
    const onMaxRetry = config.onMaxRetry;
    
    if (onMaxRetry?.sendCSMessage && onMaxRetry.csMessage) {
      addMessage({ type: "sent", content: onMaxRetry.csMessage });
    }
    
    // Reset form state
    setGuestFormState({
      isActive: false,
      nodeId: null,
      currentQuestionIndex: 0,
      questionRetryCount: 0,
      confirmRetryCount: 0,
      isConfirmationPhase: false,
      collectedAnswers: {},
    });
    
    setIsPaused(false);
    
    if (onMaxRetry?.action === 'jump_to_node' && onMaxRetry.jumpToNodeId) {
      const jumpTarget = chatflow.nodes.find(n => n.id === onMaxRetry.jumpToNodeId);
      if (jumpTarget) {
        addLog({
          nodeId: formNode.id,
          nodeName: formNode.data.label,
          action: "Jump to Node",
          result: "success",
          message: `Jumping to ${jumpTarget.data.label}`,
        });
        await delay(500);
        await executeNode(jumpTarget);
        return;
      }
    }
    
    // Default: try max_retry handle or end
    const maxRetryNext = findNextNode(formNode.id, "max_retry");
    if (maxRetryNext) {
      await delay(500);
      await executeNode(maxRetryNext);
    } else {
      addLog({
        nodeId: formNode.id,
        nodeName: formNode.data.label,
        action: "End Flow",
        result: "error",
        message: "Flow ended due to max retries",
      });
      setIsRunning(false);
      setCurrentNodeId(null);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setExecutionLog([]);
    // Keep default variables for testing
    setVariables({
      "guest.name": "Test User",
      "guest.phone": "+6281234567890",
      "guest.email": "test@example.com",
      "event.name": "Wedding Event",
      "event.date": "January 20, 2026",
      "event.venue": "Grand Ballroom",
    });
    setCurrentNodeId(null);
    setIsRunning(false);
    setIsPaused(false);
    setUserInput("");
    setRetryCount(0);
    // Reset guest form state
    setGuestFormState({
      isActive: false,
      nodeId: null,
      currentQuestionIndex: 0,
      questionRetryCount: 0,
      confirmRetryCount: 0,
      isConfirmationPhase: false,
      collectedAnswers: {},
    });
  };

  const modalContent = (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.6)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff",
            borderRadius: "24px",
            width: "90vw",
            height: "85vh",
            maxWidth: "1200px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 24px 48px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
            }}
          >
            <h2
              style={{ fontSize: "1.25rem", fontWeight: 600, color: "#fff" }}
            >
              Flow Simulator - {chatflow?.name || 'Unknown'}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "none",
                borderRadius: "8px",
                padding: "8px",
                cursor: "pointer",
              }}
            >
              <X size={24} style={{ color: "#fff" }} />
            </button>
          </div>

          {/* Main Content */}
          <div
            style={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "400px 300px",
              gap: "1px",
              background: "#e5e7eb",
              overflow: "hidden",
            }}
          >
            {/* Left: WhatsApp Chat */}
            <div
              style={{
                background: "#ece5dd",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Chat Header */}
              <div
                style={{
                  background: "#075e54",
                  padding: "12px 16px",
                  color: "#fff",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                }}
              >
                Test User
              </div>

              {/* Messages */}
              <div
                ref={messagesRef}
                style={{
                  flex: 1,
                  padding: "16px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  minHeight: 0,
                }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.type === "sent" ? "flex-end" : "flex-start",
                      background: msg.type === "sent" ? "#dcf8c6" : "#fff",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      maxWidth: "70%",
                      fontSize: "0.875rem",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>

              {/* Input */}
              <div
                style={{
                  padding: "12px",
                  background: "#f0f0f0",
                  display: "flex",
                  gap: "8px",
                }}
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendReply()}
                  placeholder={
                    isPaused ? "Type a message..." : "Waiting for flow..."
                  }
                  disabled={!isPaused}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "20px",
                    border: "none",
                    fontSize: "0.875rem",
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!isPaused || !userInput.trim()}
                  style={{
                    background: isPaused ? "#25d366" : "#ccc",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: "36px",
                    height: "36px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isPaused ? "pointer" : "not-allowed",
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>

            {/* Right: Variables & Log */}
            <div
              style={{
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Variables */}
              <div
                style={{
                  padding: "16px",
                  borderBottom: "1px solid #e5e7eb",
                  maxHeight: "200px",
                  overflowY: "auto",
                }}
              >
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                >
                  Variables
                </h3>
                {Object.entries(variables).map(([key, value]) => (
                  <div
                    key={key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.75rem",
                      marginBottom: "6px",
                      padding: "4px 8px",
                      background: "#f9fafb",
                      borderRadius: "4px",
                    }}
                  >
                    <span style={{ color: "#6b7280" }}>{key}:</span>
                    <span style={{ fontWeight: 500 }}>
                      {JSON.stringify(value)}
                    </span>
                  </div>
                ))}
                {Object.keys(variables).length === 0 && (
                  <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                    No variables yet
                  </div>
                )}
              </div>

              {/* Execution Log */}
              <div
                ref={executionLogRef}
                style={{
                  flex: 1,
                  padding: "16px",
                  overflowY: "auto",
                  minHeight: 0,
                }}
              >
                <h3
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "12px",
                  }}
                >
                  Execution Log
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {executionLog.map((log, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "8px",
                        background:
                          log.result === "error"
                            ? "#fee2e2"
                            : log.result === "waiting"
                              ? "#fef3c7"
                              : "#d1fae5",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                      }}
                    >
                      <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                        {log.nodeName}
                      </div>
                      <div style={{ color: "#6b7280", wordBreak: "break-word" }}>
                        {log.action}: {log.message}
                      </div>
                    </div>
                  ))}
                  {executionLog.length === 0 && (
                    <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                      No logs yet. Click Start to begin.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #e5e7eb",
              display: "flex",
              gap: "12px",
              justifyContent: "center",
              background: "#f9fafb",
              position: "relative",
              zIndex: 10,
            }}
          >
            {!isRunning ? (
              <button
                type="button"
                onClick={handleStart}
                style={{
                  padding: "10px 24px",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                <Play size={16} />
                Start Flow Test
              </button>
            ) : (
              <button
                onClick={handleReset}
                style={{
                  padding: "10px 24px",
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                }}
              >
                <RotateCcw size={16} />
                Reset
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
