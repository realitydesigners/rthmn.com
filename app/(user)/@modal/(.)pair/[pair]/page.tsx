'use client';
import { BoxSlice, OHLC } from '@/types/types';
import { ResoBox } from '@/components/ResoBox';
import { useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { LuX } from 'react-icons/lu';
import { useDashboard } from '@/providers/DashboardProvider';

interface PageProps {
  params: Promise<{
    pair: string;
  }>;
}

export default function ModalPairPage({ params }: PageProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
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
      <div className="animate-in fade-in slide-in-from-top-4 fixed inset-x-0 top-4 z-[100] mx-auto w-full max-w-2xl px-4 duration-300">
        <div className="overflow-hidden rounded-2xl border border-[#222] bg-black shadow-2xl">
          <div className="h-[calc(100vh-190px)] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222] px-4 py-3">
              <div className="flex w-full items-center justify-center gap-3">
                <h3 className="font-outfit text-2xl font-bold tracking-wider text-white">
                  {pair.replace('_', '/')}
                </h3>
                {data?.currentOHLC?.close && (
                  <span className="font-kodemono text-sm font-medium text-gray-200">
                    {data.currentOHLC.close.toFixed(
                      pair.includes('JPY') ? 3 : 5
                    )}
                  </span>
                )}
              </div>
            </div>
            {hasData ? (
              <div className="flex h-full flex-col">
                <div className="flex-1 p-4">
                  <PairResoBox
                    pair={pair}
                    boxSlice={data.boxes[0]}
                    currentOHLC={data.currentOHLC}
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center text-white">No data available</div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="fixed inset-0" onClick={onDismiss} />
    </dialog>
  );
}

interface PairResoBoxProps {
  pair: string;
  boxSlice: BoxSlice;
  currentOHLC: OHLC;
}

export const PairResoBox = ({
  pair,
  boxSlice,
  currentOHLC
}: PairResoBoxProps) => {
  const closePrice = currentOHLC?.close || 'N/A';

  return (
    <div className="group m-auto flex w-full flex-col items-center justify-center gap-4 text-center text-white shadow-md transition-all duration-500 ease-in-out">
      <div className="w-full transition-transform duration-300 ease-in-out">
        <ResoBox
          key={`${pair}-${boxSlice.timestamp}`}
          slice={boxSlice}
          className="h-full w-full"
        />
      </div>
    </div>
  );
};
