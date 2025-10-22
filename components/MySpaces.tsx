import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LearningMaterial, LearningMaterialType } from '../types';
import { getAllSpaces, deleteSpace, getAllLearningContent, LearnAnythingData } from '../services/dbService';
import { BsFillFileEarmarkPdfFill } from "react-icons/bs";
import { FaYoutube, FaBookOpen, FaTrash, FaArrowRight } from "react-icons/fa"; // Icons for Learn Anything, Delete, Go to Space

// Define a combined type for displaying all learning materials
interface DisplayLearningMaterial {
    id: string;
    type: LearningMaterialType | 'learnAnything';
    title: string;
    lastAccessed: string; // ISO date string
}

export const MySpaces = () => {
    const navigate = useNavigate();
    const [learningMaterials, setLearningMaterials] = useState<DisplayLearningMaterial[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('All Types');

    useEffect(() => {
        const fetchSpaces = async () => {
            const traditionalSpaces = await getAllSpaces();
            const learnAnythingSpaces = await getAllLearningContent();

            const combinedSpaces: DisplayLearningMaterial[] = [
                ...traditionalSpaces.map(space => ({ ...space, type: space.type as LearningMaterialType })),
                ...learnAnythingSpaces.map(space => ({
                    id: space.id,
                    type: 'learnAnything',
                    title: space.topic, // Use topic as title for Learn Anything spaces
                    lastAccessed: space.lastAccessed,
                })),
            ];
            // Sort by lastAccessed, newest first
            combinedSpaces.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());
            setLearningMaterials(combinedSpaces);
        };

        fetchSpaces();
    }, []);

    const handleDeleteSpace = async (id: string, type: DisplayLearningMaterial['type']) => {
        if (type === 'learnAnything') {
            // Assuming you'll add a deleteLearningContent function to dbService
            // await deleteLearningContent(id);
            console.warn("Delete functionality for Learn Anything spaces not yet implemented.");
        } else {
            await deleteSpace(id);
        }
        // Re-fetch all spaces after deletion
        const traditionalSpaces = await getAllSpaces();
        const learnAnythingSpaces = await getAllLearningContent();
        const combinedSpaces: DisplayLearningMaterial[] = [
            ...traditionalSpaces.map(space => ({ ...space, type: space.type as LearningMaterialType })),
            ...learnAnythingSpaces.map(space => ({
                id: space.id,
                type: 'learnAnything',
                title: space.topic,
                lastAccessed: space.lastAccessed,
            })),
        ];
        combinedSpaces.sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime());
        setLearningMaterials(combinedSpaces);
    };

    const filteredMaterials = learningMaterials
        .filter(material =>
            filterType === 'All Types' ? true : material.type === filterType.toLowerCase()
        )
        .filter(material =>
            material.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

    const handleGoToChat = (material: DisplayLearningMaterial) => {
        if (material.type === 'pdf') {
            navigate(`/chat/d/${material.id}`);
        } else if (material.type === 'youtube') {
            navigate(`/chat/v/${material.id}`);
        } else if (material.type === 'learnAnything') {
            navigate(`/learn/${material.id}`);
        }
    };

    const getTypeName = (type: DisplayLearningMaterial['type']) => {
        switch (type) {
            case 'pdf': return 'Document';
            case 'youtube': return 'Video';
            case 'learnAnything': return "Custom";
            default: return 'Unknown';
        }
    };

    const getTypeIcon = (type: DisplayLearningMaterial['type']) => {
        switch (type) {
            case 'pdf': return <BsFillFileEarmarkPdfFill className="text-red-500" />;
            case 'youtube': return <FaYoutube className="text-red-600" />;
            case 'learnAnything': return <FaBookOpen className="text-blue-600" />;
            default: return null;
        }
    };

    if (learningMaterials.length === 0) {
        return (
            <div className="p-8 text-center bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">My Spaces</h2>
                <p className="text-gray-600 mb-4">You don't have any learning materials yet.</p>
                <button onClick={() => navigate('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                    + Create New Space
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">My Spaces</h2>
                {/* Search and Filter - uncomment and implement if needed */}
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
                        <option>Document</option>
                        <option>Video</option>
                        <option>Learn Anything</option>
                    </select>
                </div> */}
            </div>
            {filteredMaterials.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {filteredMaterials.map(material => (
                        <div key={material.id} className="bg-gray-50 rounded-lg shadow-sm p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-lg font-bold text-gray-800">{material.title}</span>
                                <span className="text-sm text-gray-600">({getTypeName(material.type)})</span>
                                <span className="text-sm text-gray-500">{new Date(material.lastAccessed).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleGoToChat(material)} className="p-2 rounded-full hover:bg-gray-200 text-blue-600">
                                    <FaArrowRight size={20} />
                                </button>
                                <button onClick={() => handleDeleteSpace(material.id, material.type)} className="p-2 rounded-full hover:bg-gray-200 text-red-600">
                                    <FaTrash size={20} />
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