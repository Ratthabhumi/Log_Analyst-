from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.auth import get_current_user

from app.core.database import get_db
from app.models.history import AnalysisHistory
from app.schemas.analyze import StatsResponse, EventMetadata

router = APIRouter()


@router.get("/", response_model=StatsResponse)
def get_stats(
    db: Session = Depends(get_db),
    _user: str = Depends(get_current_user),
):
    records = db.query(AnalysisHistory).all()
    total = len(records)
    critical = 0
    total_time = 0.0

    for record in records:
        total_time += record.search_time_ms or 0
        if record.event_metadata:
            meta = EventMetadata(**record.event_metadata)
            if meta.isCritical:
                critical += 1

    avg_sec = round(total_time / total / 1000, 2) if total else 0.0
    return StatsResponse(
        totalLogs=total,
        criticalErrors=critical,
        avgSearchTimeSec=avg_sec,
    )
