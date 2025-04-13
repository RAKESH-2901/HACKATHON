from transformers import pipeline
import json
import re

class QuizGenerator:
    def __init__(self):
        # Initialize the question generation pipeline with a simpler model
        self.question_generator = pipeline(
            "text2text-generation",
            model="google/flan-t5-base"
        )
        
        # Initialize the QA pipeline
        self.qa_pipeline = pipeline(
            "question-answering",
            model="deepset/roberta-base-squad2"
        )

    def generate_quiz(self, lecture_content, num_questions=5):
        """
        Generate a quiz from lecture content
        """
        quiz = []
        
        # Extract key points and detailed notes
        key_points = lecture_content.get('keyPoints', [])
        detailed_notes = lecture_content.get('detailedNotes', [])
        
        # Combine all text for context
        context = " ".join([
            lecture_content.get('overview', ''),
            " ".join(key_points),
            " ".join([f"{note['title']} {' '.join(note['points'])}" for note in detailed_notes])
        ])

        # Split context into sentences for better question generation
        sentences = re.split(r'(?<=[.!?])\s+', context)
        
        # Generate questions
        for sentence in sentences[:num_questions]:  # Use first n sentences
            if len(sentence.strip()) < 20:  # Skip very short sentences
                continue
                
            try:
                # Generate question
                question = self.question_generator(
                    f"Generate a question about: {sentence}",
                    max_length=100
                )[0]['generated_text']
                
                # Get answer using QA pipeline
                answer = self.qa_pipeline(question=question, context=context)
                
                # Generate multiple choice options
                options = self._generate_options(answer['answer'], context)
                
                quiz.append({
                    'question': question,
                    'answer': answer['answer'],
                    'options': options
                })
            except Exception as e:
                print(f"Error generating question: {str(e)}")
                continue

        return quiz

    def _generate_options(self, correct_answer, context):
        """
        Generate multiple choice options including the correct answer
        """
        # Get some random words from context as potential options
        words = re.findall(r'\b\w+\b', context)
        words = [w for w in words if len(w) > 3 and w.lower() != correct_answer.lower()]
        
        # Select 3 random words as incorrect options
        import random
        options = random.sample(words, min(3, len(words)))
        
        # Add correct answer and shuffle
        options.append(correct_answer)
        random.shuffle(options)
        
        return options

if __name__ == "__main__":
    # Test the quiz generator
    generator = QuizGenerator()
    
    test_content = {
        "overview": "Machine learning is a method of data analysis that automates analytical model building.",
        "keyPoints": [
            "Machine learning uses algorithms to learn from data",
            "There are three types of machine learning: supervised, unsupervised, and reinforcement",
            "Deep learning is a subset of machine learning"
        ],
        "detailedNotes": [
            {
                "title": "Types of Machine Learning",
                "points": [
                    "Supervised learning uses labeled data",
                    "Unsupervised learning finds patterns in unlabeled data",
                    "Reinforcement learning learns through trial and error"
                ]
            }
        ]
    }
    
    quiz = generator.generate_quiz(test_content)
    print(json.dumps(quiz, indent=2)) 