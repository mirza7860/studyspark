import React, { useState, useEffect } from 'react';

interface SpaceCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, topic?: string) => void;
  type: 'pdf' | 'youtube' | 'learnAnything';
}

const SpaceCreationModal: React.FC<SpaceCreationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  type,
}) => {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setName('');
      setTopic('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '') {
      alert('Please enter a name for your space.');
      return;
    }
    if (type === 'learnAnything' && topic.trim() === '') {
      alert('Please enter what you want to learn about.');
      return;
    }
    onSubmit(name, type === 'learnAnything' ? topic : undefined);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Create New {type === 'pdf' ? 'Document' : type === 'youtube' ? 'Video' : 'Learning'} Space
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="spaceName" className="block text-gray-700 text-sm font-bold mb-2">
              Space Name:
            </label>
            <input
              type="text"
              id="spaceName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My AI Notes"
            />
          </div>
          {type === 'learnAnything' && (
            <div className="mb-4">
              <label htmlFor="learningTopic" className="block text-gray-700 text-sm font-bold mb-2">
                What do you want to learn about?
              </label>
              <textarea
                id="learningTopic"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Quantum Physics, React Hooks, etc."
                rows={4}
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Create Space
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpaceCreationModal;
