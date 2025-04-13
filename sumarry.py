from transformers import BartForConditionalGeneration, BartTokenizer
import torch

def summarize_lecture(text):
    # Load the model and tokenizer
    model_name = "facebook/bart-large-cnn"
    tokenizer = BartTokenizer.from_pretrained(model_name)
    model = BartForConditionalGeneration.from_pretrained(model_name)

    # Tokenize the input text
    inputs = tokenizer(text, max_length=1024, truncation=True, return_tensors="pt")

    # Generate summary
    summary_ids = model.generate(inputs["input_ids"], max_length=150, min_length=40, length_penalty=2.0, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    # Split the summary into key points
    key_points = [point.strip() for point in summary.split('.') if point.strip()]

    return {
        "overview": summary[:200] + "...",  # First 200 characters as overview
        "key_points": key_points[:5],  # First 5 key points
        "detailed_explanation": summary  # Full summary
    } 