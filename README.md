# Whisper Audio Transcription

This is a simple audio transcription tool using the Faster Whisper model.

## Setup Instructions

1. Make sure you have Python installed on your system
2. Open this folder in VS Code
3. Create a virtual environment:
   ```
   python -m venv .venv
   ```
4. Activate the virtual environment:
   ```
   .venv\Scripts\activate
   ```
5. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

## Usage

1. Place your audio file in this folder
2. Edit `transcribe.py` and update the `audio_file` variable with your audio file name
3. Run the script:
   ```
   python transcribe.py
   ```

The transcription will be saved in a text file with the same name as your audio file (with _transcription.txt added).

## Notes

- First run will download the model (about 400MB)
- Works with most audio formats (mp3, wav, m4a, etc.)
- Uses CPU for processing (no GPU required)
- Transcription is typically 4-5x faster than real-time
