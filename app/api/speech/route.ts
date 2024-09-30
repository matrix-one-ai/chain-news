import { NextResponse } from "next/server";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      process.env.AZURE_SUBSCRIPTION_KEY!,
      process.env.AZURE_SERVICE_REGION!
    );
    speechConfig.speechSynthesisVoiceName = "en-US-NovaMultilingualNeuralHD";

    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Ogg48Khz16BitMonoOpus;

    const audioOutputStream = sdk.AudioOutputStream.createPullStream();

    const audioConfig = sdk.AudioConfig.fromStreamOutput(audioOutputStream);

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const buffer = new ArrayBuffer(4096);
          const bytesRead = await audioOutputStream.read(buffer);
          if (bytesRead > 0) {
            const uint8Array = new Uint8Array(buffer, 0, bytesRead);
            controller.enqueue(uint8Array);
          } else {
            controller.close();
          }
        } catch (error) {
          console.error("Error reading from audio stream:", error);
          controller.error(error);
        }
      },
      cancel() {
        synthesizer.close();
      },
    });

    synthesizer.visemeReceived = (event) => {
      console.log("Viseme received:", event);
    };

    synthesizer.speakTextAsync(text);

    synthesizer.synthesisCompleted = () => {
      audioOutputStream.close();
    };

    return new Response(stream, {
      headers: {
        "Content-Type": "audio/ogg",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
