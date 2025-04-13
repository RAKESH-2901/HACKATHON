from quiz_generator import QuizGenerator

def test_quiz_generator():
    # Create an instance of the QuizGenerator
    generator = QuizGenerator()
    
    # Sample lecture content
    test_content = {
        "overview": "Machine learning is a method of data analysis that automates analytical model building. It is a branch of artificial intelligence based on the idea that systems can learn from data, identify patterns and make decisions with minimal human intervention.",
        "keyPoints": [
            "Machine learning uses algorithms to learn from data",
            "There are three types of machine learning: supervised, unsupervised, and reinforcement",
            "Deep learning is a subset of machine learning that uses neural networks",
            "Machine learning is used in various applications like image recognition, natural language processing, and recommendation systems"
        ],
        "detailedNotes": [
            {
                "title": "Types of Machine Learning",
                "points": [
                    "Supervised learning uses labeled data to train models",
                    "Unsupervised learning finds patterns in unlabeled data",
                    "Reinforcement learning learns through trial and error with rewards",
                    "Semi-supervised learning uses both labeled and unlabeled data"
                ]
            },
            {
                "title": "Applications of Machine Learning",
                "points": [
                    "Image recognition and computer vision",
                    "Natural language processing and text analysis",
                    "Recommendation systems for personalized content",
                    "Predictive analytics for business decisions"
                ]
            }
        ]
    }
    
    # Generate quiz
    print("Generating quiz from lecture content...")
    quiz = generator.generate_quiz(test_content)
    
    # Print the generated quiz
    print("\nGenerated Quiz:")
    for i, question in enumerate(quiz, 1):
        print(f"\nQuestion {i}:")
        print(f"Q: {question['question']}")
        print("Options:")
        for j, option in enumerate(question['options'], 1):
            print(f"{j}. {option}")
        print(f"Correct Answer: {question['answer']}")

if __name__ == "__main__":
    test_quiz_generator() 