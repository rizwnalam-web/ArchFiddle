import React, { useState, useMemo } from 'react';
import { ArchitectureData, ArchType } from '../types';

interface CostEstimatorModalProps {
  architecture: ArchitectureData;
  onClose: () => void;
}

export const CostEstimatorModal: React.FC<CostEstimatorModalProps> = ({ architecture, onClose }) => {
  // Instance / Compute Slider
  const [instanceCount, setInstanceCount] = useState<number>(() => {
    if (architecture.id === ArchType.Monolithic || architecture.id === ArchType.Layered) return 2;
    if (architecture.id === ArchType.Microservices || architecture.id === ArchType.ContainerNative) return 6;
    if (architecture.id === ArchType.Serverless) return 10; // Millions of requests
    return 4;
  });

  // DB Load & Size
  const [dbTier, setDbTier] = useState<'small' | 'medium' | 'large' | 'enterprise'>('medium');
  const [storageGb, setStorageGb] = useState<number>(250);

  // Egress Bandwidth
  const [bandwidthGb, setBandwidthGb] = useState<number>(500);

  // Cloud Provider multiplier
  const [cloudProvider, setCloudProvider] = useState<'aws' | 'gcp' | 'azure'>('aws');

  // Multi-region toggle
  const [isMultiRegion, setIsMultiRegion] = useState<boolean>(false);

  // Calculate realistic cost breakdowns based on architecture model
  const costBreakdown = useMemo(() => {
    let computeUnitCost = 48; // $48/mo per standard 2vCPU / 4GB instance
    let dbBaseCost = 120; // Medium DB default
    let storagePerGb = 0.10; // $0.10 per GB block storage
    let bandwidthPerGb = 0.08; // $0.08 per GB egress

    // Architecture-specific cost factor adjustments
    switch (architecture.id) {
      case ArchType.Serverless:
        // Serverless pay-per-use requests ($0.20 per 1M requests + execution time)
        computeUnitCost = 18; // scaled per million requests
        break;
      case ArchType.ContainerNative:
      case ArchType.GitOps:
        // K8s control plane ($73/mo EKS/GKE base fee) + node cost
        computeUnitCost = 65; 
        break;
      case ArchType.SpaceBased:
      case ArchType.Reactive:
        // High RAM in-memory grids cost more per compute node
        computeUnitCost = 110;
        break;
      case ArchType.EdgeComputing:
        // Edge worker requests are cheap at edge CDNs
        computeUnitCost = 12;
        break;
      case ArchType.Monolithic:
      case ArchType.Layered:
        computeUnitCost = 42;
        break;
      default:
        computeUnitCost = 50;
    }

    // DB Tier pricing
    switch (dbTier) {
      case 'small': dbBaseCost = 45; break;
      case 'medium': dbBaseCost = 140; break;
      case 'large': dbBaseCost = 380; break;
      case 'enterprise': dbBaseCost = 950; break;
    }

    // Provider multipliers
    let providerMultiplier = 1.0;
    if (cloudProvider === 'gcp') providerMultiplier = 0.95; // GCP sustained use discount
    if (cloudProvider === 'azure') providerMultiplier = 1.02;

    const computeCost = instanceCount * computeUnitCost * providerMultiplier;
    const databaseCost = dbBaseCost * providerMultiplier;
    const storageCost = storageGb * storagePerGb * providerMultiplier;
    const bandwidthCost = bandwidthGb * bandwidthPerGb * providerMultiplier;

    // Multi-Region replication doubles storage/DB base & adds +40% compute
    const regionMultiplier = isMultiRegion ? 1.8 : 1.0;

    const subtotal = (computeCost + databaseCost + storageCost + bandwidthCost) * regionMultiplier;
    const monitoringSupportCost = subtotal * 0.12; // 12% observability, logging & support
    const total = Math.round(subtotal + monitoringSupportCost);

    return {
      compute: Math.round(computeCost * (isMultiRegion ? 1.4 : 1.0)),
      database: Math.round(databaseCost * (isMultiRegion ? 1.8 : 1.0)),
      storage: Math.round(storageCost * (isMultiRegion ? 2.0 : 1.0)),
      bandwidth: Math.round(bandwidthCost),
      monitoringSupport: Math.round(monitoringSupportCost),
      total
    };
  }, [architecture.id, instanceCount, dbTier, storageGb, bandwidthGb, cloudProvider, isMultiRegion]);

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 rounded-xl text-white shadow-lg shadow-teal-900/30">
              <span className="text-xl">💰</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Cloud Infrastructure Cost Estimator</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {architecture.title}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Interactive monthly cloud burn rate calculator based on capacity and workloads
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-zinc-950/40">
          
          {/* Top Quick Settings Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
            {/* Cloud Provider Select */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                Cloud Provider
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['aws', 'gcp', 'azure'] as const).map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setCloudProvider(prov)}
                    className={`py-1.5 text-xs font-bold rounded-lg border uppercase transition-all ${
                      cloudProvider === prov
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {prov}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-Region Toggle */}
            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                High Availability
              </label>
              <button
                onClick={() => setIsMultiRegion(!isMultiRegion)}
                className={`w-full py-1.5 px-3 text-xs font-bold rounded-lg border transition-all flex items-center justify-between ${
                  isMultiRegion
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                    : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                }`}
              >
                <span>Multi-Region Active-Active</span>
                <span>{isMultiRegion ? 'ON (2x)' : 'OFF'}</span>
              </button>
            </div>

            {/* Architecture Class Badge */}
            <div className="sm:col-span-2 lg:col-span-1 bg-zinc-950/80 p-2.5 rounded-lg border border-zinc-800/80 flex flex-col justify-between">
              <span className="text-[10px] text-zinc-500 uppercase font-mono font-bold">Category Pricing Profile</span>
              <span className="text-xs font-bold text-indigo-300 truncate">{architecture.category}</span>
            </div>
          </div>

          {/* Interactive Sliders & Selectors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Compute Instance Capacity */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🖥️</span>
                  <span>
                    {architecture.id === ArchType.Serverless ? 'Requests / Execution Units' : 'Compute Instances / Pods'}
                  </span>
                </label>
                <span className="text-sm font-black font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
                  {architecture.id === ArchType.Serverless ? `${instanceCount * 2}M reqs/mo` : `${instanceCount} Nodes`}
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={architecture.id === ArchType.Serverless ? 50 : 32}
                value={instanceCount}
                onChange={(e) => setInstanceCount(Number(e.target.value))}
                className="w-full accent-emerald-500 bg-zinc-950 h-2 rounded-lg cursor-pointer"
              />

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                {architecture.id === ArchType.Serverless
                  ? 'FaaS invocations (AWS Lambda / Cloud Functions) + compute duration.'
                  : 'Scalable vCPU / RAM compute capacity (EC2 / GKE nodes / VMs).'}
              </p>
            </div>

            {/* Database Engine Tier */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🗄️</span>
                  <span>Database Instance Tier</span>
                </label>
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 capitalize">
                  {dbTier}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {(['small', 'medium', 'large', 'enterprise'] as const).map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setDbTier(tier)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg border capitalize transition-all ${
                      dbTier === tier
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Relational / NoSQL managed database replica set (RDS / Cloud Spanner / DynamoDB).
              </p>
            </div>

            {/* Storage Volume */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💾</span>
                  <span>Disk & Snapshot Storage</span>
                </label>
                <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-800">
                  {storageGb >= 1000 ? `${(storageGb / 1000).toFixed(1)} TB` : `${storageGb} GB`}
                </span>
              </div>

              <input
                type="range"
                min={20}
                max={5000}
                step={20}
                value={storageGb}
                onChange={(e) => setStorageGb(Number(e.target.value))}
                className="w-full accent-cyan-500 bg-zinc-950 h-2 rounded-lg cursor-pointer"
              />

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Persistent Block Storage (EBS / Persistent Disks) + automated backups & snapshots.
              </p>
            </div>

            {/* Network Egress Bandwidth */}
            <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📡</span>
                  <span>Monthly Data Egress</span>
                </label>
                <span className="text-xs font-mono font-bold text-purple-300 bg-purple-950/80 px-2.5 py-0.5 rounded border border-purple-800">
                  {bandwidthGb >= 1000 ? `${(bandwidthGb / 1000).toFixed(1)} TB` : `${bandwidthGb} GB`}
                </span>
              </div>

              <input
                type="range"
                min={50}
                max={10000}
                step={50}
                value={bandwidthGb}
                onChange={(e) => setBandwidthGb(Number(e.target.value))}
                className="w-full accent-purple-500 bg-zinc-950 h-2 rounded-lg cursor-pointer"
              />

              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Outbound internet traffic and CDN edge transfers.
              </p>
            </div>

          </div>

          {/* Real-time Monthly Cost Breakdown Result Box */}
          <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Estimated Monthly Infrastructure Burn
                </span>
                <span className="text-2xl font-mono text-zinc-400">Total:</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-4xl font-black font-mono text-emerald-400 tracking-tight">
                  ${costBreakdown.total.toLocaleString()}
                </span>
                <span className="text-xs text-zinc-400 block font-medium">/ month (USD)</span>
              </div>
            </div>

            {/* Line Item Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs pt-1">
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Compute</span>
                <span className="text-sm font-mono font-bold text-zinc-200">${costBreakdown.compute}</span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Database</span>
                <span className="text-sm font-mono font-bold text-amber-300">${costBreakdown.database}</span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Storage</span>
                <span className="text-sm font-mono font-bold text-cyan-300">${costBreakdown.storage}</span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Networking</span>
                <span className="text-sm font-mono font-bold text-purple-300">${costBreakdown.bandwidth}</span>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/80 col-span-2 sm:col-span-1">
                <span className="text-zinc-500 block text-[10px] uppercase font-bold">Observability & Support</span>
                <span className="text-sm font-mono font-bold text-zinc-300">${costBreakdown.monitoringSupport}</span>
              </div>
            </div>

            {/* Architecture-Specific Cost Optimization Tip */}
            <div className="bg-emerald-950/20 border border-emerald-800/40 p-3.5 rounded-xl text-xs text-emerald-300/90 leading-relaxed flex items-start gap-2.5">
              <span className="text-base shrink-0">💡</span>
              <div>
                <span className="font-bold text-emerald-200 block mb-0.5">
                  Cost Optimization Advice for {architecture.title}:
                </span>
                {architecture.id === ArchType.Serverless && (
                  <p>Leverage provisioned concurrency sparingly to avoid idle function charges. Use DynamoDB On-Demand for unpredictable spikes.</p>
                )}
                {architecture.id === ArchType.ContainerNative && (
                  <p>Utilize Kubernetes Karpenter or Cluster Autoscaler with Spot Instances for up to 70% savings on non-critical node pools.</p>
                )}
                {architecture.id === ArchType.Monolithic && (
                  <p>Single instances are cheap early on, but require vertical scaling (larger instances) which scales exponentially vs horizontal auto-scaling.</p>
                )}
                {architecture.id === ArchType.SpaceBased && (
                  <p>High RAM in-memory grids require careful garbage collection tuning and memory compression to avoid provisioning unnecessary node RAM.</p>
                )}
                {architecture.id !== ArchType.Serverless && architecture.id !== ArchType.ContainerNative && architecture.id !== ArchType.Monolithic && architecture.id !== ArchType.SpaceBased && (
                  <p>Combine Reserved Instances (1-3 yr commit) with auto-scaling policies to reduce base compute charges by up to 40%.</p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/90 flex justify-between items-center shrink-0 text-xs text-zinc-400">
          <span className="hidden sm:inline">
            Estimates based on standard US East cloud rates. Actual vendor pricing may vary.
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors ml-auto"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
