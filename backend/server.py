"""
Simple FastAPI Starter - TODO API
==================================

Minimal FastAPI example for a TODO app with SQLite.
"""

from datetime import datetime
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.future import select
from sqlalchemy.orm import sessionmaker

from models.base import Base
from models.todo import Todo
from models.category import Category

# --------------------------
# DATABASE SETUP (SQLite for local dev)
# --------------------------
DATABASE_URL = "sqlite+aiosqlite:///./data.db"

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# --------------------------
# FASTAPI APP SETUP
# --------------------------
app = FastAPI(title="TODO API", description="A simple CRUD API for managing TODO items")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Database tables created successfully")

# --------------------------
# SCHEMAS
# --------------------------
class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False
    due_date: Optional[datetime] = None

class TodoCreate(TodoBase):
    category_id: Optional[int] = None

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    category_id: Optional[int] = None
    due_date: Optional[datetime] = None

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    class Config:
        from_attributes = True  # updated for Pydantic v2

class TodoResponse(TodoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    class Config:
        from_attributes = True  # updated for Pydantic v2

# --------------------------
# TODO ROUTES
# --------------------------
@app.get("/todos", response_model=List[TodoResponse])
async def get_all_todos(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Todo))
    return result.scalars().all()

@app.get("/todos/{todo_id}", response_model=TodoResponse)
async def get_todo(todo_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Todo).where(Todo.id == todo_id))
    todo = result.scalar_one_or_none()
    if not todo:
        raise HTTPException(status_code=404, detail=f"Todo {todo_id} not found")
    return todo

@app.post("/todos", response_model=TodoResponse, status_code=201)
async def create_todo(todo: TodoCreate, db: AsyncSession = Depends(get_db)):
    db_todo = Todo(
        title=todo.title,
        description=todo.description,
        completed=todo.completed,
        category_id=todo.category_id
    )
    db.add(db_todo)
    await db.commit()
    await db.refresh(db_todo)
    return db_todo

@app.patch("/todos/{todo_id}", response_model=TodoResponse)
async def patch_todo(todo_id: int, todo_update: TodoUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Todo).where(Todo.id == todo_id))
    db_todo = result.scalar_one_or_none()
    if not db_todo:
        raise HTTPException(status_code=404, detail=f"Todo {todo_id} not found")
    update_data = todo_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_todo, key, value)
    db_todo.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(db_todo)
    return db_todo

@app.delete("/todos/{todo_id}", status_code=204)
async def delete_todo(todo_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Todo).where(Todo.id == todo_id))
    db_todo = result.scalar_one_or_none()
    if not db_todo:
        raise HTTPException(status_code=404, detail=f"Todo {todo_id} not found")
    await db.delete(db_todo)
    await db.commit()
    return None

# --------------------------
# CATEGORY ROUTES
# --------------------------
@app.get("/categories", response_model=List[CategoryResponse])
async def get_all_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category))
    return result.scalars().all()

@app.get("/categories/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.id == category_id))
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
    return category

@app.post("/categories", response_model=CategoryResponse, status_code=201)
async def create_category(category: CategoryCreate, db: AsyncSession = Depends(get_db)):
    db_category = Category(name=category.name)
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category

@app.delete("/categories/{category_id}", status_code=204)
async def delete_category(category_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Category).where(Category.id == category_id))
    db_category = result.scalar_one_or_none()
    if not db_category:
        raise HTTPException(status_code=404, detail=f"Category {category_id} not found")
    await db.delete(db_category)
    await db.commit()
    return None

# --------------------------
# RUN SERVER LOCALLY
# --------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
