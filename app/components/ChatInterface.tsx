import { memo, useCallback, useEffect, useRef } from "react";
import { Message, useChat } from "ai/react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { sendChatMessage } from "../helpers/prompts";
import {
  useAuthStore,
  useOverlayStore,
  usePromptStore,
  useSceneStore,
} from "../zustand/store";

interface ChatInterfaceProps {
  isVisible: boolean;
  prompt: string;
  isAudioLoading: boolean;
  isPromptUnlocked: boolean;
  customPrompt: string;
  handleOnFinish: (message: Message, options: any) => void;
  handleOnError: (error: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = memo(
  ({
    isVisible,
    prompt,
    isAudioLoading,
    isPromptUnlocked,
    customPrompt,
    handleOnFinish,
    handleOnError,
  }) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);

    const { mainHostAvatar, isPlaying } = useSceneStore();
    const { walletAddress, isLoggedIn, credits, setTriggerWeb3AuthModal } =
      useAuthStore();
    const { systemMessages, addSystemMessage } = usePromptStore();
    const { setIsPaywallModalOpen } = useOverlayStore();

    const {
      messages,
      input,
      isLoading,
      handleInputChange,
      setInput,
      append,
      stop,
    } = useChat({
      onFinish: handleOnFinish,
      onError: handleOnError,
      body: {
        walletAddress,
      },
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

        const prompt = isPromptUnlocked
          ? customPrompt
          : sendChatMessage(message, mainHostAvatar);
        append({ role: "user", content: prompt });
        setInput("");
        addSystemMessage(`TERMINAL:${message}`);
      },
      [
        addSystemMessage,
        append,
        customPrompt,
        isPromptUnlocked,
        mainHostAvatar,
        setInput,
      ]
    );

    useEffect(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop =
          chatContainerRef.current.scrollHeight;
      }
    }, [chatContainerRef, messages, isPlaying]);

    const splitScriptLines = useCallback((content: string) => {
      const splitMessage = content
        .split("\n")
        .filter((line) => line.length > 0);
      const scriptLines = splitMessage.map((line) => {
        const [speaker, text] = line.split("<");
        return { speaker, text };
      });
      return scriptLines;
    }, []);

    const mergedMessages = [...messages, ...systemMessages]
      .sort(
        (a, b) =>
          (a.createdAt as Date).getTime() - (b.createdAt as Date).getTime()
      )
      .filter(
        (message) =>
          (message.role === "user" &&
            message.content.slice(0, 9) === "TERMINAL:") ||
          message.role === "assistant"
      );

    return isVisible ? (
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
              backgroundColor: "white",
              backdropFilter: "blur(10px)",
              padding: "10px",
            }}
          >
            {mergedMessages.map((message, index) => (
              <Box key={index}>
                <Typography component="div" variant="body1" fontWeight="bold">
                  {message.role === "user" ? (
                    <>
                      {"Terminal:"}
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        {message.content
                          ?.slice(9)
                          .split("\n")
                          ?.map((line, i) => (
                            <span key={i}>
                              {line}
                              <br />
                            </span>
                          ))}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography component="div" variant="body2">
                        {splitScriptLines(message.content).map(
                          ({ speaker, text }, index) => (
                            <Typography
                              component="div"
                              key={`${text}-${index}`}
                              variant="body2"
                              sx={{
                                mb: 1,
                              }}
                            >
                              <Typography variant="body2" fontWeight="bold">
                                {speaker}:
                              </Typography>{" "}
                              {text}
                            </Typography>
                          )
                        )}
                      </Typography>
                    </>
                  )}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        <form
          onSubmit={handleSubmit}
          onClick={() => {
            if (!isLoggedIn) {
              setTriggerWeb3AuthModal(true);
            }
            if (credits <= 0) {
              addSystemMessage("TERMINAL: You have no credits left.");
              setIsPaywallModalOpen(true);
            }
          }}
          style={{
            minWidth: "350px",
          }}
        >
          <Stack spacing={1}>
            <Tooltip
              title="You need to login to send messages"
              disableFocusListener={isLoggedIn}
              disableHoverListener={isLoggedIn}
              disableTouchListener={isLoggedIn}
              disableInteractive={isLoggedIn}
              placement="top"
            >
              <Box>
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
                  disabled={
                    isLoading ||
                    isAudioLoading ||
                    !input ||
                    !isLoggedIn ||
                    credits <= 0
                  }
                  fullWidth
                  style={{ marginTop: "10px" }}
                >
                  {isLoading || isAudioLoading ? "Loading..." : "Send"}
                </Button>
              </Box>
            </Tooltip>
          </Stack>
        </form>
      </Box>
    ) : null;
  }
);

ChatInterface.displayName = "ChatInterface";

export default ChatInterface;
