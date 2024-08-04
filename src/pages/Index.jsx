import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2 } from "lucide-react";

// Simulated API calls
const fetchTasks = async () => {
  // In a real app, this would be an API call
  return JSON.parse(localStorage.getItem('tasks') || '[]');
};

const addTask = async (task) => {
  const tasks = await fetchTasks();
  const newTask = { id: Date.now(), ...task };
  const updatedTasks = [...tasks, newTask];
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  return newTask;
};

const updateTask = async (updatedTask) => {
  const tasks = await fetchTasks();
  const updatedTasks = tasks.map(task => task.id === updatedTask.id ? updatedTask : task);
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  return updatedTask;
};

const deleteTask = async (id) => {
  const tasks = await fetchTasks();
  const updatedTasks = tasks.filter(task => task.id !== id);
  localStorage.setItem('tasks', JSON.stringify(updatedTasks));
};

const Index = () => {
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  const addMutation = useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setNewTask('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim()) {
      addMutation.mutate({ title: newTask.trim(), completed: false });
    }
  };

  const handleUpdateTask = (task) => {
    updateMutation.mutate(task);
  };

  const handleDeleteTask = (id) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Task Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
            <Input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter a new task"
              className="flex-grow"
            />
            <Button type="submit">Add Task</Button>
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    {editingTask?.id === task.id ? (
                      <Input
                        value={editingTask.title}
                        onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                      />
                    ) : (
                      task.title
                    )}
                  </TableCell>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleUpdateTask({ ...task, completed: !task.completed })}
                    />
                  </TableCell>
                  <TableCell>
                    {editingTask?.id === task.id ? (
                      <Button onClick={() => handleUpdateTask(editingTask)}>Save</Button>
                    ) : (
                      <Button variant="ghost" onClick={() => setEditingTask(task)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" onClick={() => handleDeleteTask(task.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
