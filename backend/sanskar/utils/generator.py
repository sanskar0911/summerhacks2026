import json
import random

platforms = ["Upwork", "Freelancer", "LinkedIn", "Indeed", "LocalJobs"]

categories = {
    "Tech": ["React Developer", "Python Developer", "Backend Engineer"],
    "Design": ["Graphic Designer", "UI/UX Designer"],
    "Writing": ["Content Writer", "Copywriter"],
    "Marketing": ["Digital Marketer", "SEO Specialist"],
    "Sales": ["Sales Executive", "Field Sales Agent"],
    "Finance": ["Accountant", "Financial Analyst"],
    "HR": ["HR Executive", "Recruiter"],
    "Customer Support": ["Customer Support Executive"],
    "Delivery": ["Delivery Driver", "Courier Partner"],
    "Hospitality": ["Waiter", "Hotel Receptionist"],
    "Healthcare": ["Nurse", "Lab Technician"],
    "Education": ["Teacher", "Tutor"],
    "Construction": ["Electrician", "Plumber", "Carpenter"],
    "Household": ["Maid", "Cook", "Babysitter"],
    "Security": ["Security Guard"],
    "Transport": ["Driver", "Truck Driver"],
    "Retail": ["Shop Assistant", "Store Manager"],
    "Events": ["Event Coordinator", "Photographer"],
    "Legal": ["Legal Assistant"],
    "Fitness": ["Gym Trainer", "Yoga Instructor"]
}

jobs = []
job_id = 1

for category, roles in categories.items():
    for _ in range(20):  # 20 jobs per category
        role = random.choice(roles)
        job_type = random.choice(["job", "freelance"])

        job = {
            "id": job_id,
            "title": role,
            "category": category,
            "skills": [role],
            "type": job_type,
            "platform": random.choice(platforms),
            "location": random.choice(["Remote", "Mumbai", "Delhi", "Bangalore"]),
            "posted_time": f"{random.randint(1,24)} hours ago"
        }

        if job_type == "freelance":
            job.update({
                "payment_type": random.choice(["fixed", "hourly"]),
                "budget": random.randint(3000, 50000),
                "proposals": random.randint(1, 30)
            })
        else:
            job.update({
                "payment_type": "salary",
                "salary": f"₹{random.randint(2,15)} LPA",
                "applicants": random.randint(10, 60)
            })

        jobs.append(job)
        job_id += 1

with open("../data/opportunities.json", "w") as f:
    json.dump(jobs, f, indent=2)

print("🔥 Dataset generated successfully!")