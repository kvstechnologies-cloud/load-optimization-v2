import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Truck, Settings, CheckCircle, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SummaryCards } from "@/components/summary-cards";
import { ControlPanel } from "@/components/control-panel";
import { ShipmentTable } from "@/components/shipment-table";
import { UploadDialog } from "@/components/upload-dialog";
import type { Shipment } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const [groupBy, setGroupBy] = useState<string>("none");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShipments, setSelectedShipments] = useState<Set<number>>(new Set());
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Fetch shipments
  const { data: shipments = [], isLoading } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments"],
  });

  // Run optimization mutation
  const runOptimizationMutation = useMutation({
    mutationFn: async (file?: File) => {
      const formData = new FormData();
      if (file) {
        formData.append('csvFile', file);
      }
      
      const response = await fetch("/api/optimization/run", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to process file");
      }
      
      return response.json();
    },
    onSuccess: (data, file) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      setSelectedShipments(new Set());
      setUploadDialogOpen(false);
      toast({
        title: "Processing Complete",
        description: file ? "CSV file uploaded and processed successfully." : "Sample data loaded successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process data. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update shipment status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/shipments/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
    },
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: number[]; status: string }) => {
      const response = await apiRequest("PATCH", "/api/shipments/bulk-status", { ids, status });
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      setSelectedShipments(new Set());
      toast({
        title: `Shipments ${variables.status}`,
        description: `${variables.ids.length} shipments have been ${variables.status}.`,
      });
    },
  });

  // Calculate summary statistics
  const totalTrucks = new Set(shipments.map(s => s.truckNumber)).size;
  const totalTons = shipments.reduce((sum, s) => sum + s.tons, 0);
  const totalRolls = shipments.reduce((sum, s) => sum + s.numberOfRolls, 0);
  const acceptedCount = shipments.filter(s => s.status === "accepted").length;

  const handleRunOptimization = () => {
    runOptimizationMutation.mutate(undefined);
  };

  const handleFileUpload = (file: File) => {
    runOptimizationMutation.mutate(file);
  };

  // Upload only mutation
  const uploadOnlyMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      
      const response = await fetch("/api/csv/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload file");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setUploadDialogOpen(false);
      toast({
        title: "Upload Complete",
        description: `${data.filename} uploaded successfully with ${data.rowCount} rows.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUploadOnly = (file: File) => {
    uploadOnlyMutation.mutate(file);
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleBulkAction = (status: string) => {
    const ids = Array.from(selectedShipments);
    if (ids.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select shipments to perform bulk actions.",
        variant: "destructive",
      });
      return;
    }
    bulkUpdateMutation.mutate({ ids, status });
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/shipments/export");
      if (!response.ok) {
        throw new Error("No accepted shipments to export");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "accepted_shipments.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "Accepted shipments have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "No accepted shipments found to export.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading shipment data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-roboto">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Truck className="text-blue-600 mr-3 h-6 w-6" />
              <h1 className="text-xl font-medium text-gray-900">Truck Load Optimization</h1>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setUploadDialogOpen(true)}
                disabled={runOptimizationMutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload CSV
              </Button>
              <Button
                onClick={handleRunOptimization}
                disabled={runOptimizationMutation.isPending}
                variant="secondary"
                className="shadow-md"
              >
                <Settings className="mr-2 h-4 w-4" />
                {runOptimizationMutation.isPending ? "Generating..." : "Generate Shipment Details"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SummaryCards
          totalTrucks={totalTrucks}
          totalTons={totalTons}
          totalRolls={totalRolls}
          acceptedCount={acceptedCount}
        />

        <ControlPanel
          groupBy={groupBy}
          onGroupByChange={setGroupBy}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onBulkAccept={() => handleBulkAction("accepted")}
          onBulkReject={() => handleBulkAction("rejected")}
          onExport={handleExport}
          selectedCount={selectedShipments.size}
        />

        <ShipmentTable
          shipments={shipments}
          groupBy={groupBy}
          searchTerm={searchTerm}
          selectedShipments={selectedShipments}
          onSelectedShipmentsChange={setSelectedShipments}
          onStatusUpdate={handleStatusUpdate}
          isUpdating={updateStatusMutation.isPending || bulkUpdateMutation.isPending}
        />

        <UploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          onUpload={handleFileUpload}
          onUploadOnly={handleUploadOnly}
          isUploading={runOptimizationMutation.isPending || uploadOnlyMutation.isPending}
        />
      </main>
    </div>
  );
}
