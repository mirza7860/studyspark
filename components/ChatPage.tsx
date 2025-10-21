import React, { useState, useEffect } from "react";
import { PdfViewer } from "./PdfViewer";
import { ControlPanel } from "./ControlPanel";
import { Loader } from "./Loader";
import { extractTextFromPDF } from "../services/pdfService";
import { useParams } from "react-router-dom";
import { getSpace } from "../services/dbService";

export const ChatPage: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchSpace = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const space = await getSpace(id);
        if (space && space.pdfFile) {
          setPdfFile(space.pdfFile);
          if (space.documentText) {
            setPdfText(space.documentText);
          } else {
            const text = await extractTextFromPDF(space.pdfFile);
            setPdfText(text);
          }
        }
      } catch (err) {
        console.error("Failed to fetch space:", err);
        setError("Failed to load the learning space.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpace();
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col postion-fixed">
      <main className="flex-grow flex flex-col items-center justify-center p-2 md:p-6">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader />
            <p className="text-gray-600">
              Loading your learning space...
            </p>
          </div>
        ) : error ? (
          <div className="text-center bg-red-100 border border-red-300 p-6 rounded-lg shadow-md">
            <p className="text-red-700 font-semibold mb-4">{error}</p>
          </div>
        ) : pdfFile ? (
          <div className="w-full h-full flex-grow grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-hidden">
            <div className="lg:col-span-3 h-[calc(100vh-120px)] rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
              <PdfViewer file={pdfFile} />
            </div>
            <div className="lg:col-span-2 h-[calc(100vh-120px)] overflow-hidden">
              {pdfText ? <ControlPanel documentText={pdfText} /> : <Loader />}
            </div>
          </div>
        ) : (
          <div>Something went wrong</div>
        )}
      </main>
    </div>
  );
};