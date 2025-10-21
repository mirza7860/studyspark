import React, { useState } from 'react';
import type { ViewMode } from '../types';
import { ChatView } from './ChatView';
import { QuizView } from './QuizView';
import { FlashcardView } from './FlashcardView';
import { SummaryView } from './SummaryView';
import { ChatIcon } from './icons/ChatIcon';
import { QuizIcon } from './icons/QuizIcon';
import { FlashcardIcon } from './icons/FlashcardIcon';
import { SummaryIcon } from './icons/SummaryIcon';

interface ControlPanelProps {
    documentText: string;
}

const NAV_ITEMS = [
    { id: 'chat', label: 'Chat', icon: ChatIcon },
    { id: 'quiz', label: 'Quizzes', icon: QuizIcon },
    { id: 'flashcards', label: 'Flashcards', icon: FlashcardIcon },
    { id: 'summary', label: 'Summary', icon: SummaryIcon },
] as const;

export const ControlPanel: React.FC<ControlPanelProps> = ({ documentText }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('summary');

    const renderView = () => {
        switch (viewMode) {
            case 'chat':
                return <ChatView documentText={documentText} />;
            case 'quiz':
                return <QuizView documentText={documentText} />;
            case 'flashcards':
                return <FlashcardView documentText={documentText} />;
            case 'summary':
                return <SummaryView documentText={documentText} />;
            default:
                return null;
        }
    };
    
    return (
        <div className="flex flex-col h-full bg-white text-black rounded-xl">
            <nav className="flex-shrink-0 bg-gray-50 border rounded-full border-gray-200 ">
                <ul className="flex items-center justify-between p-2 space-x-1">
                    {NAV_ITEMS.map(item => (
                         <li key={item.id}>
                            <button
                                onClick={() => setViewMode(item.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors duration-200 text-sm font-medium ${ 
                                    viewMode === item.id 
                                        ? 'bg-gray-200 text-gray-900' 
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex-grow overflow-y-auto">
                {renderView()}
            </div>
        </div>
    );
};
