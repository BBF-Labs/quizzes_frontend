"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/lib";
import { getAdminCourse, updateAdminCourse } from "@/controllers";
import { showToast } from "@/components";

interface FormState {
  title: string;
  about: string;
  code: string;
  creditHours: string;
  semester: string;
}

const toFormState = (course: {
  title?: string;
  about: string;
  code: string;
  creditHours?: number;
  semester: number;
}): FormState => ({
  title: course.title ?? "",
  about: course.about,
  code: course.code,
  creditHours: course.creditHours != null ? String(course.creditHours) : "",
  semester: String(course.semester),
});

const validate = (form: FormState) => {
  const errors: Partial<Record<keyof FormState, string>> = {};

  if (!form.code.trim()) errors.code = "Course code is required.";
  if (!form.about.trim()) errors.about = "Description is required.";

  if (!form.semester.trim()) {
    errors.semester = "Semester is required.";
  } else if (!Number.isInteger(Number(form.semester)) || Number(form.semester) < 1) {
    errors.semester = "Semester must be a whole number, 1 or greater.";
  }

  if (form.creditHours.trim()) {
    const n = Number(form.creditHours);
    if (!Number.isInteger(n) || n < 1 || n > 6) {
      errors.creditHours = "Credits must be a number 1–6.";
    }
  }

  return errors;
};

export default function AdminCourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const accessToken = useSelector(
    (state: RootState) => state.auth.credentials.accessToken
  );

  const [initial, setInitial] = useState<FormState | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!accessToken || !id) return;

    getAdminCourse(id, accessToken)
      .then((course) => {
        const state = toFormState(course);
        setInitial(state);
        setForm(state);
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }, [accessToken, id]);

  const isDirty = !!(
    initial &&
    form &&
    JSON.stringify(initial) !== JSON.stringify(form)
  );

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleCancel = () => {
    if (isDirty && !window.confirm("Discard unsaved changes?")) return;
    router.push("/admin/courses");
  };

  const handleSave = async () => {
    if (!form || !accessToken || !id) return;

    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    setSaveError("");

    try {
      const updated = await updateAdminCourse(
        id,
        {
          title: form.title.trim() || undefined,
          about: form.about.trim(),
          code: form.code.trim(),
          creditHours: form.creditHours.trim()
            ? Number(form.creditHours)
            : undefined,
          semester: Number(form.semester),
        },
        accessToken
      );

      const state = toFormState(updated);
      setInitial(state);
      setForm(state);
      showToast("Course updated", "success");
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-shell">
      <div className="adm-container">
        <Link href="/admin/courses" className="adm-back">
          ← Back to courses
        </Link>

        <div className="adm-header">
          <div>
            <div className="adm-title">Edit course</div>
            <div className="adm-subtitle">
              Changes save immediately to the course record and appear to
              students on their next refetch.
            </div>
          </div>
        </div>

        {loading && <div className="adm-loading">Loading course…</div>}
        {loadError && <div className="adm-error-banner">{loadError}</div>}

        {form && (
          <div className="adm-card">
            {saveError && <div className="adm-error-banner">{saveError}</div>}

            <div className="adm-field">
              <label className="adm-label" htmlFor="title">
                Title
              </label>
              <input
                id="title"
                className="adm-input"
                type="text"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            <div className="adm-field">
              <label className="adm-label" htmlFor="about">
                Description
              </label>
              <textarea
                id="about"
                className={`adm-textarea ${fieldErrors.about ? "adm-input-error" : ""}`}
                value={form.about}
                onChange={(e) => handleChange("about", e.target.value)}
              />
              {fieldErrors.about && (
                <span className="adm-error">{fieldErrors.about}</span>
              )}
            </div>

            <div className="adm-field">
              <label className="adm-label" htmlFor="code">
                Course code
              </label>
              <input
                id="code"
                className={`adm-input ${fieldErrors.code ? "adm-input-error" : ""}`}
                type="text"
                value={form.code}
                onChange={(e) => handleChange("code", e.target.value)}
              />
              {fieldErrors.code && (
                <span className="adm-error">{fieldErrors.code}</span>
              )}
            </div>

            <div className="adm-field">
              <label className="adm-label" htmlFor="creditHours">
                Credits
              </label>
              <input
                id="creditHours"
                className={`adm-input ${fieldErrors.creditHours ? "adm-input-error" : ""}`}
                type="number"
                min={1}
                max={6}
                value={form.creditHours}
                onChange={(e) => handleChange("creditHours", e.target.value)}
              />
              {fieldErrors.creditHours ? (
                <span className="adm-error">{fieldErrors.creditHours}</span>
              ) : (
                <span className="adm-hint">A whole number from 1 to 6.</span>
              )}
            </div>

            <div className="adm-field">
              <label className="adm-label" htmlFor="semester">
                Semester
              </label>
              <input
                id="semester"
                className={`adm-input ${fieldErrors.semester ? "adm-input-error" : ""}`}
                type="number"
                min={1}
                value={form.semester}
                onChange={(e) => handleChange("semester", e.target.value)}
              />
              {fieldErrors.semester && (
                <span className="adm-error">{fieldErrors.semester}</span>
              )}
            </div>

            <div className="adm-actions">
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                disabled={saving || !isDirty}
                onClick={handleSave}
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                className="adm-btn"
                disabled={saving}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
