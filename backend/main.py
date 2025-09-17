from fastapi import Depends, FastAPI
from src.core.settings import settings

app = FastAPI(title="CS 4604 Final Project API", description="Welcome to CS4604", docs_url="/api/docs")


@app.get("/")
def hello_world():
    return {"Hello": "World"}