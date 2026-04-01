"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, X, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminCourses,
  useAdminCreateCourse,
  type AdminCourse,
} from "@/hooks/admin/use-academics";

// ─── Create form ──────────────────────────────────────────────────────────────

function CreateCourseForm({ onClose }: { onClose: () => void }) {
  const createMutation = useAdminCreateCourse();
  const [form, setForm] = useState({
    code: "",
    title: "",
    about: "",
    semester: 1,
    creditHours: 3,
    year: new Date().getFullYear(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(form);
      toast.success("Course created");
      onClose();
    } catch {
      toast.error("Failed to create course");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-primary/30 bg-primary/5 p-4 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-mono uppercase tracking-widest font-bold">New Course</p>
        <button onClick={onClose} className="text-muted-foreground/40 hover:text-muted-foreground">
          <X className="size-3.5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Code *
          </label>
          <input
            required
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
            placeholder="e.g. CS101"
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Title
          </label>
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Full course title"
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            About *
          </label>
          <textarea
            required
            value={form.about}
            onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
            placeholder="Brief course description"
            rows={2}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 resize-none transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Semester
          </label>
          <input
            type="number"
            min={1}
            value={form.semester}
            onChange={(e) => setForm((f) => ({ ...f, semester: +e.target.value }))}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div>
          <label className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50 block mb-1">
            Credit Hours
          </label>
          <input
            type="number"
            min={1}
            value={form.creditHours}
            onChange={(e) => setForm((f) => ({ ...f, creditHours: +e.target.value }))}
            className="w-full border border-border/50 bg-background/40 px-3 py-2 text-[12px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="sm:col-span-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest border border-border/40 hover:bg-secondary/20 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-2 text-[10px] font-mono uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all"
          >
            {createMutation.isPending ? "Creating…" : "Create"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  const { data: courses = [], isLoading } = useAdminCourses();
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const filtered = courses.filter((c) => {
    if (!search.trim()) return true;
    const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    return re.test(c.code) || re.test(c.title ?? "") || re.test(c.about);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-block border border-primary/60 px-2 py-1 mb-2 bg-primary/5">
              <span className="text-[10px] font-mono tracking-widest uppercase text-primary">
                Academics
              </span>
            </div>
            <h1 className="text-2xl font-mono font-bold tracking-widest uppercase">Courses</h1>
          </div>
          <button
            onClick={() => setShowCreate((v) => !v)}
            className="flex items-center gap-2 bg-primary px-4 py-2 text-[10px] font-mono uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all"
          >
            <Plus className="size-3.5" />
            New Course
          </button>
        </div>
      </motion.div>

      {showCreate && <CreateCourseForm onClose={() => setShowCreate(false)} />}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses…"
          className="w-full border border-border/50 bg-card/40 pl-9 pr-9 py-2.5 text-[12px] font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 animate-pulse bg-card/40 border border-border/30" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <div className="flex size-12 items-center justify-center border border-primary/20 bg-primary/5">
            <BookOpen className="size-5 text-primary/60" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
            {search ? "No matching courses" : "No courses yet"}
          </p>
        </div>
      )}

      {/* Table */}
      {!isLoading && filtered.length > 0 && (
        <div className="border border-border/40 overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-border/40 bg-card/30">
              <tr>
                {["Code", "Title", "Semester", "Credits", "Year"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[9px] font-mono uppercase tracking-widest text-muted-foreground/50"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c._id}
                  className="border-b border-border/20 hover:bg-primary/5 transition-colors"
                >
                  <td className="px-4 py-3 text-[11px] font-mono font-bold text-primary">
                    {c.code}
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono text-foreground max-w-xs truncate">
                    {c.title || c.about}
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground">
                    Sem {c.semester}
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground">
                    {c.creditHours} cr
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono text-muted-foreground">
                    {c.year}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-[10px] font-mono text-muted-foreground/30 uppercase tracking-widest">
        {filtered.length} of {courses.length} courses
      </p>
    </div>
  );
}
