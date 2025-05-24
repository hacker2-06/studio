export type Option = 'A' | 'B' | 'C' | 'D';

export interface Question {
  id: string;
  text: string; // e.g., "Question 1"
  options: Option[];
  userAnswer?: Option; // The answer selected by the user
  correctAnswer?: Option; // The correct answer (for evaluation)
  isCorrect?: boolean; // Determined during evaluation
}

export interface Test {
  id: string;
  name: string;
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
  status: 'pending' | 'in-progress' | 'submitted' | 'evaluated'; // pending: not started, in-progress: user is taking, submitted: user finished, evaluated: score calculated
  createdAt: string; // ISO date string
  startedAt?: string; // ISO date string
  submittedAt?: string; // ISO date string
  elapsedTimeSeconds?: number; // For stopwatch or completed timer tests
  score?: number;
  correctCount?: number;
  incorrectCount?: number;
  unattemptedCount?: number;
  percentage?: number;
}

// Example: Test settings from creation form
export interface TestCreationData {
  name: string;
  numberOfQuestions: number;
  timerMode: 'timer' | 'stopwatch' | 'none';
  durationMinutes?: number; // Input in minutes for timer
  markingCorrect: number;
  markingIncorrect: number;
}
