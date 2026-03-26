import { Handle, Position } from "@xyflow/react";
import { useCallback } from "react";

function InputNode({ data }) {
  const onChange = useCallback(
    (e) => {
      data.onPromptChange(e.target.value);
    },
    [data]
  );

  return (
    <div className="custom-node input-node">
      <div className="node-header">
        <div className="node-icon">✏️</div>
        <span>Prompt Input</span>
      </div>
      <div className="node-body">
        <textarea
          id="prompt-input"
          placeholder="Type your prompt here... e.g. 'What is the capital of France?'"
          value={data.prompt}
          onChange={onChange}
          rows={4}
        />
      </div>
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
}

export default InputNode;
