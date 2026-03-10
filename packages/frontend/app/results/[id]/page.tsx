'use client';

import { useParams } from 'next/navigation';
import { useReadContract } from 'wagmi';
import { VOTING_ABI } from '@/lib/contractABI';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Share2, Info } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function ResultsPage() {
    const { id } = useParams();
    const electionId = BigInt(id as string);

    const { data: election } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'elections',
        args: [electionId],
    });

    const { data: results } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'getResults',
        args: [electionId],
    });

    if (!results || !election) return <div className="py-20 text-center animate-pulse">Loading results...</div>;

    const [names, voteCounts] = results as [string[], bigint[]];
    const chartData = names.map((name, i) => ({
        name,
        votes: Number(voteCounts[i]),
    }));

    const totalVotes = chartData.reduce((acc, curr) => acc + curr.votes, 0);
    const maxVotes = Math.max(...chartData.map(d => d.votes));
    const winner = chartData.find(d => d.votes === maxVotes && maxVotes > 0);

    const COLORS = ['#3b82f6', '#2dd4bf', '#8b5cf6', '#f59e0b', '#ec4899'];

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Results link copied to clipboard!');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold">Election Results</h1>
                <p className="text-xl text-slate-400">{(election as any)[1]}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats Column */}
                <div className="space-y-6">
                    <div className="glass rounded-3xl p-6 space-y-2">
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Votes Cast</p>
                        <p className="text-4xl font-black text-blue-500">{totalVotes}</p>
                    </div>

                    {winner && (
                        <div className="glass rounded-3xl p-6 border-2 border-blue-500/30 bg-blue-500/5 space-y-4">
                            <div className="flex items-center gap-3 text-blue-400">
                                <Trophy size={24} />
                                <span className="font-bold">Current Leader</span>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{winner.name}</p>
                                <p className="text-slate-400">{winner.votes} Votes</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleShare}
                        className="w-full glass hover:bg-slate-800 rounded-2xl p-4 flex items-center justify-center gap-3 text-slate-200 transition-colors"
                    >
                        <Share2 size={20} />
                        <span>Share Results</span>
                    </button>
                </div>

                {/* Chart Column */}
                <div className="lg:col-span-2 glass rounded-3xl p-8 h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                allowDecimals={false}
                            />
                            <Tooltip
                                cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px' }}
                                itemStyle={{ color: '#3b82f6' }}
                            />
                            <Bar dataKey="votes" radius={[8, 8, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="glass rounded-2xl p-6 flex items-start gap-4 text-slate-400 text-sm italic">
                <Info size={20} className="text-blue-500 shrink-0" />
                <p>
                    All results are pulled directly from the Ethereum Sepolia testnet. Every vote is cryptographically
                    signed and verified on-chain, ensuring absolute transparency and integrity of the process.
                </p>
            </div>
        </div>
    );
}
