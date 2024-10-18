import { memo, useCallback, useEffect, useRef } from "react";
import { Message, useChat } from "ai/react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { sendChatMessage } from "../helpers/prompts";

interface ChatInterfaceProps {
  isStreaming: boolean;
  prompt: string;
  isAudioLoading: boolean;
  handleOnFinish: (message: Message, options: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = memo(
  ({ isStreaming, prompt, isAudioLoading, handleOnFinish }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const {
      messages,
      input,
      handleInputChange,
      setInput,
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

    const handleSubmit = useCallback(
      (event: React.FormEvent) => {
        event.preventDefault();
        const form = event.currentTarget as HTMLFormElement;
        const message = (form.elements[0] as HTMLInputElement).value;

        const prompt = sendChatMessage(message);
        append({ role: "user", content: prompt });
        setInput("");
      },
      [append, setInput]
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
        {messages.length > 0 && (
          <Box
            ref={chatContainerRef}
            style={{
              maxHeight: "300px",
              overflowY: "auto",
              backgroundColor: "#f0f0f0",
              padding: "10px",
            }}
          >
            {messages.map((message, index) => (
              <Box key={index}>
                <Typography variant="body1" fontWeight="bold">
                  {message.role === "user" ? "User" : "AI"}:{" "}
                  <Typography variant="body2">{message.content}</Typography>
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            minWidth: "350px",
          }}
        >
          <Stack spacing={1}>
            <TextField
              multiline
              value={input}
              onChange={handleInputChange}
              placeholder="Enter your message"
              rows={4}
              fullWidth
              sx={{
                backdropFilter: "blur(1px)",
              }}
            />

            <Button
              variant="contained"
              color="secondary"
              type="submit"
              disabled={isLoading || isAudioLoading || !input}
              fullWidth
              style={{ marginTop: "10px" }}
            >
              {isLoading || isAudioLoading ? "Loading..." : "Send"}
            </Button>
          </Stack>
        </form>
      </Box>
    ) : null;
  }
);

ChatInterface.displayName = "ChatInterface";

export default ChatInterface;
