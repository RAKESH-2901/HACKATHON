import os
from transcribe import transcribe_audio
from datetime import datetime
import dateparser
import re
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
import pickle
import torch
from transformers import BartForConditionalGeneration, BartTokenizer
import sys

# Import the local sumarry module
from sumarry import summarize_lecture

class LectureAssistant:
    def __init__(self):
        self.SCOPES = ['https://www.googleapis.com/auth/calendar']
        self.calendar_service = None

    def setup_google_calendar(self):
        """Set up Google Calendar API."""
        creds = None
        if os.path.exists('token.pickle'):
            with open('token.pickle', 'rb') as token:
                creds = pickle.load(token)
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(
                    'credentials.json', self.SCOPES)
                creds = flow.run_local_server(port=0)
            
            with open('token.pickle', 'wb') as token:
                pickle.dump(creds, token)

        self.calendar_service = build('calendar', 'v3', credentials=creds)

    def extract_dates(self, text):
        """Extract dates and deadlines from text."""
        # Common date patterns
        date_patterns = [
            r'due\s+(?:on\s+)?([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?)',
            r'submit\s+(?:by|before|on)\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?)',
            r'deadline\s+(?:is|:)?\s+([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?)',
            r'(\d{1,2}(?:st|nd|rd|th)?\s+(?:of\s+)?[A-Za-z]+(?:\s*,?\s*\d{4})?)',
            r'([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?)'
        ]

        dates = []
        for pattern in date_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                date_str = match.group(1) if len(match.groups()) > 0 else match.group(0)
                parsed_date = dateparser.parse(date_str)
                if parsed_date:
                    dates.append({
                        'original': date_str,
                        'parsed': parsed_date,
                        'context': text[max(0, match.start()-50):min(len(text), match.end()+50)]
                    })
        return dates

    def add_to_calendar(self, event_details):
        """Add an event to Google Calendar."""
        if not self.calendar_service:
            self.setup_google_calendar()

        event = {
            'summary': event_details['title'],
            'description': event_details['description'],
            'start': {
                'dateTime': event_details['date'].isoformat(),
                'timeZone': 'Asia/Kolkata',
            },
            'end': {
                'dateTime': event_details['date'].isoformat().replace('00:00:00', '23:59:59'),
                'timeZone': 'Asia/Kolkata',
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 24 * 60},
                    {'method': 'popup', 'minutes': 60},
                ],
            },
        }

        event = self.calendar_service.events().insert(calendarId='primary', body=event).execute()
        return event.get('htmlLink')

    def process_lecture(self, audio_file_path):
        """Process a lecture recording."""
        print("\n=== Processing Lecture Recording ===")
        print("1. Transcribing audio...")
        # Get transcription
        transcribe_audio(audio_file_path)
        
        # Read the transcription file
        transcription_file = os.path.splitext(audio_file_path)[0] + '_transcription.txt'
        with open(transcription_file, 'r', encoding='utf-8') as f:
            transcription = f.read()

        print("\n2. Analyzing content...")
        # Get summary
        summary = summarize_lecture(transcription)

        print("\n3. Extracting dates and deadlines...")
        # Extract dates
        dates = self.extract_dates(transcription)

        # Save results
        output_file = os.path.splitext(audio_file_path)[0] + '_analysis.txt'
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("LECTURE ANALYSIS\n")
            f.write("=" * 50 + "\n\n")
            
            f.write("OVERVIEW:\n")
            f.write("-" * 20 + "\n")
            f.write(summary["overview"] + "\n\n")
            
            f.write("KEY POINTS:\n")
            f.write("-" * 20 + "\n")
            for i, point in enumerate(summary["key_points"], 1):
                f.write(f"{i}. {point}\n")
            f.write("\n")
            
            f.write("SUMMARY:\n")
            f.write("-" * 20 + "\n")
            f.write(summary["detailed_explanation"] + "\n\n")

            if dates:
                f.write("\nDEADLINES DETECTED:\n")
                f.write("-" * 20 + "\n")
                for date in dates:
                    f.write(f"Date: {date['parsed'].strftime('%B %d, %Y')}\n")
                    f.write(f"Context: {date['context']}\n\n")

        print(f"\nAnalysis saved to {output_file}")

        # Add deadlines to calendar
        if dates:
            print("\n4. Adding deadlines to Google Calendar...")
            try:
                for date in dates:
                    event_details = {
                        'title': 'Assignment Deadline',
                        'description': f"Context: {date['context']}\n\nFull lecture summary available in: {output_file}",
                        'date': date['parsed']
                    }
                    calendar_link = self.add_to_calendar(event_details)
                    print(f"Added to calendar: {calendar_link}")
            except Exception as e:
                print(f"Could not add to calendar: {str(e)}")
                print("Please ensure you have set up Google Calendar credentials properly.")

        return output_file

def main():
    assistant = LectureAssistant()
    
    # You can change this to your audio file path
    audio_file = "machine_learning_lecture.mp3"
    
    if not os.path.exists(audio_file):
        print(f"Error: Audio file '{audio_file}' not found.")
        print("Please place your audio file in the same directory or update the path.")
        return

    output_file = assistant.process_lecture(audio_file)
    
    print("\n=== Processing Complete ===")
    print(f"Check {output_file} for the complete analysis.")

if __name__ == "__main__":
    main()
