'use client';

import { useParams } from 'next/navigation';
import { useReadContract, useReadContracts, useWriteContract, useAccount, useWatchContractEvents } from 'wagmi';
import { VOTING_ABI } from '@/lib/contractABI';
import CandidateCard from '@/components/CandidateCard';
import { toast } from 'react-hot-toast';
import { Clock, Info, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function ElectionDetail() {
    const { id } = useParams();
    const electionId = BigInt(id as string);
    const { address } = useAccount();

    // 1. Fetch Election Details
    const { data: election, refetch: refetchElection } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'elections',
        args: [electionId],
    });

    // 2. Fetch Eligibility
    const { data: isEligible, refetch: refetchEligibility } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        functionName: 'isEligibleToVote',
        args: [electionId, address as `0x${string}`],
        query: { enabled: !!address },
    });

    // 3. Fetch Candidates
    const candidateIds = Array.from(
        { length: Number((election as any)?.[6] || 0) },
        (_, i) => BigInt(i + 1)
    );

    const { data: candidatesData, refetch: refetchCandidates } = useReadContracts({
        contracts: candidateIds.map((cId) => ({
            address: CONTRACT_ADDRESS,
            abi: VOTING_ABI,
            functionName: 'candidates',
            args: [electionId, cId],
        })),
    });

    // 4. Voting Action
    const { writeContract, isPending: isVoting } = useWriteContract();

    const handleVote = async (candidateId: number) => {
        if (!address) {
            toast.error('Please connect your wallet first');
            return;
        }

        writeContract({
            address: CONTRACT_ADDRESS,
            abi: VOTING_ABI,
            functionName: 'castVote',
            args: [electionId, BigInt(candidateId)],
        }, {
            onSuccess: () => {
                toast.success('Vote transaction submitted!');
            },
            onError: (error: any) => {
                toast.error(error.shortMessage || 'Voting failed');
            }
        });
    };

    // Watch for VoteCast event to refresh UI
    useWatchContractEvents({
        address: CONTRACT_ADDRESS,
        abi: VOTING_ABI,
        eventName: 'VoteCast',
        onLogs() {
            refetchCandidates();
            refetchElection();
            refetchEligibility();
        },
    });

    if (!election) return (
        <div className="flex justify-center py-20">
            <div className="animate-pulse text-slate-500">Loading election details...</div>
        </div>
    );

    const [eId, title, description, startTime, endTime, isActive, candidateCount] = election as any;
    const timeLeft = Number(endTime) - Math.floor(Date.now() / 1000);
    const isExpired = timeLeft <= 0;

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            {/* Header */}
            <div className="glass rounded-3xl p-8 md:p-12 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] -z-10" />

                <div className="flex flex-wrap items-center gap-4">
                    <h1 className="text-4xl font-bold text-white">{title}</h1>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${!isExpired && isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        {!isExpired && isActive ? 'Status: Active' : 'Status: Ended'}
                    </span>
                </div>

                <p className="text-slate-400 text-lg leading-relaxed">
                    {description}
                </p>

                <div className="flex flex-wrap gap-8 pt-4">
                    <div className="flex items-center gap-3 text-slate-300">
                        <Clock className="text-blue-500" />
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">End Time</p>
                            <p className="font-semibold">{new Date(Number(endTime) * 1000).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                        <Info className="text-blue-500" />
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Verification</p>
                            <p className="font-semibold">Publicly Verifiable On-Chain</p>
                        </div>
                    </div>
                </div>

                {!isEligible && address && (
                    <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 p-4 rounded-2xl text-blue-400">
                        <CheckCircle2 size={20} />
                        <p className="font-medium text-sm">You have already cast your vote in this election.</p>
                    </div>
                )}
            </div>

            {/* Candidates List */}
            <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white pl-2 border-l-4 border-blue-600">Candidates</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidatesData?.map((result: any, index) => {
                        if (!result.result) return null;
                        const [cId, name, voteCount, ipfsImageHash] = result.result;
                        return (
                            <CandidateCard
                                key={index}
                                id={Number(cId)}
                                name={name}
                                voteCount={Number(voteCount)}
                                ipfsImageHash={ipfsImageHash}
                                onVote={handleVote}
                                isVoting={isVoting}
                                disabled={!isActive || isExpired}
                                hasVoted={!isEligible}
                                votedForThis={false} // Would need voter struct to confirm
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
