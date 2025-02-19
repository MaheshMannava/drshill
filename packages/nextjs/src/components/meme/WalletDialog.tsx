"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogPortal } from "@radix-ui/react-dialog";

interface WalletDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const walletOptions = [
  "WALLETCONNECT",
  "COINBASE WALLET",
  "METAMASK",
  "INJECTED",
  "BRAVE WALLET",
];

export function WalletDialog({
  open = false,
  onOpenChange,
}: WalletDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogContent className="max-w-[440px] p-0 gap-0 bg-[#E6E6E6] border-0 rounded-none">
          {/* Yellow strip at top */}

          {/* Main content area with layered shadow effect */}
          <div className="m-3 shadow-[2px_2px_4px_rgba(0,0,0,0.05)] bg-[#cdcdcd]">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-[#E6E6E6]">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-serif">🗝️ CONNECT WALLET</h2>
              </div>
              <button
                onClick={() => onOpenChange?.(false)}
                className="w-8 h-8 flex items-center justify-center text-xl hover:bg-black/5"
              >
                ×
              </button>
            </div>

            {/* Wallet options */}
            <div className="p-4 space-y-[6px] bg-[#a3a3a3]">
              {walletOptions.map((wallet) => (
                <button
                  key={wallet}
                  className="w-full h-12 px-4 hover:bg-gray-50 border border-[#E6E6E6] flex items-center justify-between font-serif bg-[#cfcfcf]"
                >
                  <span>{wallet}</span>
                  <span className="text-lg">→</span>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-[#E6E6E6]">
              <p className="text-[11px] text-[#666666] mb-4 text-center max-w-[360px] mx-auto leading-[14px]">
                DON'T HAVE A WALLET? GENERATE A BURNER WALLET TO MAKE THINGS
                EASY. ANY WINNINGS FROM THE GAME WILL BE SENT HERE.
              </p>
              <button className="w-full h-12 bg-[#2563EB] hover:bg-blue-700 text-white font-serif flex items-center justify-center gap-2">
                GENERATE BURNER 🔥
              </button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
