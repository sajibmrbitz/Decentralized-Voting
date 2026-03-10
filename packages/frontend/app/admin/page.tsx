'use client';

import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { VOTING_ABI } from '@/lib/contractABI';
import { toast } from 'react-hot-toast';
import { PlusCircle, ImagePlus, Send, LayoutDashboard } from 'lucide-react';
import { useAuthStore } from '@/hooks/useAuthStore';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

export default function AdminPage() {
    const { address } = useAccount();
    const { token } = useAuthStore();
    const { writeContract, isPending } = useWriteContract();

    const [electionForm, setElectionForm] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
    });

    const [candidateForm, setCandidateForm] = useState({
        electionId: '',
        name: '',
        ipfsHash: '',
    });

    const handleCreateElection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address) return toast.error('Connect wallet');

        const start = Math.floor(new Date(electionForm.startTime).getTime() / 1000);
        const end = Math.floor(new Date(electionForm.endTime).getTime() / 1000);

        writeContract({
            address: CONTRACT_ADDRESS,
            abi: VOTING_ABI,
            functionName: 'createElection',
            args: [electionForm.title, electionForm.description, BigInt(start), BigInt(end), 'metadata_hash'],
        }, {
            onSuccess: () => toast.success('Election created on-chain!'),
            onError: (err: any) => toast.error(err.shortMessage || 'Failed to create'),
        });
    };

    const handleAddCandidate = async (e: React.FormEvent) => {
        e.preventDefault();
        writeContract({
            address: CONTRACT_ADDRESS,
            abi: VOTING_ABI,
            functionName: 'addCandidate',
            args: [BigInt(candidateForm.electionId), candidateForm.name, candidateForm.ipfsHash],
        }, {
            onSuccess: () => toast.success('Candidate added!'),
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12">
            <div className="flex items-center gap-4">
                <LayoutDashboard size={32} className="text-blue-500" />
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Create Election */}
                <div className="glass rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3 text-xl font-bold">
                        <PlusCircle className="text-blue-500" />
                        <h3>Create New Election</h3>
                    </div>

                    <form onSubmit={handleCreateElection} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Election Title</label>
                            <input
                                type="text"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                                value={electionForm.title}
                                onChange={(e) => setElectionForm({ ...electionForm, title: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Description</label>
                            <textarea
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none h-24"
                                value={electionForm.description}
                                onChange={(e) => setElectionForm({ ...electionForm, description: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Start Date</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-xs"
                                    onChange={(e) => setElectionForm({ ...electionForm, startTime: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">End Date</label>
                                <input
                                    type="datetime-local"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-xs"
                                    onChange={(e) => setElectionForm({ ...electionForm, endTime: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                            disabled={isPending}
                        >
                            <Send size={18} />
                            {isPending ? 'Submitting...' : 'Create Election'}
                        </button>
                    </form>
                </div>

                {/* Add Candidate */}
                <div className="glass rounded-3xl p-8 space-y-6 h-fit">
                    <div className="flex items-center gap-3 text-xl font-bold">
                        <ImagePlus className="text-blue-500" />
                        <h3>Add Candidate</h3>
                    </div>

                    <form onSubmit={handleAddCandidate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Election ID (On-Chain)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                                value={candidateForm.electionId}
                                onChange={(e) => setCandidateForm({ ...candidateForm, electionId: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Candidate Name</label>
                            <input
                                type="text"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                                value={candidateForm.name}
                                onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">IPFS Image Hash</label>
                            <input
                                type="text"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 focus:border-blue-500 outline-none"
                                value={candidateForm.ipfsHash}
                                onChange={(e) => setCandidateForm({ ...candidateForm, ipfsHash: e.target.value })}
                                required
                                placeholder="Qm..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-slate-100 hover:bg-white text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2"
                            disabled={isPending}
                        >
                            <PlusCircle size={18} />
                            {isPending ? 'Processing...' : 'Add Candidate'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
