"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";

interface NotEnoughTicketsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  requiredTickets?: number;
  walletAddress?: string;
}

export function NotEnoughTicketsDialog({
  open = true,
  onOpenChange,
  requiredTickets = 60,
  walletAddress = "0x348879...",
}: NotEnoughTicketsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-0 gap-0 border-0 rounded-none bg-transparent">
        {/* Main content area with layered shadow effect */}
        <div className="m-3 bg-[#E6E6E6] shadow-[2px_2px_4px_rgba(0,0,0,0.05)]">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-[#E6E6E6]">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">MY TICKET BALANCE</span>
              <span className="text-sm">{walletAddress}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 bg-[#E6E6E6]">
            <div className="flex items-center gap-3 mb-6">
              <Ticket className="h-6 w-6" />
              <h2 className="text-xl font-serif">NOT ENOUGH TICKETS</h2>
            </div>

            <div className="text-center mb-4">
              <p className="mb-6">
                YOU NEED {requiredTickets} TICKETS TO MAKE A MEME.
              </p>

              <div className="relative w-[280px] mx-auto mb-4">
                <img
                  src="/images/DRSHILL3 1.png"
                  alt="Dr. Shill"
                  className="w-full"
                />
                <div className="absolute -top-6 -right-4">
                  <div className="relative">
                    <div className="bg-white rounded-full p-2 flex items-center gap-1">
                      <Ticket className="h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-bold">
                        {requiredTickets}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute left-8 top-4 bg-white px-4 py-2 rounded-2xl">
                  <p className="text-sm font-bold">
                    "THE TRAIN DONE LEFT THE STATION, CHAMP."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4">
            <Button
              className="w-full bg-[#2563EB] hover:bg-blue-700 text-white h-12 rounded-none font-serif"
              onClick={() => onOpenChange?.(false)}
            >
              I'LL BE BETTER, DR. SHILL
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
