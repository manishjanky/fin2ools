import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useMutualFundsStore } from '../store/mutualFundsStore';
import MutualFundCard from './MutualFundCard';

const ITEMS_PER_PAGE = 12;

export default function MutualFundList() {
  const navigate = useNavigate();
  const {
    filteredSchemes,
    currentPage,
    searchQuery,
    isLoading,
    error,
    hasLoaded,
    loadSchemes,
    performSearch,
    setCurrentPage,
  } = useMutualFundsStore();

  // Load schemes on component mount
  useEffect(() => {
    if (!hasLoaded) {
      loadSchemes();
    }
  }, [hasLoaded, loadSchemes]);

  const handleSearch = (query: string) => {
    performSearch(query);
  };

  const handleCardClick = (schemeCode: number) => {
    navigate(`/mutual-funds/scheme/${schemeCode}`);
  };

  // Pagination
  const totalPages = Math.ceil(filteredSchemes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSchemes = filteredSchemes.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--color-primary-main)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search mutual funds by name (e.g., HDFC, ICICI)..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full rounded-lg pl-12 pr-4 py-3 transition border focus:outline-none"
            style={{
              backgroundColor: "var(--color-bg-secondary)",
              borderColor: "var(--color-border-main)",
              color: "var(--color-text-primary)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-primary-main)';
              e.currentTarget.style.boxShadow = `0 0 0 3px ${'var(--color-primary-main)'}20`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--color-border-main)";
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div
          className="rounded-lg p-4 mb-8"
          style={{
            backgroundColor: `${"var(--color-error)"}20`,
            borderColor: "var(--color-error)",
            color: "var(--color-error)",
            border: `1px solid ${"var(--color-error)"}`,
          }}
        >
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: 'var(--color-primary-main)' }}
            />
          </div>
          <p className="mt-4" style={{ color: "var(--color-text-secondary)" }}>
            Loading mutual funds...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredSchemes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
            {searchQuery ? 'No mutual funds found matching your search.' : 'No mutual funds available.'}
          </p>
        </div>
      )}

      {/* Schemes Grid */}
      {!isLoading && paginatedSchemes.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-6 mb-8">
            {paginatedSchemes.map((scheme) => (
              <div
                key={scheme.schemeCode}
                onClick={() => handleCardClick(scheme.schemeCode)}
                className="cursor-pointer"
              >
                <MutualFundCard scheme={scheme} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition"
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
                        className={`px-4 py-2 rounded-lg transition ${
                          currentPage === page
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
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition"
              >
                Next
              </button>
            </div>
          )}

          {/* Results Summary */}
          <div className="text-center mt-6 text-purple-200 text-sm">
            <p>
              Showing {startIndex + 1} to{' '}
              {Math.min(startIndex + ITEMS_PER_PAGE, filteredSchemes.length)} of{' '}
              {filteredSchemes.length} mutual funds
            </p>
          </div>
        </>
      )}
    </div>
  );
}
