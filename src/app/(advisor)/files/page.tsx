"use client";

import { Header } from "@/components/shared/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderOpen, Upload } from "lucide-react";

export default function FilesPage() {
  return (
    <>
      <Header title="My Folder" />
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#1a1a2e]">
              My Files
            </h2>
            <p className="text-base text-[#64748b]">
              Upload and manage your documents, images, and spreadsheets.
            </p>
          </div>
          <Button className="h-11 gap-2 bg-[#1e3a5f] hover:bg-[#2d4a6f]">
            <Upload className="h-4 w-4" />
            Upload File
          </Button>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0f4f8]">
              <FolderOpen className="h-8 w-8 text-[#1e3a5f]" />
            </div>
            <h2 className="text-xl font-semibold text-[#1a1a2e]">
              No files yet
            </h2>
            <p className="mt-2 max-w-sm text-base text-[#64748b]">
              Upload your first file or check WFR templates to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
