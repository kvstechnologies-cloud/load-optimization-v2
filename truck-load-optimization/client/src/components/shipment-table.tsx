import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, X, Truck, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import type { Shipment } from "@shared/schema";

interface ShipmentTableProps {
  shipments: Shipment[];
  groupBy: string;
  searchTerm: string;
  selectedShipments: Set<number>;
  onSelectedShipmentsChange: (selected: Set<number>) => void;
  onStatusUpdate: (id: number, status: string) => void;
  isUpdating: boolean;
}

type SortField = "plant" | "mill" | "date" | "truckNumber" | "sku" | "numberOfRolls" | "tons";
type SortDirection = "asc" | "desc";

export function ShipmentTable({
  shipments,
  groupBy,
  searchTerm,
  selectedShipments,
  onSelectedShipmentsChange,
  onStatusUpdate,
  isUpdating,
}: ShipmentTableProps) {
  const [sortField, setSortField] = useState<SortField>("plant");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Filter shipments based on search term
  const filteredShipments = useMemo(() => {
    if (!searchTerm) return shipments;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return shipments.filter(shipment =>
      shipment.plant.toLowerCase().includes(lowerSearchTerm) ||
      shipment.mill.toLowerCase().includes(lowerSearchTerm) ||
      shipment.sku.toLowerCase().includes(lowerSearchTerm) ||
      shipment.truckNumber.toLowerCase().includes(lowerSearchTerm)
    );
  }, [shipments, searchTerm]);

  // Sort shipments
  const sortedShipments = useMemo(() => {
    return [...filteredShipments].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
  }, [filteredShipments, sortField, sortDirection]);

  // Group shipments
  const groupedShipments = useMemo(() => {
    if (groupBy === "none") return null;
    
    const groups = new Map<string, Shipment[]>();
    
    sortedShipments.forEach(shipment => {
      let groupKey = "";
      switch (groupBy) {
        case "plant":
          groupKey = shipment.plant;
          break;
        case "mill":
          groupKey = shipment.mill;
          break;
        case "sku":
          groupKey = shipment.sku;
          break;
        case "truck":
          groupKey = shipment.truckNumber;
          break;
        default:
          groupKey = "Unknown";
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(shipment);
    });
    
    return groups;
  }, [sortedShipments, groupBy]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(sortedShipments.map(s => s.id));
      onSelectedShipmentsChange(allIds);
    } else {
      onSelectedShipmentsChange(new Set());
    }
  };

  const handleSelectShipment = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedShipments);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    onSelectedShipmentsChange(newSelected);
  };

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Accepted</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-4 w-4 text-gray-400" />;
    return sortDirection === "asc" 
      ? <ChevronUp className="ml-1 h-4 w-4" />
      : <ChevronDown className="ml-1 h-4 w-4" />;
  };

  const renderTableHeader = () => (
    <TableHeader>
      <TableRow>
        <TableHead className="w-8">
          <Checkbox
            checked={selectedShipments.size === sortedShipments.length && sortedShipments.length > 0}
            onCheckedChange={handleSelectAll}
          />
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("plant")}
        >
          <div className="flex items-center">
            Plant
            {getSortIcon("plant")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("mill")}
        >
          <div className="flex items-center">
            Mill
            {getSortIcon("mill")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("date")}
        >
          <div className="flex items-center">
            Date
            {getSortIcon("date")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("truckNumber")}
        >
          <div className="flex items-center">
            Truck
            {getSortIcon("truckNumber")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("sku")}
        >
          <div className="flex items-center">
            SKU
            {getSortIcon("sku")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("numberOfRolls")}
        >
          <div className="flex items-center">
            Rolls
            {getSortIcon("numberOfRolls")}
          </div>
        </TableHead>
        <TableHead 
          className="cursor-pointer hover:bg-gray-100"
          onClick={() => handleSort("tons")}
        >
          <div className="flex items-center">
            Tons
            {getSortIcon("tons")}
          </div>
        </TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  const renderShipmentRow = (shipment: Shipment) => (
    <TableRow key={shipment.id} className="hover:bg-gray-50">
      <TableCell>
        <Checkbox
          checked={selectedShipments.has(shipment.id)}
          onCheckedChange={(checked) => handleSelectShipment(shipment.id, !!checked)}
        />
      </TableCell>
      <TableCell className="font-medium">{shipment.plant}</TableCell>
      <TableCell>{shipment.mill}</TableCell>
      <TableCell>{shipment.date}</TableCell>
      <TableCell>
        <div className="flex items-center">
          <Truck className="text-gray-400 mr-2 h-4 w-4" />
          {shipment.truckNumber}
        </div>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="text-xs">
          {shipment.sku}
        </Badge>
      </TableCell>
      <TableCell>{shipment.numberOfRolls}</TableCell>
      <TableCell>{shipment.tons}</TableCell>
      <TableCell>{getStatusBadge(shipment.status)}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStatusUpdate(shipment.id, "accepted")}
            disabled={isUpdating}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 p-1"
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStatusUpdate(shipment.id, "rejected")}
            disabled={isUpdating}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  const renderGroupedView = () => {
    if (!groupedShipments) return null;
    
    return (
      <div className="space-y-4">
        {Array.from(groupedShipments.entries()).map(([groupName, groupShipments]) => {
          const isExpanded = expandedGroups.has(groupName);
          const groupTrucks = new Set(groupShipments.map(s => s.truckNumber)).size;
          const groupTons = groupShipments.reduce((sum, s) => sum + s.tons, 0);
          const groupRolls = groupShipments.reduce((sum, s) => sum + s.numberOfRolls, 0);
          
          return (
            <Card key={groupName} className="shadow-md">
              <div 
                className="px-6 py-4 bg-gray-25 cursor-pointer hover:bg-gray-100 border-b border-gray-200"
                onClick={() => toggleGroup(groupName)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {isExpanded ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
                    <h4 className="text-md font-medium text-gray-900">{groupName}</h4>
                    <Badge variant="secondary" className="ml-2">
                      {groupShipments.length} shipments
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Truck className="mr-1 h-3 w-3" />
                      <span>{groupTrucks} trucks</span>
                    </div>
                    <div className="flex items-center">
                      <span>{groupTons} tons</span>
                    </div>
                    <div className="flex items-center">
                      <span>{groupRolls} rolls</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {isExpanded && (
                <div className="overflow-x-auto">
                  <Table>
                    {renderTableHeader()}
                    <TableBody>
                      {groupShipments.map(renderShipmentRow)}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  if (groupBy !== "none") {
    return renderGroupedView();
  }

  return (
    <Card className="shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          {renderTableHeader()}
          <TableBody>
            {sortedShipments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                  {searchTerm ? "No shipments found matching your search." : "No shipments available. Run optimization to load data."}
                </TableCell>
              </TableRow>
            ) : (
              sortedShipments.map(renderShipmentRow)
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
