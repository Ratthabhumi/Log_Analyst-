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
    
    # Initialize daily trends for the last 7 days (including today)
    daily_trends = { (datetime.utcnow() - timedelta(days=i)).strftime('%Y-%m-%d'): 0 for i in range(6, -1, -1) }
    type_distribution = Counter()

    for record in records:
        total_time += record.search_time_ms or 0
        if record.event_metadata:
            meta = EventMetadata(**record.event_metadata)
            if meta.isCritical:
                critical += 1
            if meta.provider:
                type_distribution[meta.provider] += 1
            
        if record.created_at and record.created_at >= one_week_ago:
            if record.event_id and record.event_id != "Unknown":
                weekly_errors[(record.event_id, record.provider)] += 1
                
        if record.created_at:
            day_str = record.created_at.strftime('%Y-%m-%d')
            if day_str in daily_trends:
                daily_trends[day_str] += 1

    top_weekly_error = None
    if weekly_errors:
        (top_event_id, top_provider), count = weekly_errors.most_common(1)[0]
        top_weekly_error = {
            "eventId": top_event_id,
            "provider": top_provider,
            "count": count
        }

    avg_sec = round(total_time / total / 1000, 2) if total else 0.0
    
    daily_trends_list = [{"date": k, "count": v} for k, v in daily_trends.items()]
    type_dist_list = [{"name": k, "value": v} for k, v in type_distribution.most_common(5)]
    
    # Group others if there are more than 5
    if len(type_distribution) > 5:
        other_count = sum(v for k, v in type_distribution.most_common()[5:])
        type_dist_list.append({"name": "Other", "value": other_count})

    return StatsResponse(
        totalLogs=total,
        criticalErrors=critical,
        avgSearchTimeSec=avg_sec,
        topWeeklyError=top_weekly_error,
        dailyTrends=daily_trends_list,
        typeDistribution=type_dist_list
    )
