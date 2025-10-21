import React, { useState } from 'react';
import { getYouTubeVideoId } from '../services/youtubeService';
import { Loader } from './Loader';

interface YouTubeUrlInputProps {
    onUrlSubmit: (videoId: string) => void;
}

export const YouTubeUrlInput: React.FC<YouTubeUrlInputProps> = ({ onUrlSubmit }) => {
    const [url, setUrl] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!url) {
            setError('Please enter a YouTube URL.');
            return;
        }

        setIsLoading(true);
        const videoId = getYouTubeVideoId(url);

        if (videoId) {
            onUrlSubmit(videoId);
        } else {
            setError('Invalid YouTube URL. Please check the URL and try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Study with a YouTube Video</h2>
            <p className="text-gray-600 mb-6 text-center">
                Enter the URL of the YouTube video you want to study.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full text-gray-500 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center disabled:bg-blue-400"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader /> : 'Start Learning'}
                </button>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
            </form>
        </div>
    );
};