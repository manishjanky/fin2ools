import { useState, useEffect } from 'react';

const ITEMS_PER_PAGE = 12;

export default function Pagination({ items, pageChange }: { items: any[]; pageChange: () => void }) {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    useEffect(() => {
        pageChange();
    }, [currentPage]);

    return (
        <>
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-slate-800 text-purple-200 hover:bg-slate-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition"
                    >
                        Previous
                    </button>

                    <div className="flex gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(
                                (page) =>
                                    page === 1 ||
                                    page === totalPages ||
                                    (page >= currentPage - 1 && page <= currentPage + 1)
                            )
                            .map((page, index, array) => (
                                <div key={page}>
                                    {index > 0 && array[index - 1] !== page - 1 && (
                                        <span className="px-2 text-purple-300">...</span>
                                    )}
                                    <button
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 rounded-lg transition ${currentPage === page
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-slate-800 text-purple-200 hover:bg-slate-700'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                </div>
                            ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-slate-800 text-purple-200 hover:bg-slate-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Results Summary */}
            <div className="text-center mt-6 text-purple-200 text-sm">
                <p>
                    Showing {startIndex + 1} to{' '}
                    {Math.min(startIndex + ITEMS_PER_PAGE, items.length)} of{' '}
                    {items.length} mutual funds
                </p>
            </div>
        </>
    );
}