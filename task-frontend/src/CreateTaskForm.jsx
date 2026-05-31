import { useState } from 'react';

export default function CreateTaskForm({ onTaskAdded }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [createdBy, setCreatedBy] = useState('Efrat'); // שמך יופיע כברירת מחדל!

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title) return;

        // שליחת המשימה ל- Backend שלנו בקוברנטיס!
        fetch(`http://localhost:8080/api/tasks?createdBy=${createdBy}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description })
        })
            .then(async response => {
                if (!response.ok) { // הגנה מפני קריסות!
                    const err = await response.text();
                    throw new Error("Server rejected the task. " + err);
                }
                return response.json();
            })
            .then(newTask => {
                onTaskAdded(newTask); // עדכון הרשימה במסך
                setTitle(''); // ניקוי שורת הכותרת
                setDescription(''); // ניקוי התיאור
            })
            .catch(error => {
                console.error("Error creating task:", error);
                alert("אופס! המשימה לא נשמרה בשרת."); // מקפיץ התראה במקום לרסק את המסך
            });
    };

    return (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '20px', marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>✨ Create New Task</h2>

            <input
                type="text"
                placeholder="Task Title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem' }}
                required
            />

            <textarea
                placeholder="Task Description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '1rem', minHeight: '80px', fontFamily: 'inherit' }}
            />

            <button
                type="submit"
                style={{ padding: '12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(45deg, #00dbde, #fc00ff)', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.2s' }}
                onMouseOver={(e) => e.target.style.opacity = '0.8'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
            >
                Submit Task
            </button>
        </form>
    );
}
