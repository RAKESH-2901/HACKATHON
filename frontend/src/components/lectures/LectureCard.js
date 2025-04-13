import React, { useState } from 'react';
import './LectureCard.css';

const LectureCard = ({ lecture, onEdit, onPublish }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(lecture.content);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        onEdit(editedContent);
        setIsEditing(false);
    };

    const handlePublish = () => {
        onPublish(lecture._id);
    };

    const handleContentChange = (field, value) => {
        if (field === 'keyPoints') {
            setEditedContent({
                ...editedContent,
                keyPoints: value.split('\n').filter(point => point.trim() !== '')
            });
        } else if (field.startsWith('detailedNotes')) {
            const [, index, subfield] = field.split('.');
            const newDetailedNotes = [...editedContent.detailedNotes];
            if (subfield === 'title') {
                newDetailedNotes[index] = {
                    ...newDetailedNotes[index],
                    title: value
                };
            } else if (subfield === 'points') {
                newDetailedNotes[index] = {
                    ...newDetailedNotes[index],
                    points: value.split('\n').filter(point => point.trim() !== '')
                };
            }
            setEditedContent({
                ...editedContent,
                detailedNotes: newDetailedNotes
            });
        } else {
            setEditedContent({
                ...editedContent,
                [field]: value
            });
        }
    };

    return (
        <div className="lecture-card">
            <div className="lecture-header">
                <div className="lecture-title">
                    <h3>{lecture.title}</h3>
                    {lecture.published && (
                        <span className="publish-status">Published</span>
                    )}
                </div>
                <div className="lecture-actions">
                    {isEditing ? (
                        <button className="save-button" onClick={handleSave}>
                            Save Changes
                        </button>
                    ) : (
                        <button className="edit-button" onClick={handleEdit}>
                            Edit Content
                        </button>
                    )}
                    <button 
                        className={`publish-button ${lecture.published ? 'published' : ''}`}
                        onClick={handlePublish}
                        disabled={lecture.published}
                    >
                        {lecture.published ? 'Published' : 'Publish to Students'}
                    </button>
                </div>
            </div>

            <div className="lecture-content">
                {isEditing ? (
                    <div className="edit-form">
                        <div className="form-group">
                            <label>Overview:</label>
                            <textarea
                                value={editedContent.overview}
                                onChange={(e) => handleContentChange('overview', e.target.value)}
                                rows={6}
                                placeholder="Enter lecture overview..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Key Points (one per line):</label>
                            <textarea
                                value={editedContent.keyPoints.join('\n')}
                                onChange={(e) => handleContentChange('keyPoints', e.target.value)}
                                rows={8}
                                placeholder="Enter key points..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Detailed Notes:</label>
                            {editedContent.detailedNotes.map((section, index) => (
                                <div key={index} className="detailed-section-edit">
                                    <input
                                        type="text"
                                        value={section.title}
                                        onChange={(e) => handleContentChange(`detailedNotes.${index}.title`, e.target.value)}
                                        placeholder="Section title..."
                                    />
                                    <textarea
                                        value={section.points.join('\n')}
                                        onChange={(e) => handleContentChange(`detailedNotes.${index}.points`, e.target.value)}
                                        rows={6}
                                        placeholder="Enter points (one per line)..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="lecture-text">
                        <h4>OVERVIEW:</h4>
                        <p>{editedContent.overview}</p>

                        <h4>KEY POINTS:</h4>
                        <ol>
                            {editedContent.keyPoints.map((point, index) => (
                                <li key={index}>{point}</li>
                            ))}
                        </ol>

                        <h4>DETAILED NOTES:</h4>
                        {editedContent.detailedNotes.map((section, index) => (
                            <div key={index} className="detailed-section">
                                <h5>{section.title}:</h5>
                                <ul>
                                    {section.points.map((point, pointIndex) => (
                                        <li key={pointIndex}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LectureCard; 