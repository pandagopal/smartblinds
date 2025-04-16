import React, { useState } from 'react';

interface RoomType {
  room_id: number;
  name: string;
  description?: string;
  image_url?: string;
}

interface RoomRecommendation {
  room_id: number;
  recommendation_level: number;
  recommendation_note?: string;
}

interface RoomRecommendationsProps {
  roomTypes: RoomType[];
  recommendations: RoomRecommendation[];
  onChange: (recommendations: RoomRecommendation[]) => void;
  onSave: () => void;
  isSaving: boolean;
}

const RoomRecommendations: React.FC<RoomRecommendationsProps> = ({
  roomTypes,
  recommendations,
  onChange,
  onSave,
  isSaving
}) => {
  const [editNoteId, setEditNoteId] = useState<number | null>(null);
  const [newNote, setNewNote] = useState<string>('');

  // Get recommendation for a room
  const getRecommendation = (roomId: number) => {
    return recommendations.find(rec => rec.room_id === roomId);
  };

  // Check if a room has a recommendation
  const hasRecommendation = (roomId: number) => {
    return getRecommendation(roomId) !== undefined;
  };

  // Get level for a room
  const getRecommendationLevel = (roomId: number) => {
    const rec = getRecommendation(roomId);
    return rec ? rec.recommendation_level : 0;
  };

  // Get note for a room
  const getRecommendationNote = (roomId: number) => {
    const rec = getRecommendation(roomId);
    return rec?.recommendation_note || '';
  };

  // Handle toggling a room recommendation
  const handleToggleRoom = (roomId: number) => {
    if (hasRecommendation(roomId)) {
      onChange(recommendations.filter(rec => rec.room_id !== roomId));
    } else {
      onChange([
        ...recommendations,
        {
          room_id: roomId,
          recommendation_level: 3 // Default middle level
        }
      ]);
    }
  };

  // Handle changing recommendation level
  const handleChangeLevel = (roomId: number, level: number) => {
    onChange(
      recommendations.map(rec => {
        if (rec.room_id === roomId) {
          return { ...rec, recommendation_level: level };
        }
        return rec;
      })
    );
  };

  // Handle starting note edit
  const handleStartNoteEdit = (roomId: number) => {
    setEditNoteId(roomId);
    setNewNote(getRecommendationNote(roomId));
  };

  // Handle saving note
  const handleSaveNote = () => {
    if (editNoteId === null) return;

    onChange(
      recommendations.map(rec => {
        if (rec.room_id === editNoteId) {
          return { ...rec, recommendation_note: newNote.trim() };
        }
        return rec;
      })
    );

    setEditNoteId(null);
  };

  // Recommendation levels visual representations
  const getLevelName = (level: number) => {
    switch (level) {
      case 1: return 'Not Recommended';
      case 2: return 'Adequate';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return 'No Recommendation';
    }
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-yellow-500';
      case 4: return 'bg-green-500';
      case 5: return 'bg-emerald-500';
      default: return 'bg-gray-300';
    }
  };

  const renderRoomImage = (roomType: RoomType) => {
    if (roomType.image_url) {
      return (
        <img
          src={roomType.image_url}
          alt={roomType.name}
          className="h-24 w-full object-cover rounded-t-lg"
        />
      );
    }

    // Return a placeholder based on room type
    switch (roomType.name.toLowerCase()) {
      case 'living room':
        return (
          <div className="h-24 bg-blue-50 flex items-center justify-center rounded-t-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        );
      case 'bedroom':
        return (
          <div className="h-24 bg-indigo-50 flex items-center justify-center rounded-t-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12h18M3 12a9 9 0 019-9m9 9a9 9 0 01-9 9m9-9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
            </svg>
          </div>
        );
      case 'kitchen':
        return (
          <div className="h-24 bg-amber-50 flex items-center justify-center rounded-t-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 01-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
            </svg>
          </div>
        );
      case 'bathroom':
        return (
          <div className="h-24 bg-cyan-50 flex items-center justify-center rounded-t-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
          </div>
        );
      case 'home office':
        return (
          <div className="h-24 bg-gray-50 flex items-center justify-center rounded-t-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
      case 'dining room':
        return (
          <div className="h-24 bg-orange-50 flex items-center justify-center rounded-t-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        );
      case 'sunroom':
        return (
          <div className="h-24 bg-yellow-50 flex items-center justify-center rounded-t-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        );
      case 'nursery':
        return (
          <div className="h-24 bg-pink-50 flex items-center justify-center rounded-t-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="h-24 bg-gray-50 flex items-center justify-center rounded-t-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Room Recommendations</h3>
        <p className="text-sm text-gray-500 mb-4">
          Specify which room types this product is recommended for and add notes about suitability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roomTypes.map((roomType) => {
          const isRecommended = hasRecommendation(roomType.room_id);
          const recommendationLevel = getRecommendationLevel(roomType.room_id);
          const recommendationNote = getRecommendationNote(roomType.room_id);

          return (
            <div
              key={roomType.room_id}
              className={`border rounded-lg overflow-hidden transition ${
                isRecommended ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Room type image/icon */}
              {renderRoomImage(roomType)}

              {/* Room information */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{roomType.name}</h4>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isRecommended}
                        onChange={() => handleToggleRoom(roomType.room_id)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {isRecommended ? 'Included' : 'Not Included'}
                      </span>
                    </label>
                  </div>
                </div>

                {roomType.description && (
                  <p className="text-sm text-gray-500 mb-3">{roomType.description}</p>
                )}

                {/* Recommendation settings (if selected) */}
                {isRecommended && (
                  <div className="mt-4 space-y-4">
                    {/* Recommendation level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recommendation Level
                      </label>
                      <div className="flex items-center">
                        <div className="flex-grow grid grid-cols-5 gap-1 mr-3">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => handleChangeLevel(roomType.room_id, level)}
                              className={`h-2 rounded-full ${
                                level <= recommendationLevel ? getLevelColor(level) : 'bg-gray-200'
                              }`}
                              title={getLevelName(level)}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-medium whitespace-nowrap">
                          {getLevelName(recommendationLevel)}
                        </span>
                      </div>
                    </div>

                    {/* Recommendation note */}
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-medium text-gray-700">
                          Recommendation Note
                        </label>
                        {recommendationNote && editNoteId !== roomType.room_id && (
                          <button
                            onClick={() => handleStartNoteEdit(roomType.room_id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                        )}
                      </div>

                      {editNoteId === roomType.room_id ? (
                        <div className="mt-1">
                          <textarea
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                            placeholder="Why is this product good (or not) for this room type?"
                          />
                          <div className="flex justify-end mt-1">
                            <button
                              onClick={() => setEditNoteId(null)}
                              className="text-xs text-gray-500 hover:text-gray-700 mr-2"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveNote}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : recommendationNote ? (
                        <p className="mt-1 text-sm text-gray-600 border-l-2 border-gray-200 pl-2 italic">
                          {recommendationNote}
                        </p>
                      ) : (
                        <button
                          onClick={() => handleStartNoteEdit(roomType.room_id)}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                        >
                          Add Note
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Save button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onSave}
          disabled={isSaving || recommendations.length === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Recommendations'}
        </button>
      </div>
    </div>
  );
};

export default RoomRecommendations;
