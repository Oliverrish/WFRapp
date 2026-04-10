"use client";

import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { FolderOpen, Upload } from "lucide-react";

export default function FilesPage() {
  return (
    <>
      <PageHeader
        title="My Folder"
        description="Upload and manage your documents"
        actions={
          <Button className="h-11 gap-2 bg-primary hover:bg-wfr-navy-light text-primary-foreground">
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
        }
      />
      <div className="p-4 md:p-8">
        <EmptyState
          icon={FolderOpen}
          title="No files yet"
          description="Upload your first file or check WFR templates to get started."
        />
      </div>
    </>
  );
}
