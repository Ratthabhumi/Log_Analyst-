import os
import chromadb
import json

# Setup ChromaDB client
db_path = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'chroma_db')
os.makedirs(db_path, exist_ok=True)

# Initialize ChromaDB client in persistent mode
client = chromadb.PersistentClient(path=db_path)

# Create or get collection
COLLECTION_NAME = "log_history"
collection = client.get_or_create_collection(name=COLLECTION_NAME)

def add_solution(event_id: str, description: str, solution_summary: dict, feedback_score: int):
    """Adds a log and its correct solution to the vector database."""
    # We now save it automatically regardless of the feedback score initially.
    # Negative feedback (-1) can still be ignored if desired, but auto-save passes 0.
    if feedback_score < 0:
        return
    doc_id = f"evt_{event_id}_{hash(description)}"
    
    # Store the description as the embedded text
    document_text = f"Event ID: {event_id}. Description: {description}"
    
    # Store the solution in metadata
    metadata = {
        "event_id": str(event_id),
        "solution_json": json.dumps(solution_summary)
    }
    
    collection.upsert(
        documents=[document_text],
        metadatas=[metadata],
        ids=[doc_id]
    )

def search_similar_logs(description: str, event_id: str = None, top_k: int = 2) -> list[dict]:
    """Search for past similar logs that were successfully solved."""
    # We can filter by event_id if provided
    where_clause = {"event_id": str(event_id)} if event_id else None
    
    try:
        results = collection.query(
            query_texts=[description],
            n_results=top_k,
            where=where_clause
        )
        
        matches = []
        if results['metadatas'] and len(results['metadatas']) > 0:
            for i in range(len(results['metadatas'][0])):
                meta = results['metadatas'][0][i]
                sol = json.loads(meta['solution_json'])
                matches.append(sol)
        return matches
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        return []
