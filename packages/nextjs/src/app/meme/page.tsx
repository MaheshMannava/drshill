import { Header } from "@/components/meme/Header";
import { CreateMemeButton } from "@/components/meme/CreateMemeButton";
import { MemeCard } from "@/components/meme/MemeCard";

const memes = [
  {
    symbol: "PINP",
    description:
      "The coin that makes you a true individual. This should be a max of 3 lines of text...",
    imageUrl: "https://images.unsplash.com/photo-1637858868799-7f26a0640eb6",
    ticketCount: 8045,
    isTopPerformer: true,
  },
  {
    symbol: "CRAP",
    description: "This one's for the dookies out there.",
    imageUrl: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e",
    ticketCount: 324,
  },
  {
    symbol: "KERN",
    description:
      "The Opportunity you've all been waiting for. Invest at least 12 thumbs for good luck!",
    imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076",
    ticketCount: 5,
  },
];

export default function MemePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <Header />
      <CreateMemeButton />
      <div className="w-full max-w-4xl mx-auto">
        {memes.map((meme) => (
          <MemeCard key={meme.symbol} {...meme} />
        ))}
      </div>
    </div>
  );
}
