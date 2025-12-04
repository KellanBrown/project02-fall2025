import React, { useState, useEffect } from 'react';

export default function Todos({ API_URL, refreshTrigger }) {  // Add refreshTrigger prop
    const [todoList, setTodoList] = useState([]);

    async function fetchTodos() {
        const response = await fetch(`${API_URL}/todos`);
        const data = await response.json();
        setTodoList(data);
    }

    useEffect(() => {
        fetchTodos();
    }, [refreshTrigger]);  // Add refreshTrigger to dependencies

    // Add this function
    async function deleteTodo(todoId) {
        await fetch(`${API_URL}/todos/${todoId}`, {
            method: 'DELETE',
        });
        // Refresh the list to show the todo is gone
        fetchTodos();
    }

    return (
        <div className="todos-container">
            <ul>
                {todoList.map((todo) => (
                    <li key={todo.id}>
                        <div>
                            {todo.completed ? (
                                <span>Completed</span>
                            ) : (
                                <span>In Progress</span>
                            )}{' '}
                            {todo.title}
                            <br />
                            {todo.description}
                        </div>
                        {/* Add delete button */}
                        <button onClick={() => deleteTodo(todo.id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
