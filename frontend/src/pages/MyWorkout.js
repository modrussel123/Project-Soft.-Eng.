// MyWorkout.js in frontend/src/pages
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/Workouts.css";

const MyWorkout = () => {
    const [workouts, setWorkouts] = useState([]);
    const [newWorkout, setNewWorkout] = useState({ name: '', description: '', type: '' });
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [showModal, setShowModal] = useState(false);
    
    // Add polling interval (2 seconds)
    const POLLING_INTERVAL = 2000;
    
    useEffect(() => {
        // Initial fetch
        fetchWorkouts();
        
        // Set up polling interval
        const intervalId = setInterval(fetchWorkouts, POLLING_INTERVAL);
        
        // Cleanup on unmount
        return () => clearInterval(intervalId);
    }, []);

    const fetchWorkouts = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/workouts", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
            });
    
            const data = await response.json();
            if (response.ok) {
                // Compare with current state to avoid unnecessary re-renders
                setWorkouts(prevWorkouts => {
                    if (JSON.stringify(prevWorkouts) !== JSON.stringify(data)) {
                        return data;
                    }
                    return prevWorkouts;
                });
            } else {
                console.error(`Error: ${data.error}`);
            }
        } catch (error) {
            console.error("Error fetching workouts:", error);
        }
    };

    const handleEditClick = (workout) => {
        setEditingWorkout(workout);
        setNewWorkout({ 
            _id: workout._id,
            name: workout.name, 
            description: workout.description, 
            type: workout.type 
        });
        setShowModal(true);
    };

    const handleSaveWorkout = async () => {
        if (!newWorkout.name || !newWorkout.description || !newWorkout.type) {
            alert("Please fill in all fields.");
            return;
        }

        try {
            if (editingWorkout) {
                await axios.put(
                    `http://localhost:5000/api/workouts/${newWorkout._id}`,
                    newWorkout,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );
                // Remove local state update, let polling handle it
                setEditingWorkout(null);
            } else {
                await fetch("http://localhost:5000/api/workouts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify(newWorkout),
                });
                // Remove local state update, let polling handle it
            }
            setShowModal(false);
            setNewWorkout({ name: '', description: '', type: '' });
            // Trigger immediate fetch for faster UI update
            fetchWorkouts();
        } catch (error) {
            console.error("Error saving workout:", error);
        }
    };

    const handleDeleteWorkout = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/workouts/${id}`, {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            // Remove local state update, let polling handle it
            // Trigger immediate fetch for faster UI update
            fetchWorkouts();
        } catch (error) {
            console.error("Error deleting workout:", error);
        }
    };

    return (
        <div className="workout-container">
            <h2>My Workouts</h2>
            <button 
                onClick={() => { 
                    setEditingWorkout(null); 
                    setNewWorkout({ name: '', description: '', type: '' }); 
                    setShowModal(true); 
                }}
                className="add-workout-btn"
            >
                + Add Workout
            </button>
            
            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <input 
                            type="text" 
                            placeholder="Workout Name" 
                            value={newWorkout.name} 
                            onChange={(e) => setNewWorkout({ ...newWorkout, name: e.target.value })} 
                            className="modal-input"
                        />
                        <textarea 
                            placeholder="Description" 
                            value={newWorkout.description} 
                            onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
                            className="modal-textarea"
                        ></textarea>
                        <select 
                            value={newWorkout.type} 
                            onChange={(e) => setNewWorkout({ ...newWorkout, type: e.target.value })}
                            className="modal-select"
                        >
                            <option value="">Select Type</option>
                            <option value="Cardio">Cardio</option>
                            <option value="Strength">Strength</option>
                            <option value="Flexibility">Flexibility</option>
                            <option value="Balance">Balance</option>
                        </select>
                        <div className="modal-buttons">
                            <button 
                                onClick={handleSaveWorkout}
                                className="save-btn"
                            >
                                {editingWorkout ? "Update" : "Save"}
                            </button>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="cancel-btn"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <ul className="workout-list">
                {workouts.map(workout => (
                    <li key={workout._id} className="workout-item">
                        <h3 className="workout-title">{workout.name}</h3>
                        <p className="workout-description">{workout.description}</p>
                        <p className="workout-type">Type: {workout.type}</p>
                        <div className="workout-buttons">
                            <button 
                                onClick={() => handleEditClick(workout)}
                                className="edit-btn"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={() => handleDeleteWorkout(workout._id)}
                                className="delete-btn"
                            >
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MyWorkout;