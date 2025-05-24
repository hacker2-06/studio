
export type Option = '1' | '2' | '3' | '4';

export interface Question {
  id: string;
  text: string; // e.g., "Question 1" or actual question text if AI generated
  options: Option[]; // For OMR, this will be ['1', '2', '3', '4'].
  userAnswer?: Option; // The answer selected by the user
  isCorrect?: boolean; // Determined during self-evaluation
  isMarkedForReview?: boolean; // New: For user to mark a question for review
  isMarkedForLater?: boolean;  // New: For user to mark a question to revisit later
  // Fields that might come from AI generation (optional if not using AI for content)
  aiGeneratedQuestionText?: string;
  aiGeneratedOptions?: { [key in Option]?: string }; // Text for options
  aiGeneratedCorrectAnswerKey?: Option;
  aiGeneratedExplanation?: string;
}

// Test settings from creation form
export interface TestCreationData {
  name: string;
  numberOfQuestions: number;
  timerMode: 'timer' | 'stopwatch' | 'none';
  durationMinutes?: number;
  markingCorrect: number;
  markingIncorrect: number;
}

// Structure for data stored in localStorage while test is active or being evaluated
export interface CurrentTestData {
  config: TestCreationData;
  questions: Question[]; // Includes user answers and review/later flags after submission from TakeTestPage
  elapsedTimeSeconds?: number; // Added to track time taken
}

// For AI Generated Question content (if used)
export interface AIQuestion { // This is the schema for AI output
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
}


// Fully evaluated test structure for history
export interface Test {
  id: string; // UUID
  name: string; // From TestCreationData
  config: TestCreationData;
  questions: Question[]; // Each question with id, text, options, userAnswer, isCorrect, and review/later flags
  status: 'evaluated';
  createdAt: string; // ISO date string of test creation
  submittedAt: string; // ISO date string when user submitted in TakeTestPage
  evaluatedAt: string; // ISO date string when user completed self-evaluation
  scoreDetails: {
    score: number;
    correctCount: number;
    incorrectCount: number;
    unattemptedCount: number;
    percentage: number; // This will now represent accuracy (correct/attempted)
  };
  elapsedTimeSeconds?: number; // Added to store time taken for the test
}

export type AIGeneratedTestQuestionsOutput = {
  questions: AIQuestion[];
};
