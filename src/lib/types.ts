export type Option = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  text: string; // e.g., "Question 1" or actual question text if AI generated
  options: Option[]; // For OMR, this will be ['A', 'B', 'C', 'D']. For AI, text from AI.
  userAnswer?: Option; // The answer selected by the user
  correctAnswer?: Option; // The correct answer (for evaluation or if provided by AI)
  isCorrect?: boolean; // Determined during evaluation
  // Fields that might come from AI generation (optional if not using AI for content)
  aiGeneratedQuestionText?: string;
  aiGeneratedOptions?: { A?: string; B?: string; C?: string; D?: string }; // Text for options A,B,C,D
  aiGeneratedCorrectAnswerKey?: Option;
  aiGeneratedExplanation?: string;
}

export interface Test {
  id: string;
  name: string;
  // topic: string; // Removed as AI content generation is not the primary focus for OMR
  numberOfQuestions: number;
  questions: Question[];
  timer: {
    mode: 'timer' | 'stopwatch' | 'none';
    durationSeconds?: number; // Only if mode is 'timer'
  };
  markingScheme: {
    correct: number;
    incorrect: number;
  };
  status: 'pending' | 'in-progress' | 'submitted' | 'evaluated';
  createdAt: string; // ISO date string
  startedAt?: string; // ISO date string
  submittedAt?: string; // ISO date string
  elapsedTimeSeconds?: number;
  score?: number;
  correctCount?: number;
  incorrectCount?: number;
  unattemptedCount?: number;
  percentage?: number;
}

// Test settings from creation form
export interface TestCreationData {
  name: string;
  // topic: string; // Removed
  numberOfQuestions: number;
  timerMode: 'timer' | 'stopwatch' | 'none';
  durationMinutes?: number;
  markingCorrect: number;
  markingIncorrect: number;
}

// For AI Generated Question content (if used later)
export interface AIQuestion {
  questionText: string;
  options: { // Text for options
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: Option; // Key of the correct option
  explanation?: string;
}

export interface AIGeneratedTestQuestions {
  questions: AIQuestion[];
}

// Structure for data stored in localStorage and used by TakeTestPage
export interface CurrentTestData {
  config: TestCreationData;
  questions: Question[]; // Now holds generic Question structures
}
