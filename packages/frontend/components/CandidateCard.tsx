import Image from 'next/image';
import { Check } from 'lucide-react';

interface CandidateCardProps {
    id: number;
    name: string;
    voteCount: number;
    ipfsImageHash: string;
    onVote: (id: number) => void;
    isVoting: boolean;
    disabled: boolean;
    hasVoted: boolean;
    votedForThis: boolean;
}

const CandidateCard = ({
    id,
    name,
    voteCount,
    ipfsImageHash,
    onVote,
    isVoting,
    disabled,
    hasVoted,
    votedForThis
}: CandidateCardProps) => {
    const imageUrl = ipfsImageHash.startsWith('http')
        ? ipfsImageHash
        : `https://gateway.pinata.cloud/ipfs/${ipfsImageHash}`;

    return (
        <div className={`glass rounded-2xl overflow-hidden border-2 transition-all ${votedForThis ? 'border-blue-500 bg-blue-500/5' : 'border-transparent'}`}>
            <div className="relative h-48 w-full bg-slate-800">
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 33vw"
                />
                {votedForThis && (
                    <div className="absolute top-3 right-3 bg-blue-600 text-white p-1.5 rounded-full shadow-lg">
                        <Check size={18} />
                    </div>
                )}
            </div>

            <div className="p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-xl font-bold text-slate-100">{name}</h4>
                    <span className="text-blue-400 font-semibold">{voteCount} Votes</span>
                </div>

                <button
                    onClick={() => onVote(id)}
                    disabled={disabled || isVoting || hasVoted}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${votedForThis
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50 cursor-default'
                            : hasVoted
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20'
                        }`}
                >
                    {isVoting ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Voting...
                        </span>
                    ) : votedForThis ? (
                        'You voted for this'
                    ) : hasVoted ? (
                        'Already Voted'
                    ) : (
                        'Cast Vote'
                    )}
                </button>
            </div>
        </div>
    );
};

export default CandidateCard;
