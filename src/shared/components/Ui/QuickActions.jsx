import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './Button';
import Icon from '../AppIcon';
import TaskCreateModal from './TaskCreateModal';

const QuickActions = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const savedTasks = JSON.parse(sessionStorage.getItem('tasks') || '[]');
    setTasks(savedTasks);
  }, []);

  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    sessionStorage.setItem('tasks', JSON.stringify(newTasks));
  };

  const handleTaskSave = (taskData) => {
    // Save task logic here
    console.log('Quick task saved:', taskData);
    
    // Save to sessionStorage for demonstration
    const newTask = {
      id: Date.now(),
      ...taskData,
      createdAt: new Date()?.toISOString()
    };
    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    
    // Show success feedback
    alert('Task created successfully!');
  };

  const quickActions = [
    {
      icon: 'Plus',
      label: 'Quick Task',
      onClick: () => setShowTaskModal(true),
      color: 'bg-primary hover:bg-primary/90'
    },
    {
      icon: 'Calendar',
      label: 'Calendar',
      onClick: () => navigate('/calendar-dashboard'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: 'Search',
      label: 'Search',
      onClick: () => navigate('/event-search-and-filtering'),
      color: 'bg-emerald-500 hover:bg-emerald-600'
    },
    {
      icon: 'Settings',
      label: 'Settings',
      onClick: () => console.log('Settings clicked'),
      color: 'bg-slate-500 hover:bg-slate-600'
    }
  ];

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <div className="flex flex-col items-end space-y-3">
          {/* Expanded Actions */}
          {isExpanded && (
            <div className="flex flex-col items-end space-y-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
              {quickActions?.map((action, index) => (
                <div
                  key={action?.label}
                  className="flex items-center space-x-3 animate-in slide-in-from-right duration-200"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="bg-surface border border-hairline px-3 py-1 rounded-modern text-sm text-text-primary shadow-soft">
                    {action?.label}
                  </span>
                  <Button
                    size="icon"
                    className={`h-12 w-12 rounded-full shadow-soft ${action?.color} text-white border-0`}
                    onClick={action?.onClick}
                  >
                    <Icon name={action?.icon} size={20} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Main FAB */}
          <Button
            size="icon"
            className={`h-14 w-14 rounded-full shadow-lg transition-transform duration-200 ${
              isExpanded 
                ? 'bg-slate-500 hover:bg-slate-600 rotate-45' :'bg-primary hover:bg-primary/90'
            } text-white border-0`}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Icon name="Plus" size={24} />
          </Button>
        </div>
      </div>
      {/* Task Creation Modal */}
      <TaskCreateModal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleTaskSave}
        initialData={{}}
      />
    </>
  );
};

export default QuickActions;