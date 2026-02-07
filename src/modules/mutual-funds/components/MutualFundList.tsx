import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMutualFundsStore } from '../store/mutualFundsStore';
import SearchableSelect from '../../../components/common/SearchableSelect';
import MutualFundCard from './MutualFundCard';

const ITEMS_PER_PAGE = 12;

export default function MutualFundList() {
  const navigate = useNavigate();
  const {
    filteredSchemes,
    currentPage,
    searchQuery,
    fundTypeFilter,
    isLoading,
    error,
    hasLoaded,
    loadSchemes,
    performSearch,
    setFundTypeFilter,
    setCurrentPage,
  } = useMutualFundsStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFundHouse, setSelectedFundHouse] = useState<string>('all');

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

  // Get unique categories and fund houses
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    filteredSchemes.forEach(scheme => {
      if (scheme.schemeCategory) {
        uniqueCategories.add(scheme.schemeCategory);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [filteredSchemes]);

  const fundHouses = useMemo(() => {
    const uniqueFundHouses = new Set<string>();
    filteredSchemes.forEach(scheme => {
      if (scheme.fundHouse) {
        uniqueFundHouses.add(scheme.fundHouse);
      }
    });
    return Array.from(uniqueFundHouses).sort();
  }, [filteredSchemes]);

  // Filter by category and fund house
  const categoryFilteredSchemes = useMemo(() => {
    let filtered = filteredSchemes;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(scheme => scheme.schemeCategory === selectedCategory);
    }

    if (selectedFundHouse !== 'all') {
      filtered = filtered.filter(scheme => scheme.fundHouse === selectedFundHouse);
    }

    return filtered;
  }, [filteredSchemes, selectedCategory, selectedFundHouse]);

  // Pagination
  const totalPages = Math.ceil(categoryFilteredSchemes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSchemes = categoryFilteredSchemes.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary-main"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
            className="w-full rounded-lg pl-12 pr-12 py-3 transition border focus:outline-none bg-bg-secondary border-border-main text-text-primary focus:border-primary-main focus:ring-2 focus:ring-primary-main/20"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary transition"
              aria-label="Clear search"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:gap-6 mb-8">
        {/* Filter Buttons */}
        <div className="col-span-3 lg:col-span-1">
          <label className="block text-sm font-medium text-text-secondary mb-2 w-full basis-full">
            Filter by type
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setFundTypeFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${fundTypeFilter === 'all'
                ? 'bg-primary-main text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary border border-border-main'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFundTypeFilter('direct')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${fundTypeFilter === 'direct'
                ? 'bg-primary-main text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary border border-border-main'
                }`}
            >
              Direct
            </button>
            <button
              onClick={() => setFundTypeFilter('regular')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${fundTypeFilter === 'regular'
                ? 'bg-primary-main text-white'
                : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary border border-border-main'
                }`}
            >
              Regular
            </button>
          </div>
        </div>

        {/* Filters */}
        {(categories.length > 0 || fundHouses.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 md:col-span-3 lg:col-span-2 gap-4 mt-4 lg:mt-0">
            {/* Category Filter */}
            {categories.length > 0 && (
              <SearchableSelect
                label="Filter by Category"
                options={[
                  { value: 'all', label: 'All Categories', count: filteredSchemes.length },
                  ...categories.map(category => ({
                    value: category,
                    label: category,
                    count: filteredSchemes.filter(s => s.schemeCategory === category).length
                  }))
                ]}
                value={selectedCategory}
                onChange={(value) => {
                  setSelectedCategory(value);
                  setCurrentPage(1);
                }}
                placeholder="Select a category..."
              />
            )}

            {/* Fund House Filter */}
            {fundHouses.length > 0 && (
              <SearchableSelect
                label="Filter by Fund House"
                options={[
                  { value: 'all', label: 'All Fund Houses', count: filteredSchemes.length },
                  ...fundHouses.map(fundHouse => ({
                    value: fundHouse,
                    label: fundHouse,
                    count: filteredSchemes.filter(s => s.fundHouse === fundHouse).length
                  }))
                ]}
                value={selectedFundHouse}
                onChange={(value) => {
                  setSelectedFundHouse(value);
                  setCurrentPage(1);
                }}
                placeholder="Select a fund house..."
              />
            )}
          </div>
        )}

      </div>

      {/* Error State */}
      {error && (
        <div
          className="rounded-lg p-4 mb-8 border bg-error/20 border-error text-error"
        >
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-main"
            />
          </div>
          <p className="mt-4 text-text-secondary">
            Loading mutual funds...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && categoryFilteredSchemes.length === 0 && filteredSchemes.length > 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-text-secondary">
            No mutual funds found matching the selected filters.
          </p>
        </div>
      )}
      {!isLoading && filteredSchemes.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-text-secondary">
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
                className="px-4 py-2 bg-slate-800 text-purple-200 hover:bg-slate-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition"
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
                className="px-4 py-2 bg-slate-800 text-purple-200 hover:bg-slate-700 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg transition"
              >
                Next
              </button>
            </div>
          )}

          {/* Results Summary */}
          <div className="text-center mt-6 text-purple-200 text-sm">
            <p>
              Showing {startIndex + 1} to{' '}
              {Math.min(startIndex + ITEMS_PER_PAGE, categoryFilteredSchemes.length)} of{' '}
              {categoryFilteredSchemes.length} mutual funds
              {(selectedCategory !== 'all' || selectedFundHouse !== 'all') && (
                <>
                  {' - '}
                  {selectedCategory !== 'all' && selectedCategory}
                  {selectedCategory !== 'all' && selectedFundHouse !== 'all' && ' | '}
                  {selectedFundHouse !== 'all' && selectedFundHouse}
                </>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
