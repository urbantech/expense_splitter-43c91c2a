"""
expense_splitter — Backend API
Built on AINative Platform. Uses ZeroDB for storage, AINative JWT for auth.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.routers.authentication import router as authentication_router
from app.routers.group_expense_creation import router as group_expense_creation_router
from app.routers.expense_deletion import router as expense_deletion_router
from app.routers.expense_listing import router as expense_listing_router

app = FastAPI(
    title="expense_splitter API",
    version="0.1.0",
    description="Backend API for expense_splitter, powered by AINative platform"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*.ainative.studio"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(authentication_router, prefix='/api/v1')
app.include_router(group_expense_creation_router, prefix='/api/v1')
app.include_router(expense_deletion_router, prefix='/api/v1')
app.include_router(expense_listing_router, prefix='/api/v1')

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "expense_splitter"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
