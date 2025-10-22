import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AIChatWidget from './AIChatWidget';
import learnAnythingService from '../services/learnAnythingService';
import { addLearningContent, getLearningContent, updateLearningContent, LearnAnythingData } from '../services/dbService';
import { LearningModule, SubModule, QuizQuestion, ChatMessage, OneLineQuestion, ModuleStatus, SubModuleStatus } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Book, BookOpen, CheckCircle, Lock, PlayCircle, HelpCircle, MessageSquare, X } from 'lucide-react'; // Icons

const LearnAnythingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [topic, setTopic] = useState('');
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubModule, setSelectedSubModule] = useState<SubModule | null>(null);
  const [currentLearningSession, setCurrentLearningSession] = useState<LearnAnythingData | null>(null);
  const [userAnswers, setUserAnswers] = useState<{[key: string]: string}>({});
  const [showChatWidget, setShowChatWidget] = useState(false);

  // Function to handle chat messages from AIChatWidget
  const handleNewChatMessage = async (newMessage: ChatMessage) => {
    if (currentLearningSession) {
      const updatedChatHistory = [...currentLearningSession.chatHistory, newMessage];
      const updatedSession = { ...currentLearningSession, chatHistory: updatedChatHistory };
      setCurrentLearningSession(updatedSession);
      await updateLearningContent(updatedSession);
    }
  };

  useEffect(() => {
    const loadLearningContent = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const session = await getLearningContent(id);
          if (session) {
            setTopic(session.topic);
            setLearningModules(session.modules);
            setCurrentLearningSession(session);
            setUserAnswers(session.userAnswers || {}); // Initialize userAnswers from session
            // If modules are not yet generated, generate them
            if (session.modules.length === 0) {
              const generatedModules = await learnAnythingService.generateLearningContent(session.topic);
              const updatedSession = { ...session, modules: generatedModules };
              setCurrentLearningSession(updatedSession);
              setLearningModules(generatedModules);
              await updateLearningContent(updatedSession);
            }
          }
        } catch (error) {
          console.error("Error loading learning content:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadLearningContent();
  }, [id]);

  const handleTopicChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const generatedModules = await learnAnythingService.generateLearningContent(topic);
      setLearningModules(generatedModules);
      setSelectedSubModule(null);

      if (currentLearningSession) {
        // Update existing session if available
        const updatedSession = { ...currentLearningSession, topic, modules: generatedModules, chatHistory: [], userAnswers: {} };
        setCurrentLearningSession(updatedSession);
        await updateLearningContent(updatedSession);
      } else {
        // Save new learning session to IndexedDB
        const newSession = await addLearningContent({
          topic,
          modules: generatedModules,
          chatHistory: [],
          userAnswers: {},
        });
        setCurrentLearningSession(newSession);
      }

    } catch (error) {
      console.error("Error generating learning content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubModuleClick = (subModule: SubModule) => {
    if (subModule.status === 'unlocked' || subModule.status === 'completed') {
      setSelectedSubModule(subModule);
    }
  };

  const handleAnswerChange = async (exerciseId: string, value: string) => {
    const updatedUserAnswers = { ...userAnswers, [exerciseId]: value };
    setUserAnswers(updatedUserAnswers);

    if (currentLearningSession) {
      const updatedSession = { ...currentLearningSession, userAnswers: updatedUserAnswers };
      setCurrentLearningSession(updatedSession);
      await updateLearningContent(updatedSession);
    }
  };

  const handleSubmitAllExercises = async () => {
    if (!selectedSubModule) return;

    let correctCount = 0;
    const totalExercises = selectedSubModule.exercises.length;

    const updatedExercises = selectedSubModule.exercises.map(exercise => {
      let isCorrect = false;
      const userAnswer = userAnswers[exercise.id]?.trim().toLowerCase();

      if ('options' in exercise) { // QuizQuestion
        isCorrect = userAnswer === exercise.correctAnswer.trim().toLowerCase();
      } else { // OneLineQuestion
        isCorrect = userAnswer === exercise.correctAnswer.trim().toLowerCase();
      }

      if (isCorrect) correctCount++;
      return { ...exercise, userAnswer, isCorrect };
    });

    const isSubModuleCompleted = correctCount === totalExercises;

    const updatedModules = learningModules.map(mod => {
      if (mod.subModules.some(sm => sm.id === selectedSubModule.id)) {
        return {
          ...mod,
          subModules: mod.subModules.map(sm => {
            if (sm.id === selectedSubModule.id) {
              return { ...sm, exercises: updatedExercises, status: isSubModuleCompleted ? 'completed' : sm.status };
            }
            return sm;
          }),
        };
      }
      return mod;
    });

    setLearningModules(updatedModules);

    // Update selectedSubModule to reflect new exercise states
    setSelectedSubModule(prev => prev ? { ...prev, exercises: updatedExercises, status: isSubModuleCompleted ? 'completed' : prev.status } : null);

    if (currentLearningSession) {
      await updateLearningContent({ ...currentLearningSession, modules: updatedModules, userAnswers: userAnswers });
    }

    // Check if module is completed and unlock next
    const currentModule = updatedModules.find(mod => mod.subModules.some(sm => sm.id === selectedSubModule.id));
    if (currentModule && currentModule.subModules.every(sm => sm.status === 'completed')) {
      const nextModuleIndex = updatedModules.findIndex(mod => mod.id === currentModule.id) + 1;
      if (nextModuleIndex < updatedModules.length) {
        const nextModule = updatedModules[nextModuleIndex];
        if (nextModule.status === 'locked') {
          setIsLoading(true);
          try {
            const detailedSubModules = await learnAnythingService.generateDetailedModuleContent(nextModule.title, topic);
            const finalUpdatedModules = updatedModules.map((mod, index) => {
              if (index === nextModuleIndex) {
                return { ...mod, status: 'unlocked', subModules: detailedSubModules };
              }
              return mod;
            });
            setLearningModules(finalUpdatedModules);
            if (currentLearningSession) {
              await updateLearningContent({ ...currentLearningSession, modules: finalUpdatedModules });
            }
          } catch (err) {
            console.error("Error generating next module content:", err);
          } finally {
            setIsLoading(false);
          }
        }
      }
    }
  };

  // Calculate progress for the current module
  const currentModule = learningModules.find(mod => mod.subModules.some(sm => sm.id === selectedSubModule?.id));
  const totalSubModulesInCurrentModule = currentModule?.subModules.length || 0;
  const completedSubModulesInCurrentModule = currentModule?.subModules.filter(sm => sm.status === 'completed').length || 0;
  const progressPercentage = totalSubModulesInCurrentModule > 0 ? (completedSubModulesInCurrentModule / totalSubModulesInCurrentModule) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 font-sans p-6">
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="ml-4 text-lg text-gray-600">Generating your personalized learning path...</p>
        </div>
      )}

      <div className="learning-content-container flex gap-8 h-[calc(100vh-150px)]">
        {/* Left Pane: Learning Path */}
        <div className="modules-list w-96 flex-shrink-0 min-w-[24rem] bg-white rounded-xl shadow-lg p-6 overflow-y-auto border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <BookOpen size={24} className="text-blue-600" /> Learning Path
          </h2>
          {learningModules.length > 0 ? (
            learningModules.map((module) => (
              <div key={module.id} className={`mb-6 p-4 rounded-lg transition-all duration-300 ${module.status === 'locked' ? 'bg-gray-50 text-gray-500 border border-gray-100' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
                <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  {module.status === 'locked' ? <Lock size={20} /> : <Book size={20} />}
                  {module.title} {module.status === 'completed' && <CheckCircle size={20} className="text-green-500" />}
                </h3>
                <p className="text-sm mb-4">{module.description}</p>
                <div className="sub-modules-list ml-2 space-y-2">
                  {module.subModules.map((subModule) => (
                    <button
                      key={subModule.id}
                      onClick={() => handleSubModuleClick(subModule)}
                      className={`block w-full text-left p-3 rounded-md transition-colors duration-200 flex items-center gap-2 ${subModule.status === 'locked' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'hover:bg-blue-100 text-blue-700'} ${selectedSubModule?.id === subModule.id ? 'bg-blue-200 font-medium' : ''}`}
                      disabled={subModule.status === 'locked'}
                    >
                      {subModule.status === 'locked' ? <Lock size={16} /> : <PlayCircle size={16} />}
                      {subModule.title} {subModule.status === 'completed' && <CheckCircle size={16} className="text-green-500" />}
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No modules generated yet. Start by entering a topic!</p>
          )}
        </div>

        {/* Right Pane: Sub-module Details */}
        <div className="sub-module-details flex-grow min-w-0 bg-white rounded-xl shadow-lg p-8 overflow-y-auto border border-gray-200">
          {selectedSubModule ? (
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-800">{selectedSubModule.title}</h2>
              
              {/* Progress Bar */}
              {currentModule && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress in {currentModule.title}:</span>
                    <span className="text-sm font-medium text-gray-700">{completedSubModulesInCurrentModule}/{totalSubModulesInCurrentModule} ({progressPercentage.toFixed(0)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                  </div>
                </div>
              )}

              <div className="prose max-w-none mb-8 text-gray-700 leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {selectedSubModule.content}
                </ReactMarkdown>
              </div>

              {selectedSubModule.lessons.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-2xl font-bold mb-5 text-gray-800 flex items-center gap-2">
                    <Book size={24} className="text-green-600" /> Lessons
                  </h3>
                  {selectedSubModule.lessons.map(lesson => (
                    <div key={lesson.id} className="mb-6 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                      <h4 className="text-xl font-semibold mb-3 text-gray-800 flex items-center gap-2">
                        <PlayCircle size={20} className="text-purple-600" /> {lesson.title}
                      </h4>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {lesson.content}
                      </ReactMarkdown>
                    </div>
                  ))}
                </div>
              )}

              {selectedSubModule.exercises.length > 0 && (
                <div className="mb-10">
                  <h3 className="text-2xl font-bold mb-5 text-gray-800 flex items-center gap-2">
                    <HelpCircle size={24} className="text-orange-600" /> Exercises
                  </h3>
                  {selectedSubModule.exercises.map(exercise => (
                    <div key={exercise.id} className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                      <p className="font-semibold mb-4 text-gray-800">{exercise.question}</p>
                      {'options' in exercise ? (
                        // Quiz Question
                        <div className="flex flex-col gap-3">
                          {exercise.options.map((option, optIndex) => (
                            <label key={optIndex} className="inline-flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                              <input
                                type="radio"
                                name={`quiz-${exercise.id}`}
                                value={option}
                                onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                                className="form-radio text-blue-600 h-5 w-5"
                                checked={userAnswers[exercise.id] === option}
                              />
                              <span className="ml-3 text-gray-700 text-base">{option}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        // One-line Question
                        <input
                          type="text"
                          value={userAnswers[exercise.id] || ''}
                          onChange={(e) => handleAnswerChange(exercise.id, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                          placeholder="Your answer"
                        />
                      )}
                      {exercise.isCorrect !== undefined && (
                        <p className={`mt-4 text-lg font-medium ${exercise.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {exercise.isCorrect ? 'Correct! ✅' : `Incorrect. The answer was: ${exercise.correctAnswer} ❌`}
                        </p>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleSubmitAllExercises}
                    className="mt-5 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Submit All Exercises
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 text-lg">
              <MessageSquare size={48} className="mb-4 text-gray-400" />
              <p>Select a sub-module from the left to start your learning journey!</p>
            </div>
          )}
        </div>

        {/* AI Widget Toggle Button */}
        <button
          onClick={() => setShowChatWidget(true)}
          className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-40"
        >
          <MessageSquare size={24} />
        </button>

        {/* AI Widget Container */}
        {showChatWidget && selectedSubModule && currentLearningSession && (
          <AIChatWidget
            currentModuleContext={selectedSubModule.content}
            chatHistory={currentLearningSession.chatHistory}
            onNewChatMessage={handleNewChatMessage}
            onClose={() => setShowChatWidget(false)}
          />
        )}
      </div>
    </div>
  );
};

export default LearnAnythingPage;
