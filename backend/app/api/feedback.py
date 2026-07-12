from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.models.history import AnalysisHistory
from app.services.vector_db import add_solution

router = APIRouter()

class FeedbackRequest(BaseModel):
    history_id: int
    score: int  # 1 for thumb up, -1 for thumb down
    corrected_solution: Optional[dict] = None

@router.post("/feedback")
def submit_feedback(req: FeedbackRequest, db: Session = Depends(get_db)):
    history_item = db.query(AnalysisHistory).filter(AnalysisHistory.id == req.history_id).first()
    if not history_item:
        raise HTTPException(status_code=404, detail="History not found")
        
    history_item.feedback_score = req.score
    
    # If the user provides a corrected solution, overwrite it
    if req.corrected_solution:
        history_item.solution_summary = req.corrected_solution
        
    db.commit()
    
    # Add to RAG vector DB if positive
    if req.score > 0 and history_item.solution_summary:
        try:
            add_solution(
                event_id=history_item.event_id,
                description=history_item.description,
                solution_summary=history_item.solution_summary,
                feedback_score=req.score
            )
        except Exception as e:
            print(f"Failed to add to vector DB: {e}")
            
    return {"status": "success", "message": "Feedback recorded."}
