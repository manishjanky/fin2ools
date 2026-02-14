import { useEffect, useMemo, useState } from 'react';
import { useMutualFundsStore } from '../store/mutualFundsStore';
import SearchableSelect from '../../../components/common/SearchableSelect';
import MutualFundCard from './MutualFundCard';
import Pagination from '../../../components/common/Pagination';
import Loader from '../../../components/common/Loader';

const ITEMS_PER_PAGE = 12;

export default function MutualFundList() {
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
        <Loader message='Loading schemes...' />
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
                className="cursor-pointer"
              >
                <MutualFundCard scheme={scheme} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination itemsPerPage={12} pageChange={(page) => setCurrentPage(page)} items={categoryFilteredSchemes} />
          )}
        </>
      )}
    </div>
  );
}
