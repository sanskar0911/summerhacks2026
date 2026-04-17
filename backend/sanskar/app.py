from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import random

app = Flask(__name__)
CORS(app)

# -------------------------
# LOAD DATA
# -------------------------
def load_jobs():
    with open("data/opportunities.json") as f:
        return json.load(f)


# -------------------------
# SIMULATE LIVE DATA
# -------------------------
def simulate_live(jobs):
    for job in jobs:
        job["posted_time"] = f"{random.randint(1,24)} hours ago"

        if job["type"] == "freelance":
            job["proposals"] = random.randint(1, 30)
        else:
            job["applicants"] = random.randint(10, 60)

    return jobs


# -------------------------
# USER (DYNAMIC)
# -------------------------
def get_user_dynamic():
    # Allow overrides from query params
    role = request.args.get('role', 'React Developer')
    skills = request.args.getlist('skills') or ['React', 'JavaScript']
    location = request.args.get('location', 'Remote')
    rate = int(request.args.get('rate', 15000))

    return {
        "role": role,
        "skills": skills,
        "preferred_category": "Tech", # Simple mapping for now
        "rate": rate,
        "location": location
    }


# -------------------------
# MATCHING ENGINE (NORMALIZED)
# -------------------------
def match_score(user, job):
    score = 0

    job_skills_text = " ".join(job["skills"]).lower()

    # Skill match
    for skill in user["skills"]:
        if skill.lower() in job_skills_text:
            score += 50
            break

    # Category match based on role
    if user["role"].lower() in job["title"].lower():
        score += 20

    # Budget
    if job["type"] == "freelance" and job.get("budget", 0) >= user["rate"]:
        score += 20

    # Location
    if job["location"] == user["location"] or job["location"] == "Remote":
        score += 10

    # Normalize max to 100
    return min(score, 100)


# -------------------------
# LABELS + ALERTS (SMART)
# -------------------------
def add_labels(job):
    # Label
    if job["match_score"] >= 85:
        job["label"] = "🔥 Best Match"
    elif job["match_score"] >= 70:
        job["label"] = "👍 Good Match"
    else:
        job["label"] = "⚡ Explore"

    alerts = []

    # Priority alerts
    if job["type"] == "freelance" and job.get("proposals", 100) < 8:
        alerts.append("🚨 Low competition")

    elif job["match_score"] >= 90:
        alerts.append("💰 High success probability")

    elif job["type"] == "job" and job.get("applicants", 0) < 15:
        alerts.append("🔥 Less applicants")

    else:
        alerts.append("ℹ️ Moderate competition")

    job["alert"] = " | ".join(alerts)

    return job


# -------------------------
# DIVERSITY FILTER (VERY IMPORTANT)
# -------------------------
def diversify_jobs(jobs):
    seen_titles = set()
    diversified = []

    for job in jobs:
        title = job["title"]

        if title not in seen_titles:
            diversified.append(job)
            seen_titles.add(title)

    return diversified


# -------------------------
# RANKING ENGINE (SMART SORT)
# -------------------------
def get_best_jobs(user):
    jobs = load_jobs()
    jobs = simulate_live(jobs)

    for job in jobs:
        job["match_score"] = match_score(user, job)
        add_labels(job)

        # Ranking bonus
        job["rank_score"] = job["match_score"]

        # Boost low competition
        if job["type"] == "freelance" and job.get("proposals", 100) < 8:
            job["rank_score"] += 5

    # Sort by rank_score
    jobs.sort(key=lambda x: x["rank_score"], reverse=True)

    # Remove duplicates at top
    jobs = diversify_jobs(jobs)

    # Mark top pick
    if jobs:
        jobs[0]["top_pick"] = True

    return jobs


# -------------------------
# AI DECISION ENGINE (UPGRADED)
# -------------------------
def ai_decision_engine(jobs, user):
    if not jobs:
        return {
            "top_action": "No opportunities found",
            "reason": "Try updating your skills",
            "confidence": "Low",
            "actions": []
        }

    best_job = jobs[0]

    action = f"Apply to '{best_job['title']}'"

    reasons = [
        f"Match score {best_job['match_score']}%",
        f"Location: {best_job['location']}"
    ]

    if best_job["type"] == "freelance":
        reasons.append(f"Budget: {best_job.get('budget', 0)}")

    if best_job.get("proposals", 100) < 8:
        reasons.append("Low competition")

    reason_text = ", ".join(reasons)

    # Confidence
    if best_job["match_score"] >= 90:
        confidence = "Very High"
    elif best_job["match_score"] >= 75:
        confidence = "High"
    else:
        confidence = "Medium"

    actions = [
        action,
        "Save this opportunity",
        "View details"
    ]

    if best_job["type"] == "freelance":
        actions.append("Generate proposal")

    return {
        "top_action": action,
        "actions": actions,
        "reason": reason_text,
        "confidence": confidence,
        "job_id": best_job["id"]
    }


# -------------------------
# API
# -------------------------
@app.route("/opportunities")
def opportunities():
    user = get_user_dynamic()
    jobs = get_best_jobs(user)
    decision = ai_decision_engine(jobs, user)

    return jsonify({
        "decision": decision,
        "opportunities": jobs
    })


# -------------------------
# RUN
# -------------------------
if __name__ == "__main__":
    app.run(port=8000, debug=True)
    app.run(debug=True)