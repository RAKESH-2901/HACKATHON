from faster_whisper import WhisperModel
from huggingface_hub import snapshot_download
import time

def transcribe_audio(audio_file_path):
    print("Downloading the model (first time only)...")
    model_path = snapshot_download(
        repo_id="Systran/faster-whisper-small",
        local_files_only=False
    )

    print("Loading the model...")
    model = WhisperModel(model_path, device="cpu", compute_type="int8")

    print("Starting transcription...")
    start_time = time.time()

    # Transcribe with optimized settings
    segments, info = model.transcribe(
        audio_file_path,
        beam_size=5,
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=500),
        word_timestamps=True
    )

    # Calculate total time taken
    transcription_time = time.time() - start_time

    print("\nTranscription results:")
    print("-" * 50)
    print(f"Total audio duration: {info.duration:.2f} seconds")
    print(f"Processing time: {transcription_time:.2f} seconds")
    print(f"Real-time factor: {transcription_time/info.duration:.2f}x")
    print("-" * 50)

    # Create output file with same name as input but .txt extension
    output_file = audio_file_path.rsplit('.', 1)[0] + '_transcription.txt'
    
    # Collect all text segments
    full_text = " ".join(segment.text.strip() for segment in segments)
    
    # Print and save the complete sentence
    print("\nComplete transcription:")
    print("-" * 50)
    print(full_text)
    print("-" * 50)
    
    with open(output_file, "w", encoding="utf-8") as f:
        # Write the complete sentence
        f.write(full_text)
        
        # Also write the timestamped version for reference
        f.write("\n\nDetailed timestamped transcription:\n")
        f.write("-" * 50 + "\n")
        for segment in segments:
            f.write(f"[{segment.start:.2f}s -> {segment.end:.2f}s] {segment.text}\n")

    print(f"\nTranscription saved to {output_file}")

if __name__ == "__main__":
    # You can change this to your audio file path
    audio_file = "machine_learning_lecture.mp3"
    transcribe_audio(audio_file)
