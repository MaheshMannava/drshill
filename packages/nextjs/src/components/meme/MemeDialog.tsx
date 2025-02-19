"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogPortal } from "@radix-ui/react-dialog";
import { ArrowLeft, Ticket } from "lucide-react";

interface MemeDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  symbol?: string;
  ticketCount?: number;
  imageUrl?: string;
  description?: string;
}

interface Comment {
  address: string;
  text: string;
}

const comments: Comment[] = [
  {
    address: "0x3849504xcw3932...",
    text: "Whoa, this meme is tight!",
  },
  {
    address: "0x943r3299dfv9d51...",
    text: "Interesting choice to change the letter M to N.",
  },
  {
    address: "0x8430448jjn52851...",
    text: "This looks like a promising investment",
  },
  {
    address: "0x63890472jn292m1...",
    text: "PINP is the strategic reserve chosen by Mr. Trump!",
  },
];

export function MemeDialog({
  open = false,
  onOpenChange,
  symbol = "PINP",
  ticketCount = 8045,
  imageUrl = "https://images.unsplash.com/photo-1637858868799-7f26a0640eb6",
  description = "The coin that makes you a true individual. This should be a max of 3 lines of text...",
}: MemeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="max-w-[440px] p-0 gap-0 bg-[#E6E6E6] border-0 rounded-none">
          {/* Top yellow strip */}

          {/* Main content area */}
          <div className="m-3 bg-white shadow-[2px_2px_4px_rgba(0,0,0,0.05)]">
            {/* Header with back button and symbol */}
            <div className="flex items-center p-3 border-b border-[#E6E6E6]">
              <button
                onClick={() => onOpenChange?.(false)}
                className="mr-3 hover:bg-black/5 p-1 rounded"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="text-xl font-serif">${symbol}</span>
            </div>

            {/* Meme content */}
            <div className="p-4">
              <div className="flex gap-4 mb-4">
                <img
                  src={imageUrl}
                  alt={symbol}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      <button className="bg-blue-600 text-white px-4 py-1 rounded">
                        👎
                      </button>
                      <button className="border border-gray-200 px-4 py-1 rounded">
                        <Ticket className="h-4 w-4" />
                      </button>
                      <button className="bg-orange-500 text-white px-4 py-1 rounded">
                        👍
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Ticket className="h-4 w-4 text-yellow-500" />
                      <span className="font-mono font-bold">{ticketCount}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    FULL DESCRIPTION - MAX 3 LINES
                  </p>
                </div>
              </div>

              {/* Comments section */}
              <div className="border-t border-[#E6E6E6] pt-2">
                <div className="text-xs text-gray-500 mb-2">
                  PINP CREATOR NAME
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {comments.map((comment, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-xs text-blue-500">
                        {comment.address}
                      </span>
                      <span className="text-xs">{comment.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer with input */}
            <div className="p-4 border-t border-[#E6E6E6] flex gap-2">
              <input
                type="text"
                placeholder="0x63890472jn292m1..."
                className="flex-1 px-3 py-2 border border-[#E6E6E6] text-xs"
              />
              <button className="bg-blue-600 text-white px-6 py-2 font-serif">
                SEND
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
