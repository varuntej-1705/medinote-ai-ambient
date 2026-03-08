import os
import tempfile
import logging

logger = logging.getLogger(__name__)


def transcribe_audio(file_path: str) -> str:
    """Transcribe audio file using OpenAI Whisper."""
    try:
        import whisper
        model_name = os.getenv("WHISPER_MODEL", "base")
        model = whisper.load_model(model_name)
        result = model.transcribe(file_path)
        return result["text"]
    except ImportError:
        logger.warning("Whisper not installed. Using mock transcription.")
        return _mock_transcription()
    except Exception as e:
        logger.error(f"Whisper transcription failed: {e}")
        return _mock_transcription()


async def save_and_transcribe(file) -> tuple:
    """Save uploaded audio file and transcribe it."""
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, file.filename)

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    transcript = transcribe_audio(file_path)
    return file_path, transcript


def _mock_transcription() -> str:
    """Return a realistic mock transcription for demo purposes."""
    return (
        "Doctor: Good morning. What brings you in today? "
        "Patient: I've been having persistent headaches for the past two weeks, "
        "mainly in the frontal region. They get worse in the afternoon and I sometimes feel dizzy. "
        "Doctor: Have you noticed any other symptoms? Any visual changes or nausea? "
        "Patient: Yes, I've had some nausea and occasional blurred vision. I've also been feeling "
        "more fatigued than usual. My blood pressure was high last time I checked it. "
        "Doctor: Are you currently taking any medications? "
        "Patient: I take Lisinopril 10mg daily for blood pressure and occasional Ibuprofen for the headaches. "
        "Doctor: I see. Let me check your vitals. Your blood pressure is 150/95, which is elevated. "
        "Heart rate is 78, temperature is normal at 98.6. I'd like to order some blood work and "
        "possibly a CT scan to rule out any underlying causes. I'm going to adjust your Lisinopril "
        "to 20mg and recommend you avoid NSAIDs like Ibuprofen for now. "
        "Let's schedule a follow-up in two weeks."
    )
