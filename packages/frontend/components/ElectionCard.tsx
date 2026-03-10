import Link from 'next/link';
import { Calendar, Users, Vote } from 'lucide-react';

interface ElectionCardProps {
    id: number;
    title: string;
    description: string;
    endTime: number;
    candidateCount: number;
    totalVotes: number;
}

const ElectionCard = ({ id, title, description, endTime, candidateCount, totalVotes }: ElectionCardProps) => {
    const timeLeft = Math.max(0, endTime - Math.floor(Date.now() / 1000));
    const days = Math.floor(timeLeft / 86400);
    const hours = Math.floor((timeLeft % 86400) / 3600);

    return (
        <div className="glass rounded-2xl p-6 flex flex-col h-full hover:border-blue-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                    {title}
                </h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${timeLeft > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {timeLeft > 0 ? 'Active' : 'Ended'}
                </span>
            </div>

            <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-grow">
                {description}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Users size={16} className="text-blue-500" />
                    <span>{candidateCount} Candidates</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Vote size={16} className="text-blue-500" />
                    <span>{totalVotes} Votes</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-sm col-span-2">
                    <Calendar size={16} className="text-blue-500" />
                    <span>Ends in: {days}d {hours}h</span>
                </div>
            </div>

            <Link
                href={`/election/${id}`}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl text-center transition-colors"
            >
                View Election
            </Link>
        </div>
    );
};

export default ElectionCard;
