'use client';
import { type ElementRef, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { LuX } from 'react-icons/lu';
import { useDashboard } from '@/providers/DashboardProvider';
import { PairResoBox } from '@/app/(user)/dashboard/PairResoBox';

interface PageProps {
  params: Promise<{
    pair: string;
  }>;
}

export default function ModalPairPage({ params }: PageProps) {
  const router = useRouter();
  const dialogRef = useRef<ElementRef<'dialog'>>(null);
  const { pairData } = useDashboard();
  const resolvedParams = use(params);
  const pair = resolvedParams.pair;

  useEffect(() => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, []);

  function onDismiss() {
    router.back();
  }

  const data = pairData[pair];
  const hasData = data?.boxes?.length > 0;

  return (
    <dialog
      ref={dialogRef}
      onClose={onDismiss}
      className="fixed inset-0 z-[100] h-full w-full bg-transparent p-0"
    >
      <div className="animate-in fade-in slide-in-from-bottom-8 fixed inset-x-0 bottom-24 z-[100] mx-auto w-[90%] max-w-2xl duration-300">
        <div className="overflow-hidden rounded-2xl border border-[#222] bg-black shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#222] px-4 py-3">
            <div className="flex items-baseline gap-3">
              <h3 className="font-outfit text-lg font-semibold">
                {pair.replace('_', '/')}
              </h3>
            </div>
            <button
              onClick={onDismiss}
              className="rounded-full bg-white/5 p-2 hover:bg-white/10"
            >
              <LuX className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            {hasData ? (
              <PairResoBox
                pair={pair}
                boxSlice={data.boxes[0]}
                currentOHLC={data.currentOHLC}
              />
            ) : (
              <div className="font-kodemono text-sm text-gray-400">
                No data available for this pair
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onDismiss}
      />
    </dialog>
  );
}
