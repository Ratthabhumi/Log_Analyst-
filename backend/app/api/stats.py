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
    from datetime import datetime, timedelta
    from collections import Counter

    records = db.query(AnalysisHistory).all()
    total = len(records)
    critical = 0
    total_time = 0.0

    one_week_ago = datetime.utcnow() - timedelta(days=7)
    weekly_errors = Counter()

    for record in records:
        total_time += record.search_time_ms or 0
        if record.event_metadata:
            meta = EventMetadata(**record.event_metadata)
            if meta.isCritical:
                critical += 1
            
        if record.created_at and record.created_at >= one_week_ago:
            if record.event_id and record.event_id != "Unknown":
                weekly_errors[(record.event_id, record.provider)] += 1

    top_weekly_error = None
    if weekly_errors:
        (top_event_id, top_provider), count = weekly_errors.most_common(1)[0]
        top_weekly_error = {
            "eventId": top_event_id,
            "provider": top_provider,
            "count": count
        }

    avg_sec = round(total_time / total / 1000, 2) if total else 0.0
    return StatsResponse(
        totalLogs=total,
        criticalErrors=critical,
        avgSearchTimeSec=avg_sec,
        topWeeklyError=top_weekly_error,
    )
