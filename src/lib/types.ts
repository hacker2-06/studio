export type Option = '1' | '2' | '3' | '4'; // Changed from A, B, C, D

export interface Question {
  id: string;
  text: string; // e.g., "Question 1" or actual question text if AI generated
  options: Option[]; // For OMR, this will be ['1', '2', '3', '4'].
  userAnswer?: Option; // The answer selected by the user
  isCorrect?: boolean; // Determined during self-evaluation
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
  questions: Question[]; // Includes user answers after submission from TakeTestPage
}

// For AI Generated Question content (if used)
export interface AIQuestion { // This is the schema for AI output
  questionText: string;
  options: { // Text for options A,B,C,D (or 1,2,3,4 if AI is adapted)
    A: string; // Keeping A,B,C,D here as it's AI output schema, can be mapped
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D'; // Key of the correct option from AI
  explanation?: string;
}


// Fully evaluated test structure for history
export interface Test {
  id: string; // UUID
  name: string; // From TestCreationData
  config: TestCreationData; // Contains marking scheme, timer settings, original num questions
  questions: Question[]; // Each question with id, text, options, userAnswer, and isCorrect
  status: 'evaluated'; // Only evaluated tests are stored in history for now
  createdAt: string; // ISO date string of test creation (from form submission)
  submittedAt: string; // ISO date string when user submitted in TakeTestPage
  evaluatedAt: string; // ISO date string when user completed self-evaluation
  scoreDetails: {
    score: number;
    correctCount: number;
    incorrectCount: number;
    unattemptedCount: number;
    percentage: number;
  };
  elapsedTimeSeconds?: number; // If timer/stopwatch was used
}

// The AI output for GenerateTestQuestionsOutput in the flow still uses A,B,C,D internally for options/correctAnswer.
// This will be mapped to 1,2,3,4 if/when AI-generated questions are used in the OMR context.
// For now, OMR only uses generic question numbers and 1,2,3,4 options.
export type AIGeneratedTestQuestionsOutput = {
  questions: AIQuestion[];
};
