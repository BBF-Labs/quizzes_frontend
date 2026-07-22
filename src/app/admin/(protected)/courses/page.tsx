"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib";
import { getAdminCourses } from "@/controllers";
import { ICourse } from "@/interfaces";

export default function AdminCoursesPage() {
  const accessToken = useSelector(
    (state: RootState) => state.auth.credentials.accessToken
  );

  const [courses, setCourses] = useState<ICourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;
    setLoading(true);
    setError("");

    getAdminCourses(accessToken, page, limit)
      .then(({ courses, meta }) => {
        if (cancelled) return;
        setCourses(courses);
        setTotalPages(meta?.totalPages ?? 1);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, page]);

  return (
    <div className="admin-shell">
      <div className="adm-container">
        <div className="adm-header">
          <div>
            <div className="adm-title">Courses</div>
            <div className="adm-subtitle">
              Edit a course&apos;s title, description, code, credits, or semester.
            </div>
          </div>
        </div>

        {error && <div className="adm-error-banner">{error}</div>}

        {loading ? (
          <div className="adm-loading">Loading courses…</div>
        ) : courses.length === 0 ? (
          <div className="adm-empty">No courses found.</div>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Semester</th>
                <th>Credits</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id}>
                  <td>{course.code}</td>
                  <td>
                    {course.title || <span className="adm-hint">Untitled</span>}
                  </td>
                  <td>{course.semester}</td>
                  <td>{course.creditHours ?? <span className="adm-hint">—</span>}</td>
                  <td>
                    <Link href={`/admin/courses/${course._id}`} className="adm-btn">
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && totalPages > 1 && (
          <div className="adm-actions">
            <button
              type="button"
              className="adm-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="adm-hint" style={{ alignSelf: "center" }}>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="adm-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
