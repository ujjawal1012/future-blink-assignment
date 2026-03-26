import { Handle, Position } from "@xyflow/react";
import { useState, useEffect } from "react";

function ResultNode({ data }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand if there's new reasoning coming in and it was empty before
  useEffect(() => {
    if (data.reasoning && data.reasoning.length > 0 && data.reasoning.length < 100) {
      setIsExpanded(true);
    }
  }, [data.reasoning]);

  return (
    <div className="custom-node result-node">
      <div className="node-header">
        <div className="node-icon">🤖</div>
        <span>AI Response</span>
      </div>
      <div className="node-body">
        {/* Collapsible Thinking Section */}
        {data.reasoning && (
          <div className={`thinking-section ${isExpanded ? "expanded" : ""}`}>
            <button 
              className="thinking-toggle" 
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <span className="toggle-icon">{isExpanded ? "▼" : "▶"}</span>
              <span className="toggle-text">Thinking Process</span>
              {data.loading && !data.response && <span className="mini-spinner"></span>}
            </button>
            {isExpanded && (
              <div className="thinking-content">
                {data.reasoning}
              </div>
            )}
          </div>
        )}

        <div className="result-content" id="result-output">
          {data.response ? (
            <p>{data.response}</p>
          ) : data.loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <span>Generating response...</span>
            </div>
          ) : !data.reasoning ? (
            <p className="placeholder-text">
              AI response will appear here...
            </p>
          ) : null}
        </div>
      </div>
      <Handle type="target" position={Position.Left} id="input" />
    </div>
  );
}

export default ResultNode;
