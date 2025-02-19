"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThumbsDown, ThumbsUp, Ticket } from "lucide-react";
import { MemeDialog } from "./MemeDialog";

interface MemeCardProps {
  symbol: string;
  description: string;
  imageUrl: string;
  ticketCount: number;
  isTopPerformer?: boolean;
}

export function MemeCard({
  symbol,
  description,
  imageUrl,
  ticketCount,
  isTopPerformer = false,
}: MemeCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card
        className="w-full bg-[#FFFFFF] shadow-md p-4 mb-4 cursor-pointer hover:bg-gray-50 rounded-none"
        onClick={() => setDialogOpen(true)}
      >
        <div className="flex gap-4 bg-white">
          <img
            src={imageUrl}
            alt={symbol}
            className="w-24 h-24 object-cover rounded-none bg-[url('./src/cornim11 1.png')]"
          />
          <div className="flex-1 font-serif">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold">${symbol}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#2563EB] text-white hover:bg-blue-700 rounded-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ThumbsDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 border border-[#E6E6E6] rounded-none"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Ticket className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-orange-500 text-white hover:bg-orange-600 rounded-none"
                  onClick={(e) => e.stopPropagation()}
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
      <MemeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        symbol={symbol}
        description={description}
        imageUrl={imageUrl}
        ticketCount={ticketCount}
      />
    </>
  );
}
