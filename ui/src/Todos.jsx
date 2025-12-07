import React, { useState, useEffect } from 'react';
import { List, Button, Badge, message, Modal, Form, Input, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

export default function Todos({ API_URL, refreshTrigger }) {
  const [todoList, setTodoList] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [editingTodo, setEditingTodo] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [form] = Form.useForm();

  // Fetch todos
  async function fetchTodos() {
    try {
      const response = await fetch(`${API_URL}/todos`);
      const data = await response.json();
      setTodoList(data);
      setFilteredTodos(data);
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch todos');
    }
  }

  // Fetch categories
  async function fetchCategories() {
    try {
      const res = await fetch(`${API_URL}/categories`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error(err);
      message.error('Failed to fetch categories');
    }
  }

  useEffect(() => {
    fetchTodos();
    fetchCategories();
  }, [refreshTrigger]);

  // Delete todo
  async function deleteTodo(todoId) {
    try {
      const response = await fetch(`${API_URL}/todos/${todoId}`, { method: 'DELETE' });
      if (response.ok) {
        message.success('Todo deleted successfully');
        fetchTodos();
      } else {
        message.error('Failed to delete todo');
      }
    } catch (err) {
      console.error(err);
      message.error('Error deleting todo');
    }
  }

  // Open edit modal
  function openEditModal(todo) {
    setEditingTodo(todo);
    form.setFieldsValue({
      title: todo.title,
      description: todo.description,
      category_id: todo.category?.id || null,
      due_date: todo.due_date ? dayjs(todo.due_date) : null,
    });
  }

  // Handle modal submit
  async function handleEdit(values) {
    try {
      const response = await fetch(`${API_URL}/todos/${editingTodo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          completed: editingTodo.completed,
          category_id: values.category_id || null,
          due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
        }),
      });

      if (response.ok) {
        message.success('Todo updated successfully');
        setEditingTodo(null);
        fetchTodos();
      } else {
        message.error('Failed to update todo');
      }
    } catch (err) {
      console.error(err);
      message.error('Error updating todo');
    }
  }

  // Filter todos
  useEffect(() => {
    let filtered = todoList;

    if (searchTerm) {
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          todo.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((todo) =>
        statusFilter === 'completed' ? todo.completed : !todo.completed
      );
    }

    setFilteredTodos(filtered);
  }, [searchTerm, statusFilter, todoList]);

  // Helper to show due status
  function getDueBadge(dueDate) {
    if (!dueDate) return null;
    const now = dayjs();
    const due = dayjs(dueDate);
    if (due.isBefore(now, 'day')) return <Badge status="error" text="Overdue" />;
    if (due.diff(now, 'day') <= 2) return <Badge status="warning" text="Due Soon" />;
    return null;
  }

  return (
    <>
      {/* Search & Filter */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <Input
          placeholder="Search todos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          style={{ width: 150 }}
        >
          <Option value="all">All</Option>
          <Option value="completed">Completed</Option>
          <Option value="inprogress">In Progress</Option>
        </Select>
      </div>

      <List
        bordered
        dataSource={filteredTodos}
        renderItem={(todo) => (
          <List.Item
            actions={[
              <Button type="primary" onClick={() => openEditModal(todo)}>
                Edit
              </Button>,
              <Button danger onClick={() => deleteTodo(todo.id)}>
                Delete
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <>
                  <Badge
                    status={todo.completed ? 'success' : 'processing'}
                    text={todo.completed ? 'Completed' : 'In Progress'}
                  />{' '}
                  {todo.title}{' '}
                  {getDueBadge(todo.due_date)}
                </>
              }
              description={
                <>
                  {todo.description}
                  {todo.category && (
                    <div>
                      <strong>Category:</strong> {todo.category.name}
                    </div>
                  )}
                  {todo.due_date && (
                    <div>
                      <strong>Due Date:</strong>{' '}
                      {dayjs(todo.due_date).format('YYYY-MM-DD')}
                    </div>
                  )}
                </>
              }
            />
          </List.Item>
        )}
      />

      {/* Edit Modal */}
      <Modal
        title="Edit Todo"
        open={!!editingTodo}
        onCancel={() => setEditingTodo(null)}
        okText="Save"
        onOk={() => {
          form
            .validateFields()
            .then((values) => handleEdit(values))
            .catch((info) => console.log('Validation Failed:', info));
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please input the title!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input />
          </Form.Item>
          <Form.Item label="Category" name="category_id">
            <Select placeholder="Select a category" allowClear>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Due Date" name="due_date">
            <DatePicker />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
