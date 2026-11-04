import { JobForm } from "@/components/JobForm";

export default function NewJobPage() {
  return (
    <div className="py-2">
      <JobForm isEditing={false} />
    </div>
  );
}
