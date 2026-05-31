import { useState, useEffect } from 'react';
import CreateTaskForm from './CreateTaskForm';
import './index.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // מצב חדש לחיפוש!
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null); // מי המשימה שנערכת כרגע?
  const [editFormData, setEditFormData] = useState({ title: '', description: '' }); // שומר את הטקסט שאת מקלידה
  const [expandedTaskIds, setExpandedTaskIds] = useState([]); // שומר אילו משימות כרגע מוצגות באופן מלא
  const [showRecycleBin, setShowRecycleBin] = useState(false); // מתג לסל המיחזור

  const fetchTasks = (priority = filterPriority, category = filterCategory) => {
    let url = 'http://localhost:8080/api/tasks';

    // אם בחרנו סינון - משתמשים בפונקציית ה- search של השרת!
    if (priority || category) {
      url = 'http://localhost:8080/api/tasks/search?';
      const params = new URLSearchParams();
      if (priority) params.append('priority', priority);
      if (category) params.append('category', category);
      url += params.toString();
    }

    fetch(url)
      .then(response => response.json())
      .then(data => setTasks(data))
      .catch(error => console.error("Error fetching tasks:", error));
  };

  const handleFilterChange = (type, value) => {
    if (type === 'priority') {
      setFilterPriority(value);
      fetchTasks(value, filterCategory);
    } else {
      setFilterCategory(value);
      fetchTasks(filterPriority, value);
    }
  };

  const toggleReadMore = (taskId) => {
    setExpandedTaskIds(prev =>
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskAdded = (newTask) => {
    setTasks(prevTasks => [newTask, ...prevTasks]);
    setIsFormVisible(false);

    setTimeout(() => {
      fetchTasks();
    }, 4000);
  };

  const handleDeleteTask = (taskId) => {
    const taskToCancel = tasks.find(t => t.id === taskId);
    if (!taskToCancel) return;

    // שולחים עדכון (PUT) עם סטטוס CANCELLED במקום למחוק (DELETE)!
    fetch(`http://localhost:8080/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: taskToCancel.title,
        description: taskToCancel.description,
        priority: taskToCancel.priority,
        category: taskToCancel.category,
        tags: taskToCancel.tags,
        status: 'CANCELLED' // הופכים למבוטל
      })
    })
      .then(() => {
        // מעדכנים את הזיכרון ב- React שהמשימה בוטלה (כדי שנוכל לשלוף אותה לסל מיחזור בעתיד)
        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: 'CANCELLED' } : t));
      })
      .catch(error => console.error("Error archiving task:", error));
  };

  const handleRestoreTask = (taskId) => {
    const taskToRestore = tasks.find(t => t.id === taskId);
    if (!taskToRestore) return;

    fetch(`http://localhost:8080/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: taskToRestore.title,
        description: taskToRestore.description,
        priority: taskToRestore.priority,
        category: taskToRestore.category,
        tags: taskToRestore.tags,
        status: 'NEW' // מחזירים לחיים!
      })
    })
      .then(() => {
        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? { ...t, status: 'NEW' } : t));
      })
      .catch(error => console.error("Error restoring task:", error));
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditFormData({
      title: task.title,
      description: task.description,
      priority: task.priority || '',
      status: task.status || 'NEW',
      category: task.category || '',
      tags: task.tags ? task.tags.join(', ') : ''
    });
  };


  const handleUpdateTask = (taskId) => {
    const dataToSend = {
      ...editFormData,
      tags: editFormData.tags ? editFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : []
    };

    fetch(`http://localhost:8080/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    })
      .then(response => response.json())
      .then(updatedTask => {
        // מעדכנים את המשימה ברשימה ויוצאים ממצב עריכה
        setTasks(prevTasks => prevTasks.map(t => t.id === taskId ? updatedTask : t));
        setEditingTaskId(null);

        // מחכים 4 שניות שה- AI ינתח את העריכה החדשה, ואז שואבים את הכל מחדש!
        setTimeout(() => {
          fetchTasks();
        }, 4000);
      })
      .catch(error => console.error("Error updating task:", error));
  };


  // מיון לפי דחיפות
  const priorityWeight = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
  const sortedTasks = [...tasks].sort((a, b) => {
    const weightA = priorityWeight[a.priority?.toUpperCase()] || 0;
    const weightB = priorityWeight[b.priority?.toUpperCase()] || 0;
    return weightB - weightA;
  });

  // סינון המשימות לפי החיפוש! (לפני הציור על המסך)
  const filteredTasks = sortedTasks.filter(task => {
    if (task.status === 'CANCELLED') return false;
    const query = searchQuery.toLowerCase();
    const titleMatch = task.title.toLowerCase().includes(query);
    const descMatch = task.description?.toLowerCase().includes(query);
    const tagMatch = task.tags?.some(tag => tag.toLowerCase().includes(query));
    const catMatch = task.category?.toLowerCase().includes(query);

    return titleMatch || descMatch || tagMatch || catMatch; // ימצא אם יש התאמה באחד מהם
  });

  return (
    <div className="app-container">

      {/* אזור הכותרת והכפתור */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <h1 className="header" style={{ marginBottom: 0 }}>🚀 Task Manager AI</h1>

        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: isFormVisible ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(45deg, #00dbde, #fc00ff)',
            color: 'white',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s',
            boxShadow: isFormVisible ? 'none' : '0 4px 15px rgba(252, 0, 255, 0.3)'
          }}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
        >
          {isFormVisible ? '✖ Cancel' : '✨ Add Task'}
        </button>
        <button
          onClick={() => setShowRecycleBin(!showRecycleBin)}
          style={{
            padding: '12px 24px',
            borderRadius: '8px',
            border: '1px solid rgba(201, 203, 207, 0.3)',
            background: showRecycleBin ? 'rgba(201, 203, 207, 0.2)' : 'transparent',
            color: '#c9cbcf',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(201, 203, 207, 0.2)'}
          onMouseOut={(e) => e.target.style.background = showRecycleBin ? 'rgba(201, 203, 207, 0.2)' : 'transparent'}
        >
          🗑️ Recycle Bin ({tasks.filter(t => t.status === 'CANCELLED').length})
        </button>
      </div>

      {/* אזור החיפוש והסינון (עובד מול השרת והלקוח) */}
      <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', gap: '15px' }}>

        {/* חיפוש טקסט חופשי במסך */}
        <input
          type="text"
          placeholder="🔍 Search texts, tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', padding: '15px 20px', borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)',
            color: 'white', fontSize: '1.1rem', boxSizing: 'border-box',
            backdropFilter: 'blur(10px)', transition: 'border-color 0.3s'
          }}
          onFocus={(e) => e.target.style.borderColor = '#00dbde'}
          onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
        />

        {/* סינון ישירות מול שרת ה- JAVA שלך! */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <select
            value={filterPriority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1rem', cursor: 'pointer' }}
          >
            <option value="" style={{ color: 'black' }}>⚡ All Priorities</option>
            <option value="HIGH" style={{ color: 'black' }}>HIGH</option>
            <option value="MEDIUM" style={{ color: 'black' }}>MEDIUM</option>
            <option value="LOW" style={{ color: 'black' }}>LOW</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', fontSize: '1rem', cursor: 'pointer' }}
          >
            <option value="" style={{ color: 'black' }}>📂 All Categories</option>
            <option value="Development" style={{ color: 'black' }}>Development</option>
            <option value="DevOps" style={{ color: 'black' }}>DevOps</option>
            <option value="IT" style={{ color: 'black' }}>IT</option>
            <option value="HR" style={{ color: 'black' }}>HR</option>
          </select>
        </div>
      </div>

      {/* הטופס יופיע רק אם isFormVisible שווה ל- true */}
      {isFormVisible && (
        <CreateTaskForm onTaskAdded={handleTaskAdded} />
      )}

      {/* רשימת המשימות בתצוגת שורות */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* אם אין תוצאות לחיפוש */}
        {filteredTasks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#aaaaaa', fontSize: '1.2rem', marginTop: '20px' }}>No tasks found...</p>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '15px' }}>

              {/* מציגים תיבות עריכה או טקסט רגיל תלוי במצב */}
              {editingTaskId === task.id ? (
                // --- מצב עריכה ---
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #00dbde', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '1.2rem' }}
                  />
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    style={{ padding: '10px', borderRadius: '8px', border: '1px solid #00dbde', background: 'rgba(255,255,255,0.1)', color: 'white', minHeight: '80px', fontFamily: 'inherit', fontSize: '0.95rem' }}
                  />
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    <button onClick={() => handleUpdateTask(task.id)} style={{ padding: '8px 16px', background: 'linear-gradient(45deg, #00dbde, #fc00ff)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Save</button>
                    <button onClick={() => setEditingTaskId(null)} style={{ padding: '8px 16px', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer' }}>✖ Cancel</button>
                  </div>
                </div>
              ) : (
                // --- מצב תצוגה רגיל ---
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}>{task.title}</h2>
                    <p style={{ margin: 0, color: '#cccccc', fontSize: '0.95rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>

                      {/* תנאי: אם ארוך וגם לא פתוח, נחתוך מילים. אחרת נראה הכל */}
                      {task.description?.length > 100 && !expandedTaskIds.includes(task.id)
                        ? task.description.slice(0, 100) + '...'
                        : task.description}

                      {/* מראה את הכפתור רק אם באמת יש מעל 100 תווים */}
                      {task.description?.length > 100 && (
                        <span
                          onClick={() => toggleReadMore(task.id)}
                          style={{ color: '#fc00ff', cursor: 'pointer', marginLeft: '10px', fontWeight: 'bold' }}
                        >
                          {expandedTaskIds.includes(task.id) ? 'Show Less' : 'Read More'}
                        </span>
                      )}

                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => startEditing(task)}
                      style={{ background: 'rgba(0, 219, 222, 0.1)', border: '1px solid rgba(0, 219, 222, 0.3)', borderRadius: '8px', color: '#00dbde', cursor: 'pointer', fontSize: '0.9rem', padding: '8px 12px', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.target.style.background = 'rgba(0, 219, 222, 0.3)'; }}
                      onMouseOut={(e) => { e.target.style.background = 'rgba(0, 219, 222, 0.1)'; }}
                      title="Edit Task"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      style={{ background: 'rgba(255, 99, 132, 0.1)', border: '1px solid rgba(255, 99, 132, 0.3)', borderRadius: '8px', color: '#ff6384', cursor: 'pointer', fontSize: '0.9rem', padding: '8px 12px', transition: 'all 0.2s' }}
                      onMouseOver={(e) => { e.target.style.background = 'rgba(255, 99, 132, 0.3)'; }}
                      onMouseOut={(e) => { e.target.style.background = 'rgba(255, 99, 132, 0.1)'; }}
                      title="Delete Task"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}


              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', marginTop: '5px' }}>
                {/* --- אזור הקטגוריה --- */}
                {editingTaskId === task.id ? (
                  <input
                    type="text"
                    placeholder="Category"
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    style={{ background: 'rgba(0, 219, 222, 0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid #00dbde', color: 'white', outline: 'none', width: '120px' }}
                  />
                ) : (
                  task.category && (
                    <span style={{ background: 'rgba(0, 219, 222, 0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid #00dbde', whiteSpace: 'nowrap' }}>
                      📂 {task.category}
                    </span>
                  )
                )}
                {/* --- אזור הסטטוס --- */}
                {editingTaskId === task.id ? (
                  <select
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    style={{ background: 'rgba(255, 255, 255, 0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid #fff', color: 'white', cursor: 'pointer', outline: 'none' }}
                  >
                    <option value="NEW" style={{ color: 'black' }}>📌 NEW</option>
                    <option value="IN_PROGRESS" style={{ color: 'black' }}>⏳ IN PROGRESS</option>
                    <option value="DONE" style={{ color: 'black' }}>✅ DONE</option>
                  </select>
                ) : (
                  task.status && (
                    <span style={{
                      background: task.status === 'DONE' ? 'rgba(75, 192, 192, 0.2)' : task.status === 'IN_PROGRESS' ? 'rgba(54, 162, 235, 0.2)' : task.status === 'CANCELLED' ? 'rgba(201, 203, 207, 0.2)' : 'rgba(153, 102, 255, 0.2)',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      border: `1px solid ${task.status === 'DONE' ? '#4bc0c0' : task.status === 'IN_PROGRESS' ? '#36a2eb' : task.status === 'CANCELLED' ? '#c9cbcf' : '#9966ff'}`,
                      whiteSpace: 'nowrap'
                    }}>
                      {task.status === 'DONE' ? '✅ ' : task.status === 'IN_PROGRESS' ? '⏳ ' : task.status === 'CANCELLED' ? '❌ ' : '📌 '}
                      {task.status.replace('_', ' ')}
                    </span>
                  )
                )}
                {/* --- אזור הדחיפות: אם עורכים מציגים בחירה, אם לא מציגים תגית --- */}
                {editingTaskId === task.id ? (
                  <select
                    value={editFormData.priority}
                    onChange={(e) => setEditFormData({ ...editFormData, priority: e.target.value })}
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      border: '1px solid #fff',
                      color: 'white',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value="HIGH" style={{ color: 'black' }}>⚡ HIGH</option>
                    <option value="MEDIUM" style={{ color: 'black' }}>⚡ MEDIUM</option>
                    <option value="LOW" style={{ color: 'black' }}>⚡ LOW</option>
                  </select>
                ) : (
                  task.priority && (
                    <span style={{
                      background: task.priority === 'HIGH' ? 'rgba(255, 99, 132, 0.2)' : task.priority === 'MEDIUM' ? 'rgba(255, 159, 64, 0.2)' : 'rgba(255, 206, 86, 0.2)',
                      padding: '5px 12px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      border: `1px solid ${task.priority === 'HIGH' ? '#ff6384' : task.priority === 'MEDIUM' ? '#ff9f40' : '#ffce56'}`,
                      whiteSpace: 'nowrap'
                    }}>
                      ⚡ {task.priority}
                    </span>
                  )
                )}
                {/* --- אזור התגיות --- */}
                {editingTaskId === task.id ? (
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={editFormData.tags}
                    onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                    style={{ background: 'rgba(252, 0, 255, 0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid #fc00ff', color: 'white', outline: 'none', flex: 1, minWidth: '150px' }}
                  />
                ) : (
                  task.tags && task.tags.map(tag => (
                    <span key={tag} style={{ background: 'rgba(252, 0, 255, 0.2)', padding: '5px 12px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid #fc00ff', whiteSpace: 'nowrap' }}>
                      🏷️ {tag}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {/* --- סל המיחזור --- */}
      {showRecycleBin && (
        <div style={{ marginTop: '40px' }}>
          <h2 style={{ color: '#c9cbcf', fontSize: '1.3rem', marginBottom: '15px', borderBottom: '1px solid rgba(201, 203, 207, 0.3)', paddingBottom: '10px' }}>
            🗑️ Recycle Bin
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {tasks.filter(t => t.status === 'CANCELLED').length === 0 ? (
              <p style={{ textAlign: 'center', color: '#777', fontSize: '1rem' }}>Recycle bin is empty!</p>
            ) : (
              tasks.filter(t => t.status === 'CANCELLED').map(task => (
                <div key={task.id} className="glass-panel" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.6 }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', textDecoration: 'line-through', color: '#999' }}>{task.title}</h3>
                    <p style={{ margin: 0, color: '#777', fontSize: '0.85rem' }}>{task.description?.slice(0, 80)}{task.description?.length > 80 ? '...' : ''}</p>
                  </div>
                  <button
                    onClick={() => handleRestoreTask(task.id)}
                    style={{ padding: '8px 16px', background: 'rgba(75, 192, 192, 0.15)', border: '1px solid #4bc0c0', borderRadius: '8px', color: '#4bc0c0', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(75, 192, 192, 0.3)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(75, 192, 192, 0.15)'}
                  >
                    ♻️ Restore
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
