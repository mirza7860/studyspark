import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LearningMaterial } from '../types';
import { getAllSpaces, deleteSpace } from '../services/dbService';
import { BsFillFileEarmarkPdfFill } from "react-icons/bs";
//- A re-usable component for the icons
const Icon = ({ path, className }: { path: string; className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`h-5 w-5 ${className}`}
        fill="currentColor"
    >
        <path d={path} />
    </svg>
);

const PdfIcon = () => <BsFillFileEarmarkPdfFill/>;
const YouTubeIcon = () => <Icon path="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.08C21.91,9.9 22,10.95 22,12C22,13.05 21.91,14.1 21.84,14.92C21.78,15.73 21.69,16.36 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.73,18.78 17.92,18.84C17.1,18.91 16.05,19 15,19C13.95,19 12.9,18.91 12.08,18.84C11.27,18.78 10.64,18.69 10.17,18.56C9.27,18.31 8.69,17.73 8.44,16.83C8.31,16.36 8.22,15.73 8.16,14.92C8.09,14.1 8,13.05 8,12C8,10.95 8.09,9.9 8.16,9.08C8.22,8.27 8.31,7.64 8.44,7.17C8.69,6.27 9.27,5.69 10.17,5.44C10.64,5.31 11.27,5.22 12.08,5.16C12.9,5.09 13.95,5 15,5C16.05,5 17.1,5.09 17.92,5.16C18.73,5.22 19.36,5.31 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z"/>;

export const MySpaces = () => {
    const navigate = useNavigate();
    const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All Types');

    useEffect(() => {
        const fetchSpaces = async () => {
            const spaces = await getAllSpaces();
            setLearningMaterials(spaces);
        };

        fetchSpaces();
    }, []);

    const handleDeleteSpace = async (id: string) => {
        await deleteSpace(id);
        const spaces = await getAllSpaces();
        setLearningMaterials(spaces);
    };

    const filteredMaterials = learningMaterials
        .filter(material =>
            filterType === 'All Types' ? true : material.type === filterType.toLowerCase()
        )
        .filter(material =>
            material.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleGoToChat = (material: LearningMaterial) => {
        const path = material.type === 'pdf' ? `/chat/d/${material.id}` : `/chat/v/${material.id}`;
        navigate(path);
    };

    if (learningMaterials.length === 0) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">My Spaces</h2>
                <p className="text-gray-600 mb-4">You don't have any learning materials yet.</p>
                <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                    + Create New Space
                </button>
            </div>
        );
    }

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">My Spaces</h2>
                {/* <div className="flex items-center gap-4">
                    <input
                        type="search"
                        placeholder="Search..."
                        className="border border-gray-300 p-2 rounded-lg"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <select
                        className="border border-gray-300 p-2 rounded-lg"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option>All Types</option>
                        <option>PDF</option>
                        <option>YouTube</option>
                    </select>
                </div> */}
            </div>
            {filteredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredMaterials.map(material => (
                        <div key={material.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col group">
                            <div className="h-32 bg-gray-200 flex items-center justify-center">
                                {material.type === 'pdf' ? <PdfIcon /> : <YouTubeIcon />}
                            </div>
                            <div className="p-4 flex-grow">
                                <h3 className="font-bold text-gray-500 text-lg mb-2 truncate">{material.title}</h3>
                                <p className="text-sm text-gray-500">Last Accessed: {new Date(material.lastAccessed).toLocaleDateString()}</p>
                            </div>
                            <div className="p-4 pt-0 flex gap-2">
                                <button onClick={() => handleGoToChat(material)} className="w-full bg-gray-400 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                                    Go to Chat
                                </button>
                                <button onClick={() => handleDeleteSpace(material.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <p className="text-gray-600 text-lg">No materials found for your search.</p>
                </div>
            )}
        </div>
    );
}
