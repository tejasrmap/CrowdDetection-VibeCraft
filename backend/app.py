from flask import Flask, jsonify, request, render_template
from backend.db import get_db

app = Flask(
    __name__,
    static_folder="static",
    template_folder="templates"
)

db = get_db()
crowd = db["crowd_stats"]

# -------------------------
# STUDENT INTERFACE
# -------------------------
@app.route("/")
@app.route("/student")
def student():
    return render_template("student.html")


@app.route("/api/student/live")
def student_live():
    location = request.args.get("location", "Main Mess")

    doc = crowd.find_one(
        {"location_name": location},
        sort=[("timestamp", -1)],
        projection={"_id": 0}
    )

    if not doc:
        return jsonify({})  # frontend fallback

    return jsonify(doc)

# -------------------------
# ADMIN INTERFACE
# -------------------------
@app.route("/admin")
def admin():
    return render_template("admin.html")


@app.route("/api/admin/history")
def admin_history():
    data = list(
        crowd.find({}, {"_id": 0})
        .sort("timestamp", -1)
        .limit(50)
    )
    return jsonify(data)

# -------------------------
if __name__ == "__main__":
    app.run(debug=True)
