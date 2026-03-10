'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { VOTING_ABI } from '@/lib/contractABI';
import ElectionCard from '@/components/ElectionCard';
import { Vote, Shield, BarChart3 } from 'lucide-react';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function Home() {
  const { data: electionCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'electionCount',
  });

  const electionIds = Array.from({ length: Number(electionCount || 0) }, (_, i) => BigInt(i + 1));

  const { data: electionsData } = useReadContracts({
    contracts: electionIds.map((id) => ({
      address: CONTRACT_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'elections',
      args: [id],
    })),
  });

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-10">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          The Future of <span className="gradient-text">Public Voting</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
          Tamper-proof, immutable, and publicly verifiable elections powered by Ethereum.
          Your voice, recorded on-chain forever.
        </p>

        <div className="flex flex-wrap justify-center gap-8 pt-10">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-500" />
            <span className="text-slate-300 font-medium">Secure</span>
          </div>
          <div className="flex items-center gap-3">
            <Vote className="text-blue-500" />
            <span className="text-slate-300 font-medium">Transparent</span>
          </div>
          <div className="flex items-center gap-3">
            <BarChart3 className="text-blue-500" />
            <span className="text-slate-300 font-medium">Verifiable</span>
          </div>
        </div>
      </section>

      {/* Elections Grid */}
      <section className="space-y-8">
        <div className="flex justify-between items-end">
          <h2 className="text-3xl font-bold text-slate-100">Active Elections</h2>
          <p className="text-slate-400 text-sm">{electionCount?.toString() || 0} Total Elections</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {electionsData?.map((result: any, index) => {
            if (!result.result) return null;
            const [id, title, description, startTime, endTime, isActive, candidateCount] = result.result;
            return (
              <ElectionCard
                key={index}
                id={Number(id)}
                title={title}
                description={description}
                endTime={Number(endTime)}
                candidateCount={Number(candidateCount)}
                totalVotes={0}
              />
            );
          })}

          {(Number(electionCount || 0) === 0) && (
            <div className="col-span-full py-20 text-center glass rounded-3xl">
              <p className="text-slate-400">No active elections found. Check back later!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
