import React, { useState } from "react";
import type { QuizQuestion } from "../types";
import { generateQuiz } from "../services/geminiService";
import { Loader } from "./Loader";
import {
  ArrowUturnLeftIcon,
  EllipsisVerticalIcon,
} from "@heroicons/react/24/solid";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

interface QuizViewProps {
  documentText: string;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  questionContainer: {
    marginBottom: 20,
  },
  question: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  answer: {
    fontSize: 16,
  },
});

const QuizPDF: React.FC<{
  questions: QuizQuestion[];
  userAnswers: string[];
}> = ({ questions, userAnswers }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {questions.map((q, i) => (
        <View key={i} style={styles.questionContainer}>
          <Text style={styles.question}>
            {i + 1}. {q.question}
          </Text>
          <Text style={styles.answer}>
            Your answer: {userAnswers[i] || "Not answered"}
          </Text>
          {userAnswers[i] !== q.correctAnswer && (
            <Text style={styles.answer}>Correct answer: {q.correctAnswer}</Text>
          )}
        </View>
      ))}
    </Page>
  </Document>
);

export const QuizView: React.FC<QuizViewProps> = ({ documentText }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);

  const handleGenerateQuiz = async () => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setShowResults(false);
    try {
      const generatedQuestions = await generateQuiz(documentText, numQuestions);
      setQuestions(generatedQuestions);
    } catch (err) {
      console.error(err);
      setError("Failed to generate quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
    // Automatically move to the next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
      } else {
        setShowResults(true);
      }
    }, 300);
  };

  const calculateScore = () => {
    return questions.reduce((score, question, index) => {
      return score + (question.correctAnswer === userAnswers[index] ? 1 : 0);
    }, 0);
  };

  const handleExport = async () => {
    const blob = await pdf(
      <QuizPDF questions={questions} userAnswers={userAnswers} />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz_results.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader />
        <p>Brewing up some questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 p-4 text-center">
        {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 p-4">
        <h2 className="text-2xl font-bold text-gray-800">Generate a Quiz</h2>
        <p className="text-gray-600 text-center">
          Test your knowledge by generating a quiz from the document.
        </p>
        <div className="flex items-center gap-3">
          <label htmlFor="num-questions" className="text-gray-700 font-medium">
            Number of Questions:
          </label>
          <input
            id="num-questions"
            type="number"
            min="1"
            max="30"
            value={numQuestions}
            onChange={(e) =>
              setNumQuestions(Math.min(30, parseInt(e.target.value, 10)))
            }
            className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>
        <button
          onClick={handleGenerateQuiz}
          className="bg-gray-300 text-gray-800 hover:bg-gray-400 font-bold py-3 px-8 rounded-lg shadow-md"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="p-6 md:p-8 text-center bg-white">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          Quiz Completed!
        </h2>
        <p className="text-lg text-gray-600 mb-6">Your score is:</p>
        <p className="text-6xl font-bold mb-8 text-blue-600">
          {score} / {questions.length}
        </p>
        <div className="space-y-4 text-left max-w-3xl mx-auto">
          {questions.map((q, i) => (
            <div
              key={i}
              className={`p-4 rounded-lg border-l-4 ${
                userAnswers[i] === q.correctAnswer
                  ? "border-green-500 bg-green-50"
                  : "border-red-500 bg-red-50"
              }`}
            >
              <p className="font-semibold text-gray-800">
                {i + 1}. {q.question}
              </p>
              <p
                className={`text-sm mt-2 ${
                  userAnswers[i] === q.correctAnswer
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                Your answer:{" "}
                <span className="font-semibold">
                  {userAnswers[i] || "Not answered"}
                </span>
              </p>
              {userAnswers[i] !== q.correctAnswer && (
                <p className="text-sm mt-1 text-green-800">
                  Correct answer:{" "}
                  <span className="font-semibold">{q.correctAnswer}</span>
                </p>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={handleGenerateQuiz}
          className="mt-8 mx-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Take Another Quiz
        </button>
        <button
          onClick={handleExport}
          className="mt-8 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
        >
          Export to PDF
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="p-4 md:p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-medium text-gray-600">
          {currentQuestionIndex + 1}/{questions.length}
        </span>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mx-4">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <button className="p-2 rounded-full hover:bg-gray-200 ml-2">
          <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      {/* Question */}
      <div className="text-center my-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {currentQuestion.question}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-4">
        {currentQuestion.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswerSelect(option)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-semibold text-lg flex items-center
                            ${
                              userAnswers[currentQuestionIndex] === option
                                ? option === currentQuestion.correctAnswer
                                  ? "border-green-500 bg-green-50 text-green-800"
                                  : "border-red-500 bg-red-50 text-red-800"
                                : "border-gray-200 bg-white hover:bg-gray-50 hover:border-blue-400"
                            }`}
          >
            <span className="mr-4 font-bold text-gray-400">
              {String.fromCharCode(65 + index)}
            </span>
            <span>{option}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
