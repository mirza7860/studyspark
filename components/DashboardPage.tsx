

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PdfUpload } from "./PdfUpload";
import { YouTubeUrlInput } from "./YouTubeUrlInput";
import { LogoIcon } from "./icons/LogoIcon";
import { extractTextFromPDF } from "../services/pdfService"; // <-- used to extract text on landing page
import { getYouTubeTranscript } from "../services/youtubeService";
import { Loader } from "./Loader";
import { MySpaces } from "./MySpaces";
import { addSpace } from "../services/dbService";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"pdf" | "youtube">("pdf");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Called when PdfUpload provides a File
  const handleFileChange = async (file: File | null) => {
    setError(null);
    if (!file) {
      setError("No file selected.");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }

    const name = window.prompt("Enter a name for your space:");
    if (!name) return;

    setIsProcessing(true);
    try {
      const text = await extractTextFromPDF(file);
      const newSpace = await addSpace({ title: name, type: "pdf", pdfFile: file, documentText: text });
      navigate(`/chat/d/${newSpace.id}`);
    } catch (err) {
      console.error("PDF extraction failed on landing page:", err);
      setError(
        "Failed to extract text from the PDF. The file might be corrupted or image-based."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlSubmit = async (videoId: string) => {
    setError(null);
    const name = window.prompt("Enter a name for your space:");
    if (!name) return;

    setIsProcessing(true);
    try {
      const transcript = await getYouTubeTranscript(videoId);
      const newSpace = await addSpace({ title: name, type: "youtube", videoId, videoTranscript: transcript });
      navigate(`/chat/v/${newSpace.id}`);
    } catch (err) {
      console.error("Transcript fetch failed on landing page:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching the transcript.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActiveComponent = () => {
    if (activeTab === "pdf") {
      return (
        <>
          <PdfUpload onFileChange={handleFileChange} error={error} />
          {isProcessing && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <Loader />
              <p className="text-gray-600">
                Extracting text from PDF — please wait...
              </p>
            </div>
          )}
        </>
      );
    }
    return (
      <>
        <YouTubeUrlInput onUrlSubmit={handleUrlSubmit} />
        {isProcessing && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <Loader />
            <p className="text-gray-600">
              Fetching transcript — please wait...
            </p>
          </div>
        )}
        {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="flex flex-col items-center p-4 pt-24">
        <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-gray-800">What do you want to learn?</h1>
        </div>

        <div className="w-full max-w-lg">
            <div className="flex justify-center border-b border-gray-200 mb-4">
            <button
                onClick={() => {
                setActiveTab("pdf");
                setError(null);
                setIsProcessing(false);
                }}
                className={`px-6 py-3 font-semibold text-lg transition-colors ${
                activeTab === "pdf"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
            >
                Upload PDF
            </button>
            <button
                onClick={() => {
                setActiveTab("youtube");
                setError(null);
                setIsProcessing(false);
                }}
                className={`px-6 py-3 font-semibold text-lg transition-colors ${
                activeTab === "youtube"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500"
                }`}
            >
                YouTube Video
            </button>
            </div>

            {renderActiveComponent()}
        </div>
        <div className="w-full max-w-5xl mt-12">
            <MySpaces />
        </div>
      </main>
    </div>
  );
};

