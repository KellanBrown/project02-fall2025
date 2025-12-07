import React from 'react';
import { Form, Input, Button, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';

const { Option } = Select;

export default function CreateTodo({ API_URL, onTodoCreated, categories }) {
  const [form] = Form.useForm();

  // Handle form submission
  async function handleSubmit(values) {
    // Prepare payload for backend
    const payload = {
      title: values.title,
      description: values.description || '',
      completed: false,
      category_id: values.category_id || null,
      due_date: values.due_date ? values.due_date.format('YYYY-MM-DD') : null,
    };

    try {
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        message.success('Todo created successfully');
        form.resetFields();
        if (onTodoCreated) onTodoCreated(); // Trigger refresh in parent
      } else {
        const errData = await response.json();
        console.error('Backend error:', errData);
        message.error('Failed to create todo');
      }
    } catch (err) {
      console.error(err);
      message.error('Error creating todo');
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{
        maxWidth: 600,
        margin: '30px auto',
        padding: 20,
        background: '#fff',
        borderRadius: 5,
      }}
    >
      <Form.Item
        label="Title"
        name="title"
        rules={[{ required: true, message: 'Please enter a title' }]}
      >
        <Input placeholder="Enter todo title" />
      </Form.Item>

      <Form.Item label="Description" name="description">
        <Input.TextArea placeholder="Enter description" rows={3} />
      </Form.Item>

      {categories.length > 0 && (
        <Form.Item label="Category" name="category_id">
          <Select placeholder="Select a category" allowClear>
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
      )}

      <Form.Item label="Due Date" name="due_date">
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Create Todo
        </Button>
      </Form.Item>
    </Form>
  );
}
