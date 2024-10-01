import { NextResponse } from "next/server";
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const subscriptionKey = process.env.AZURE_SUBSCRIPTION_KEY;
    const serviceRegion = process.env.AZURE_SERVICE_REGION;

    if (!subscriptionKey || !serviceRegion) {
      return NextResponse.json(
        { error: "Azure subscription key or service region is missing" },
        { status: 500 }
      );
    }

    const speechConfig = sdk.SpeechConfig.fromSubscription(
      subscriptionKey,
      serviceRegion
    );
    speechConfig.speechSynthesisVoiceName = "en-US-AvaMultilingualNeural";
    speechConfig.speechSynthesisOutputFormat =
      sdk.SpeechSynthesisOutputFormat.Ogg48Khz16BitMonoOpus;

    const audioOutputStream = sdk.AudioOutputStream.createPullStream();
    const audioConfig = sdk.AudioConfig.fromStreamOutput(audioOutputStream);
    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

    const audioChunks: Buffer[] = [];
    const blendShapes: any[] = [];

    synthesizer.visemeReceived = (
      _sender: sdk.SpeechSynthesizer,
      event: sdk.SpeechSynthesisVisemeEventArgs
    ) => {
      blendShapes.push(JSON.parse(event.animation));
    };

    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"
             xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
        <voice name="en-US-AvaMultilingualNeural">
          <mstts:viseme type="FacialExpression"/>
          ${text}
        </voice>
      </speak>`;

    await new Promise<void>((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        (result) => {
          if (result.errorDetails) {
            reject(new Error(result.errorDetails));
          } else {
            resolve();
          }
          synthesizer.close();
        },
        (error) => {
          reject(error);
          synthesizer.close();
        }
      );
    });

    let bytesRead = 0;
    const chunkSize = 4096;
    do {
      const buffer = new ArrayBuffer(chunkSize);
      bytesRead = await audioOutputStream.read(buffer);
      if (bytesRead > 0) {
        const audioChunk = Buffer.from(buffer).slice(0, bytesRead);
        audioChunks.push(audioChunk);
      }
    } while (bytesRead > 0);

    const audioBuffer = Buffer.concat(audioChunks);

    const audioBase64 = audioBuffer.toString("base64");

    return NextResponse.json({
      audioData: audioBase64,
      blendShapes: blendShapes,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
