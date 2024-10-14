import { useCallback, useEffect, useRef } from "react";
import { azureVoices } from "../helpers/azureVoices";
import { Message, useChat } from "ai/react";
import { Box } from "@mui/material";

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

  const { messages, input, handleInputChange, isLoading, append, stop } =
    useChat({
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
      const form = event.currentTarget as HTMLFormElement;
      const message = (form.elements[0] as HTMLInputElement).value;

      const prompt = `
        Your job is to deliver the latest news in the world of cryptocurrency on our platform ChainNews.One.
        Your audience is watching on live stream.

        There are 2 hosts: Haiku and DogWifHat.

        HOST1: Haiku is a young female news reporter, educated and classy. She is the main host of the show.
        HOST2: DogWifHat is a crypto memecoin pumper small dog with a hat. He is the co-host of the show, and he is a bit of a clown.

        Don't add weird characters or sounds.

        ONLY output in this script format:

        Use "<" to separate the speaker from the text.

        SPEAKER<TEXT\n
        SPEAKER<TEXT\n
        SPEAKER<TEXT\n
        ... etc

        The only speakers you can use are:
        HOST1, HOST2

        HOST1 should have more script lines then HOST2.

        This text is used to generate the audio for the show.


        A user has submitted the following message in the chat:

        ${message}

        Please talk to the user.
      `;
      append({ role: "user", content: prompt });
    },
    [append, startTimeRef]
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatContainerRef, messages]);

  return !isStreaming ? (
    <Box
      sx={{
        touchAction: "all",
        pointerEvents: "all",
        margin: "0.5rem",
        maxWidth: "400px",
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
    </Box>
  ) : null;
};

export default ChatInterface;
