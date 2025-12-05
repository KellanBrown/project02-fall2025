import React, { useState } from 'react'; // Add useState
import './globals.css'; // <-- Add this line
import Todos from './Todos'; // Add this
import CreateTodo from './CreateTodo'; // Add this

const API_URL = 'http://localhost:8000'; // Add this

export default function App() {
    const [refreshTrigger, setRefreshTrigger] = useState(0); // Add this

    function refreshTodos() {
        // Add this function
        setRefreshTrigger((prev) => prev + 1);
    }

    return (
        <>
            <header>
                <h1>TODO List</h1>
            </header>
            <main>
                <Todos API_URL={API_URL} refreshTrigger={refreshTrigger} />{' '}
                {/* Add prop */}
                <CreateTodo
                    API_URL={API_URL}
                    onTodoCreated={refreshTodos}
                />{' '}
                {/* Add prop */}
            </main>
        </>
    );
}
