from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import configuration, audio

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(configuration.router)
app.include_router(audio.router)

@app.get("/")
async def root():
    return {"message": "Speech Learning API"}