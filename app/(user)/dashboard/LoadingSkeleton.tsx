'use client';

export const NoInstruments = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center px-8 py-12 text-center">
      <p className="text-lg text-gray-400">No instruments selected</p>
      <p className="mt-2 text-sm text-gray-600">
        Use the search bar above to add trading pairs
      </p>
    </div>
  );
};
