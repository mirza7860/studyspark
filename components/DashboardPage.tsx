import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PdfUpload } from "./PdfUpload";
import { YouTubeUrlInput } from "./YouTubeUrlInput";
import { LogoIcon } from "./icons/LogoIcon";
import { extractTextFromPDF } from "../services/pdfService"; // <-- used to extract text on landing page
import { getYouTubeTranscript } from "../services/youtubeService";
import { Loader } from "./Loader";
import { MySpaces } from "./MySpaces";
import { addSpace, addLearningContent } from "../services/dbService";
import SpaceCreationModal from "./SpaceCreationModal";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"pdf" | "youtube" | "learnAnything">("pdf");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"pdf" | "youtube" | "learnAnything">("pdf");
  const [fileToProcess, setFileToProcess] = useState<File | null>(null);
  const [videoIdToProcess, setVideoIdToProcess] = useState<string | null>(null);

  const openModal = (type: "pdf" | "youtube" | "learnAnything") => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFileToProcess(null);
    setVideoIdToProcess(null);
  };

  const handleModalSubmit = async (name: string, topic?: string) => {
    setError(null);
    setIsProcessing(true);
    closeModal(); // Close modal immediately

    try {
      if (modalType === "pdf" && fileToProcess) {
        const text = await extractTextFromPDF(fileToProcess);
        const newSpace = await addSpace({ title: name, type: "pdf", pdfFile: fileToProcess, documentText: text });
        navigate(`/chat/d/${newSpace.id}`);
      } else if (modalType === "youtube" && videoIdToProcess) {
        const transcript = await getYouTubeTranscript(videoIdToProcess);
        const newSpace = await addSpace({ title: name, type: "youtube", videoId: videoIdToProcess, videoTranscript: transcript });
        navigate(`/chat/v/${newSpace.id}`);
      } else if (modalType === "learnAnything" && topic) {
        const newLearningContent = await addLearningContent({
          topic: topic,
          modules: [],
          chatHistory: [],
        });
        navigate(`/learn/${newLearningContent.id}`);
      }
    } catch (err) {
      console.error("Failed to create new space:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while creating the space.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

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
    setFileToProcess(file);
    openModal("pdf");
  };

  const handleUrlSubmit = async (videoId: string) => {
    setError(null);
    if (!videoId) {
      setError("No YouTube URL provided.");
      return;
    }
    setVideoIdToProcess(videoId);
    openModal("youtube");
  };

  const handleLearnAnythingClick = () => {
    openModal("learnAnything");
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
    } else if (activeTab === "youtube") {
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
    } else if (activeTab === "learnAnything") {
      return (
        <div className="flex flex-col items-center">
          <button
            onClick={handleLearnAnythingClick}
            className="px-6 py-3 font-semibold text-lg text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
            disabled={isProcessing}
          >
            Start a new "Learn Anything" space
          </button>
          {isProcessing && (
            <div className="mt-4 flex items-center justify-center gap-3">
              <Loader />
              <p className="text-gray-600">
                Creating new learning space — please wait...
              </p>
            </div>
          )}
          {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
        </div>
      );
    }
    return null;
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

            <div className="flex items-center justify-center my-4">
              <span className="text-gray-500">--- or ---</span>
            </div>

            <div className="flex justify-center">
              <button
                  onClick={() => {
                  setActiveTab("learnAnything");
                  setError(null);
                  setIsProcessing(false);
                  }}
                  className={`px-6 py-3 font-semibold text-lg transition-colors ${
                  activeTab === "learnAnything"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500"
                  }`}
              >
                  Learn Anything
              </button>
            </div>
        </div>
        <div className="w-full max-w-5xl mt-12">
            <MySpaces />
        </div>
      </main>

      <SpaceCreationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
        type={modalType}
      />
    </div>
  );
};