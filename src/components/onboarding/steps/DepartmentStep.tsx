import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface DepartmentStepProps {
  onComplete: (data: Record<string, unknown>) => void;
  initialData?: Record<string, unknown>;
}

interface InstitutionOption {
  _id: string;
  name: string;
}

export default function DepartmentStep({
  onComplete,
  initialData,
}: DepartmentStepProps) {
  const universityId = initialData?.universityId as string;
  const [selectedCollege, setSelectedCollege] = useState(
    (initialData?.collegeId as string) || "",
  );
  const [selectedSchool, setSelectedSchool] = useState(
    (initialData?.schoolId as string) || "",
  );
  const [selectedDepartment, setSelectedDepartment] = useState(
    (initialData?.departmentId as string) || "",
  );
  const [collegeInput, setCollegeInput] = useState("");
  const [schoolInput, setSchoolInput] = useState("");
  const [departmentInput, setDepartmentInput] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  // Fetch Colleges
  const { data: colleges = [], isLoading: isLoadingColleges } = useQuery<
    InstitutionOption[]
  >({
    queryKey: ["colleges", universityId],
    queryFn: async () => {
      const res = await api.get(
        `/institutions/colleges?universityId=${universityId}`,
      );
      return res.data.data.results || res.data.data || [];
    },
    enabled: !!universityId,
  });

  // Fetch Schools when College changes
  const { data: schools = [], isLoading: isLoadingSchools } = useQuery<
    InstitutionOption[]
  >({
    queryKey: ["schools", selectedCollege],
    queryFn: async () => {
      const res = await api.get(
        `/institutions/schools?collegeId=${selectedCollege}`,
      );
      return res.data.data.results || res.data.data || [];
    },
    enabled: !!selectedCollege,
  });

  // Fetch Departments when School changes
  const { data: departments = [], isLoading: isLoadingDepartments } = useQuery<
    InstitutionOption[]
  >({
    queryKey: ["departments", selectedSchool],
    queryFn: async () => {
      const res = await api.get(
        `/institutions/departments?schoolId=${selectedSchool}`,
      );
      return res.data.data.results || res.data.data || [];
    },
    enabled: !!selectedSchool,
  });

  const isLoadingLevels = {
    colleges: isLoadingColleges,
    schools: isLoadingSchools,
    departments: isLoadingDepartments,
  };

  const filteredColleges = colleges.filter((item) =>
    item.name.toLowerCase().includes(collegeInput.toLowerCase()),
  );
  const filteredSchools = schools.filter((item) =>
    item.name.toLowerCase().includes(schoolInput.toLowerCase()),
  );
  const filteredDepartments = departments.filter((item) =>
    item.name.toLowerCase().includes(departmentInput.toLowerCase()),
  );

  const handleSubmit = () => {
    onComplete({
      collegeId: selectedCollege,
      schoolId: selectedSchool,
      departmentId: selectedDepartment,
    });
  };

  const handleSkip = () => {
    onComplete({ skipped: true });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-[-0.04em] uppercase leading-tight">
          Narrow it down.
        </h1>
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest leading-relaxed">
          Help us find your colleagues. You can skip this if you&apos;re not
          sure yet.
        </p>
      </div>

      <div className="space-y-6">
        {/* College Selector */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground flex justify-between">
            College
            {isLoadingLevels.colleges && (
              <Loader2 className="size-3 animate-spin" />
            )}
          </Label>
          <div className="relative">
            <Input
              value={isLoadingColleges ? "" : collegeInput}
              onFocus={() => setShowCollegeDropdown(true)}
              onBlur={() =>
                setTimeout(() => setShowCollegeDropdown(false), 200)
              }
              onChange={(e) => {
                setCollegeInput(e.target.value);
                setSelectedCollege("");
                setSelectedSchool("");
                setSchoolInput("");
                setSelectedDepartment("");
                setDepartmentInput("");
                setShowCollegeDropdown(true);
              }}
              placeholder={
                isLoadingColleges ? "LOADING..." : "Search college..."
              }
              className="w-full rounded-none border-border bg-secondary/40 font-mono text-xs uppercase h-11"
            />
            {showCollegeDropdown &&
              !isLoadingColleges &&
              filteredColleges.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-0.5 bg-background border border-border z-50 max-h-50 overflow-y-auto">
                  {filteredColleges.map((item) => (
                    <div
                      key={item._id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedCollege(item._id);
                        setCollegeInput(item.name);
                        setSelectedSchool("");
                        setSchoolInput("");
                        setSelectedDepartment("");
                        setDepartmentInput("");
                        setShowCollegeDropdown(false);
                      }}
                      className={`px-4 py-3 text-[10px] font-mono cursor-pointer border-b border-border/50 last:border-0 uppercase tracking-wider transition-colors ${
                        selectedCollege === item._id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* School Selector */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground flex justify-between">
            School / Faculty
            {isLoadingLevels.schools && (
              <Loader2 className="size-3 animate-spin" />
            )}
          </Label>
          <div className="relative">
            <Input
              value={isLoadingSchools ? "" : schoolInput}
              disabled={!selectedCollege}
              onFocus={() => selectedCollege && setShowSchoolDropdown(true)}
              onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
              onChange={(e) => {
                setSchoolInput(e.target.value);
                setSelectedSchool("");
                setSelectedDepartment("");
                setDepartmentInput("");
                setShowSchoolDropdown(true);
              }}
              placeholder={
                !selectedCollege
                  ? "Select college first"
                  : isLoadingSchools
                    ? "LOADING..."
                    : "Search school / faculty..."
              }
              className="w-full rounded-none border-border bg-secondary/40 font-mono text-xs uppercase h-11 disabled:opacity-60"
            />
            {showSchoolDropdown &&
              !isLoadingSchools &&
              filteredSchools.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-0.5 bg-background border border-border z-50 max-h-50 overflow-y-auto">
                  {filteredSchools.map((item) => (
                    <div
                      key={item._id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedSchool(item._id);
                        setSchoolInput(item.name);
                        setSelectedDepartment("");
                        setDepartmentInput("");
                        setShowSchoolDropdown(false);
                      }}
                      className={`px-4 py-3 text-[10px] font-mono cursor-pointer border-b border-border/50 last:border-0 uppercase tracking-wider transition-colors ${
                        selectedSchool === item._id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        {/* Department Selector */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground flex justify-between">
            Department
            {isLoadingLevels.departments && (
              <Loader2 className="size-3 animate-spin" />
            )}
          </Label>
          <div className="relative">
            <Input
              value={isLoadingDepartments ? "" : departmentInput}
              disabled={!selectedSchool}
              onFocus={() => selectedSchool && setShowDepartmentDropdown(true)}
              onBlur={() =>
                setTimeout(() => setShowDepartmentDropdown(false), 200)
              }
              onChange={(e) => {
                setDepartmentInput(e.target.value);
                setSelectedDepartment("");
                setShowDepartmentDropdown(true);
              }}
              placeholder={
                !selectedSchool
                  ? "Select school first"
                  : isLoadingDepartments
                    ? "LOADING..."
                    : "Search department..."
              }
              className="w-full rounded-none border-border bg-secondary/40 font-mono text-xs uppercase h-11 disabled:opacity-60"
            />
            {showDepartmentDropdown &&
              !isLoadingDepartments &&
              filteredDepartments.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-0.5 bg-background border border-border z-50 max-h-50 overflow-y-auto">
                  {filteredDepartments.map((item) => (
                    <div
                      key={item._id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSelectedDepartment(item._id);
                        setDepartmentInput(item.name);
                        setShowDepartmentDropdown(false);
                      }}
                      className={`px-4 py-3 text-[10px] font-mono cursor-pointer border-b border-border/50 last:border-0 uppercase tracking-wider transition-colors ${
                        selectedDepartment === item._id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            className="w-full rounded-none font-mono text-xs tracking-[0.2em] uppercase h-12 shadow-[0_0_20px_rgba(var(--primary),0.1)] hover:shadow-[0_0_30px_rgba(var(--primary),0.2)] transition-all"
          >
            Continue
          </Button>
          <button
            onClick={handleSkip}
            className="group flex items-center justify-center gap-2 text-[10px] font-mono tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors text-center py-2"
          >
            [ Skip for now ]{" "}
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
