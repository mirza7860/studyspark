import React, { useState, useMemo } from "react";
import type { Flashcard } from "../types";
import { generateFlashcards } from "../services/geminiService";
import { Loader } from "./Loader";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

interface FlashcardViewProps {
  documentText: string;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
  },
  card: {
    border: "2px solid #000",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    width: "100%",
    breakInside: "avoid",
  },
  term: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  definition: {
    fontSize: 18,
  },
});

const FlashcardPDF: React.FC<{ flashcards: Flashcard[] }> = ({
  flashcards,
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {flashcards.map((card, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.term}>{card.term}</Text>
          <Text style={styles.definition}>{card.definition}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  documentText,
}) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flippedStates, setFlippedStates] = useState<boolean[]>([]);
  const [numFlashcards, setNumFlashcards] = useState(10);

  // -------- CONFIG: responsive fixed sizes ----------
  // small: 420x260, md: 520x340, lg: 640x420
  const CARD_CLASS = "w-[400px] h-[200px]";
  // -------------------------------------------------

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const cards = await generateFlashcards(documentText, numFlashcards);
      setFlashcards(cards);
      setCurrentIndex(0);
      setFlippedStates(new Array(cards.length).fill(false));
    } catch (err) {
      console.error(err);
      setError("Failed to generate flashcards. Please try again.");
      setFlashcards([]);
      setCurrentIndex(0);
      setFlippedStates([]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentCard = useMemo(
    () => flashcards[currentIndex],
    [flashcards, currentIndex]
  );

  const handleNext = () => {
    if (flashcards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    if (flashcards.length === 0) return;
    setCurrentIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  const handleFlip = () => {
    if (flashcards.length === 0) return;
    const newFlippedStates = [...flippedStates];
    newFlippedStates[currentIndex] = !newFlippedStates[currentIndex];
    setFlippedStates(newFlippedStates);
  };

  const handleExport = async () => {
    const blob = await pdf(<FlashcardPDF flashcards={flashcards} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "flashcards.pdf";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 gap-6 bg-gray-100">
      <div className="flex items-center gap-2">
        <label htmlFor="num-flashcards" className="text-gray-700">
          Number of Flashcards:
        </label>
        <input
          id="num-flashcards"
          type="number"
          min="1"
          max="30"
          value={numFlashcards}
          onChange={(e) =>
            setNumFlashcards(Math.min(30, parseInt(e.target.value || "1", 10)))
          }
          className="w-20 p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <Loader />
          <p>Crafting some flashcards for you...</p>
        </div>
      )}
      {error && (
        <div className="flex items-center justify-center h-full text-red-500">
          {error}
        </div>
      )}

      {flashcards.length > 0 && !isLoading && (
        <>
          {/* FIXED-SIZE CARD (responsive) */}
          <div
            className={`cursor-pointer ${CARD_CLASS} flex items-center justify-center`}
            onClick={handleFlip}
            style={{ perspective: 1200 }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleFlip();
              }
            }}
            aria-label="Flashcard (click or press Enter to flip)"
          >
            {/* Flip container */}
            <div
              className="relative w-full h-full transition-transform duration-600 will-change-transform"
              style={{
                transformStyle: "preserve-3d",
                transform: flippedStates[currentIndex]
                  ? "rotateY(180deg)"
                  : "rotateY(0deg)",
              }}
            >
              {/* FRONT SIDE */}
              <div
                className="absolute inset-0 flex items-center justify-center p-8 bg-white rounded-xl border border-gray-300 shadow-md"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {/* Make term big, wrap, and centered */}
                <p className="text-md sm:text-4xl lg:text-5xl font-extrabold text-center text-gray-800 leading-tight break-words whitespace-normal">
                  {currentCard?.term ?? "—"}
                </p>
              </div>

              {/* BACK SIDE */}
              <div
                className="absolute inset-0 flex items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-300 shadow-inner"
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                }}
              >
                {/* Make definition readable: larger text + scrolling if long */}
                <div className="w-full h-full overflow-auto">
                  <p className="text-lg sm:text-xl text-center text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                    {currentCard?.definition ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-500">
            {currentIndex + 1} / {flashcards.length}
          </p>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              aria-label="Previous card"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
              aria-label="Next card"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handleExport}
              className="text-sm text-gray-500 hover:text-gray-400"
            >
              Export to PDF
            </button>
          </div>
        </>
      )}

      <button
        onClick={handleGenerate}
        className="bg-gray-300 text-gray-800 hover:bg-gray-400 font-bold py-3 px-6 rounded-lg transition-colors"
      >
        {flashcards.length > 0 ? "Generate New Set" : "Generate Flashcards"}
      </button>
    </div>
  );
};
