import { useCallback, useEffect, useRef } from "react";
import { azureVoices } from "../helpers/azureVoices";
import { Message, useChat } from "ai/react";

interface ChatInterfaceProps {
  isStreaming: boolean;
  prompt: string;
  startTimeRef: React.MutableRefObject<number>;
  isAudioLoading: boolean;
  responseTime: string;
  selectedVoice: string;
  setSelectedVoice: React.Dispatch<React.SetStateAction<string>>;
  handleOnFinish: (message: Message, options: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  isStreaming,
  prompt,
  startTimeRef,
  isAudioLoading,
  responseTime,
  selectedVoice,
  setSelectedVoice,
  handleOnFinish,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
    stop,
  } = useChat({
    onFinish: handleOnFinish,
  });

  useEffect(() => {
    if (prompt) {
      append({ role: "user", content: prompt });
    } else {
      stop();
    }
  }, [prompt]);

  const handleSubmitWithTimer = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      startTimeRef.current = performance.now();
      handleSubmit(event);
    },
    [handleSubmit, startTimeRef]
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatContainerRef, messages]);

  return !isStreaming ? (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        left: 0,
        zIndex: 1000,
        width: "25%",
        color: "black",
      }}
    >
      <div
        ref={chatContainerRef}
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          backgroundColor: "#f0f0f0",
          padding: "10px",
        }}
      >
        {messages.map((message, index) => (
          <div key={index}>
            <strong>{message.role === "user" ? "User" : "AI"}:</strong>{" "}
            {message.content}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmitWithTimer}>
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Enter your message"
          rows={4}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
          }}
        />
        <div>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            style={{
              padding: "10px",
              fontSize: "16px",
              width: "100%",
            }}
          >
            {azureVoices.map((voice) => (
              <option key={voice.value} value={voice.value}>
                {voice.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading || isAudioLoading}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            fontSize: "16px",
            width: "100%",
          }}
        >
          {isLoading || isAudioLoading ? "Loading..." : "Send"}
        </button>

        <div
          style={{ whiteSpace: "nowrap", color: "white", paddingTop: "5px" }}
        >
          Latency: {responseTime ? `${responseTime}s` : ""}
        </div>
      </form>
    </div>
  ) : null;
};

export default ChatInterface;
