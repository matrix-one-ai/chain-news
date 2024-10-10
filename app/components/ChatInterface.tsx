import { azureVoices } from "../helpers/azureVoices";

interface ChatInterfaceProps {
  messages: any[];
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  isAudioLoading: boolean;
  responseTime: string;
  selectedVoice: string;
  setSelectedVoice: React.Dispatch<React.SetStateAction<string>>;
  chatContainerRef: React.RefObject<HTMLDivElement>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  isAudioLoading,
  responseTime,
  selectedVoice,
  setSelectedVoice,
  chatContainerRef,
}) => (
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
    <form onSubmit={handleSubmit}>
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

      <div style={{ whiteSpace: "nowrap", color: "white", paddingTop: "5px" }}>
        Latency: {responseTime ? `${responseTime}s` : ""}
      </div>
    </form>
  </div>
);

export default ChatInterface;
