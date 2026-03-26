import { useState, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import axios from "axios";

import InputNode from "./components/InputNode";
import ResultNode from "./components/ResultNode";
import "./App.css";

const API_BASE = "http://localhost:5000/api";

const initialEdges = [
  {
    id: "e-input-result",
    source: "input-node",
    target: "result-node",
    sourceHandle: "output",
    targetHandle: "input",
    animated: true,
    style: { stroke: "#6366f1", strokeWidth: 2 },
  },
];

function App() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [enableBtn, setEnableBtn] = useState(true);
  const [saveStatus, setSaveStatus] = useState("");

  const initialNodes = [
    {
      id: "input-node",
      type: "inputNode",
      position: { x: 50, y: 150 },
      data: { prompt, onPromptChange: setPrompt },
    },
    {
      id: "result-node",
      type: "resultNode",
      position: { x: 550, y: 150 },
      data: { response, loading, reasoning: "" },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes whenever prompt/response/loading/reasoning change
  const syncedNodes = useMemo(() => {
    return nodes.map((node) => {
      if (node.id === "input-node") {
        return {
          ...node,
          data: { prompt, onPromptChange: setPrompt },
        };
      }
      if (node.id === "result-node") {
        // Find existing reasoning from the node state if not provided
        const currentReasoning = node.data.reasoning || "";
        return { 
          ...node, 
          data: { ...node.data, response, loading, reasoning: currentReasoning } 
        };
      }
      return node;
    });
  }, [nodes, prompt, response, loading]);

  const nodeTypes = useMemo(
    () => ({
      inputNode: InputNode,
      resultNode: ResultNode,
    }),
    []
  );

  // Run Flow — call backend AI endpoint with Streaming
  const handleRunFlow = async () => {
    setEnableBtn(false);
    setLoading(true);
    setResponse("");
    setSaveStatus("");
    
    // ⚡ Deep Reset Node Data Immediately
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === "result-node") {
          return {
            ...node,
            data: { ...node.data, response: "", reasoning: "", loading: true },
          };
        }
        return node;
      })
    );

    let localFullResponse = "";
    let localFullReasoning = "";
    let tokenQueue = [];
    let isProcessingQueue = false;

    // Helper to update specific node data efficiently
    const updateResultNode = (newText, newReasoning = "") => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === "result-node") {
            // Only stop loading if we actually have something to show
            const hasContent = newText.length > 0 || newReasoning.length > 0;
            const dataUpdate = { 
              ...node.data, 
              response: newText, 
              reasoning: newReasoning,
              loading: !hasContent 
            };
            return { ...node, data: dataUpdate };
          }
          return node;
        })
      );
    };

    // Smoothly drain the queue into state
    const processQueue = () => {
      if (tokenQueue.length === 0) {
        isProcessingQueue = false;
        return;
      }
      isProcessingQueue = true;
      
      const nextBatch = tokenQueue.splice(0, 2);
      localFullResponse += nextBatch.join("");
      setResponse(localFullResponse);
      updateResultNode(localFullResponse, localFullReasoning);

      setTimeout(processQueue, 30);
    };

    try {
      const response = await fetch(`${API_BASE}/ask-ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamBuffer = "";

      // Hide initial global loader
      setLoading(false);
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setEnableBtn(true);
          break;
        };

        streamBuffer += decoder.decode(value, { stream: true });
        let boundary = streamBuffer.lastIndexOf("\n");
        if (boundary === -1) continue;

        const completeLines = streamBuffer.substring(0, boundary).split("\n");
        streamBuffer = streamBuffer.substring(boundary + 1);

        for (const line of completeLines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;
          
          const jsonStr = trimmed.replace("data: ", "").trim();
          if (jsonStr === "[DONE]") continue;

          try {
            const data = JSON.parse(jsonStr);
            const delta = data.choices?.[0]?.delta;
            
            // Streaming Reasoning
            if (delta?.reasoning) {
              localFullReasoning += delta.reasoning;
              updateResultNode(localFullResponse, localFullReasoning);
            }
            
            // Streaming Content
            if (delta?.content) {
              tokenQueue.push(delta.content);
              if (!isProcessingQueue) processQueue();
            }
          } catch (e) {}
        }
      }
    } catch (error) {
      setResponse(`❌ Error: Failed to get AI response.`);
      setEnableBtn(true);
      setLoading(false);
    } finally {
      const finalDrain = setInterval(() => {
        if (tokenQueue.length === 0) clearInterval(finalDrain);
      }, 100);
    }
  };
 

  // Save to MongoDB
  const handleSave = async () => {
    if (!prompt.trim() || !response.trim()) return;
    setSaveStatus("saving");

    try {
      await axios.post(`${API_BASE}/save`, { prompt, response });
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <h1>Future Blink</h1>
          </div>
          <span className="badge">AI Flow</span>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={handleRunFlow}
            disabled={loading || !prompt.trim() || !enableBtn}
            id="run-flow-btn"
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <span>▶</span> Run Flow
              </>
            )}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleSave}
            disabled={!prompt.trim() || !response || loading || saveStatus === "saving"}
            id="save-btn"
          >
            {saveStatus === "saving" ? (
              <>
                <span className="btn-spinner"></span>
                Saving...
              </>
            ) : saveStatus === "saved" ? (
              <>✅ Saved!</>
            ) : saveStatus === "error" ? (
              <>❌ Error</>
            ) : (
              <>💾 Save</>
            )}
          </button>
        </div>
      </header>

      {/* React Flow Canvas */}
      <div className="flow-container">
        <ReactFlow
          nodes={syncedNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3 }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#334155" gap={20} size={1} variant="dots" />
          <Controls
            position="bottom-right"
            showInteractive={false}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default App;
