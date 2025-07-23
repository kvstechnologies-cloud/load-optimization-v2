import { Search, Filter, CheckCircle, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface ControlPanelProps {
  groupBy: string;
  onGroupByChange: (value: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onBulkAccept: () => void;
  onBulkReject: () => void;
  onExport: () => void;
  selectedCount: number;
}

export function ControlPanel({
  groupBy,
  onGroupByChange,
  searchTerm,
  onSearchChange,
  onBulkAccept,
  onBulkReject,
  onExport,
  selectedCount,
}: ControlPanelProps) {
  return (
    <Card className="shadow-md mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex flex-wrap items-center space-x-4">
            <h2 className="text-lg font-medium text-gray-900">Shipment Details</h2>
            
            <div className="flex items-center">
              <Filter className="text-gray-600 mr-2 h-4 w-4" />
              <Select value={groupBy} onValueChange={onGroupByChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select grouping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Grouping</SelectItem>
                  <SelectItem value="plant">Group by Plant</SelectItem>
                  <SelectItem value="mill">Group by Mill</SelectItem>
                  <SelectItem value="sku">Group by SKU</SelectItem>
                  <SelectItem value="truck">Group by Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center">
              <Search className="text-gray-600 mr-2 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-48"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={onBulkAccept}
              disabled={selectedCount === 0}
              className="bg-green-600 hover:bg-green-700 text-white text-sm"
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Accept All ({selectedCount})
            </Button>
            <Button
              onClick={onBulkReject}
              disabled={selectedCount === 0}
              className="bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              <X className="mr-1 h-4 w-4" />
              Reject All ({selectedCount})
            </Button>
            <Button
              onClick={onExport}
              variant="secondary"
              className="bg-gray-600 hover:bg-gray-700 text-white text-sm"
            >
              <Download className="mr-1 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
