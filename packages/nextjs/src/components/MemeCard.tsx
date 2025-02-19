import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThumbsDown, ThumbsUp, Ticket } from "lucide-react";

interface MemeCardProps {
  symbol: string;
  description: string;
  imageUrl: string;
  ticketCount: number;
  isTopPerformer?: boolean;
}

export default function MemeCard({
  symbol,
  description,
  imageUrl,
  ticketCount,
  isTopPerformer = false,
}: MemeCardProps) {
  return (
    <Card className="w-full bg-white shadow-md p-4 mb-4">
      <div className="flex gap-4">
        <img
          src={imageUrl}
          alt={symbol}
          className="w-24 h-24 object-cover rounded-md"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold">${symbol}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Ticket className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {isTopPerformer && <span className="text-yellow-500">👑</span>}
              <Ticket className="h-4 w-4 text-yellow-500" />
              <span className="font-mono font-bold">{ticketCount}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
