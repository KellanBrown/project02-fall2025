import React, { useState, useEffect } from 'react';
import './globals.css';
import { Layout, Typography, Divider, message } from 'antd';
import Todos from './Todos';
import CreateTodo from './CreateTodo';

const { Header, Content } = Layout;
const { Title } = Typography;

// Use environment variable for API URL, default to localhost for development
// In production, VITE_API_URL will be set to empty string (frontend and backend same origin)
const API_URL =
  import.meta.env.VITE_API_URL !== undefined && import.meta.env.VITE_API_URL !== ''
    ? import.meta.env.VITE_API_URL // address for production architecture
    : 'http://localhost:8000';      // address for local development

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [categories, setCategories] = useState([]);

  // Function to trigger Todos refresh
  function refreshTodos() {
    setRefreshTrigger((prev) => prev + 1);
  }

  // Fetch categories from backend
  useEffect(() => {
    async function fetchCategories() {
      try {
        // Use API_URL constant for fetch
        const res = await fetch(`${API_URL}/categories`);
        if (!res.ok) throw new Error('Failed to fetch categories from backend');
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
        message.error('Failed to fetch categories from backend');
      }
    }

    fetchCategories();
  }, []);

  return (
    <Layout>
      <Header style={{ backgroundColor: 'hotpink', textAlign: 'center' }}>
        <Title level={2} style={{ color: 'black', margin: 0 }}>
          TODO List
        </Title>
      </Header>
      <Content style={{ padding: '20px', maxWidth: '700px', margin: '0 auto' }}>
        {/* Pass categories down to CreateTodo */}
        <CreateTodo
          API_URL={API_URL}
          onTodoCreated={refreshTodos}
          categories={categories}
        />
        <Divider />
        <Todos API_URL={API_URL} refreshTrigger={refreshTrigger} />
      </Content>
    </Layout>
  );
}
