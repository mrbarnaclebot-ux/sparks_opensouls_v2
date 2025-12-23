
import { MentalProcess } from "@opensouls/engine";
import externalDialog from "./cognitiveSteps/externalDialog.ts";
import { speakWithAudio } from "./lib/tts.ts";

const initialProcess: MentalProcess = async ({ workingMemory }) => {
  const [withDialog, stream] = await externalDialog(
    workingMemory,
    "Talk to the user trying to gain trust and learn about their inner world.",
    { stream: true, model: "quality" }
  );
  
  // Speak with ElevenLabs TTS audio
  await speakWithAudio(stream);

  return withDialog;
}

export default initialProcess
