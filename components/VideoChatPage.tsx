import React, { useState, useEffect } from "react";
import { ControlPanel } from "./ControlPanel";
import { Loader } from "./Loader";
import { useParams } from "react-router-dom";
import { YouTubePlayer } from "./YouTubePlayer";
import { getSpace } from "../services/dbService";

export const VideoChatPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [videoTranscript, setVideoTranscript] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpace = async () => {
      if (!id) return;

      setIsLoading(true);
      setError(null);

      try {
        const space = await getSpace(id);
        if (space && space.videoId) {
          setVideoId(space.videoId);
          setVideoTranscript(space.videoTranscript || "");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center justify-center">
        <Loader />
        <p className="text-gray-600 mt-4">Loading your learning space...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center justify-center">
        <div className="text-center bg-red-100 border border-red-300 p-6 rounded-lg shadow-md">
          <p className="text-red-700 font-semibold mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!videoId) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center justify-center">
        <Loader />
        <p className="text-gray-600 mt-4">
          Something went wrong
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <main className="flex-grow flex flex-col items-center justify-center p-2 md:p-6">
        <div className="w-full h-full flex-grow grid grid-cols-1 lg:grid-cols-5 gap-6 overflow-hidden">
          <div className="lg:col-span-3 h-[calc(100vh-120px)] rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm">
            <YouTubePlayer videoId={videoId} />
          </div>
          <div className="lg:col-span-2 h-[calc(100vh-120px)] overflow-hidden">
            {videoTranscript ? (
              <ControlPanel documentText={videoTranscript} />
            ) : (
              <Loader />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};