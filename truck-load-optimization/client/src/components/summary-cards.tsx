import { Truck, Scale, Package, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SummaryCardsProps {
  totalTrucks: number;
  totalTons: number;
  totalRolls: number;
  acceptedCount: number;
}

export function SummaryCards({ totalTrucks, totalTons, totalRolls, acceptedCount }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Truck className="text-blue-600 h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Trucks</p>
              <p className="text-2xl font-bold text-gray-900">{totalTrucks}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Scale className="text-green-600 h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tons</p>
              <p className="text-2xl font-bold text-gray-900">{totalTons}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center">
            <Package className="text-orange-600 h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Rolls</p>
              <p className="text-2xl font-bold text-gray-900">{totalRolls}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center">
            <CheckCircle className="text-green-600 h-8 w-8 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-gray-900">{acceptedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
