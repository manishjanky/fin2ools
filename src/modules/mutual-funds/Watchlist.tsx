import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import SearchableSelect from '../../components/common/SearchableSelect';
import { useWatchlistStore } from './store/watchlistStore';
import { useMutualFundsStore } from './store/mutualFundsStore';
import type { MutualFundScheme } from './types/mutual-funds';
import MutualFundCard from './components/MutualFundCard';
import Loader from '../../components/common/Loader';

export default function Watchlist() {
  const navigate = useNavigate();
  const { loadWatchlist, watchlist } = useWatchlistStore();
  const { loadSchemes, getOrFetchSchemeDetails } = useMutualFundsStore();
  const [watchlistSchemes, setWatchlistSchemes] = useState<MutualFundScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFundHouse, setSelectedFundHouse] = useState<string>('all');

  useEffect(() => {
    loadWatchlist();
    loadSchemes();
  }, [loadWatchlist, loadSchemes]);

  useEffect(() => {
    const loadWatchlistDetails = async () => {
      if (watchlist.length === 0) {
        setWatchlistSchemes([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const schemeDetails = await Promise.all(
          watchlist.map(async (schemeCode) => {
            const scheme = await getOrFetchSchemeDetails(schemeCode);
            return scheme || {
              schemeCode,
              schemeName: 'Unknown Scheme',
            };
          })
        );
        setWatchlistSchemes(schemeDetails);
      } catch (error) {
        console.error('Error loading watchlist details:', error);
        setWatchlistSchemes([]);
      } finally {
        setLoading(false);
      }
    };

    loadWatchlistDetails();
  }, [watchlist, getOrFetchSchemeDetails]);

  // Get unique categories and fund houses
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    watchlistSchemes.forEach(scheme => {
      if (scheme.schemeCategory) {
        uniqueCategories.add(scheme.schemeCategory);
      }
    });
    return Array.from(uniqueCategories).sort();
  }, [watchlistSchemes]);

  const fundHouses = useMemo(() => {
    const uniqueFundHouses = new Set<string>();
    watchlistSchemes.forEach(scheme => {
      if (scheme.fundHouse) {
        uniqueFundHouses.add(scheme.fundHouse);
      }
    });
    return Array.from(uniqueFundHouses).sort();
  }, [watchlistSchemes]);

  const filteredSchemes = useMemo(() => {
    let filtered = watchlistSchemes;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(scheme => scheme.schemeCategory === selectedCategory);
    }
    
    if (selectedFundHouse !== 'all') {
      filtered = filtered.filter(scheme => scheme.fundHouse === selectedFundHouse);
    }
    
    return filtered;
  }, [watchlistSchemes, selectedCategory, selectedFundHouse]);

  const handleCardClick = (schemeCode: string | number) => {
    navigate(`/mutual-funds/scheme/${schemeCode}`);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="backdrop-blur-sm py-4 bg-bg-primary">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 gap-4 items-center mb-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-text-primary">
              My{' '}
              <span className="text-secondary-dark">
                Watchlist({filteredSchemes.length})
              </span>
            </h1>
            {filteredSchemes.length > 0 && (
              <p className="text-md mt-2 text-text-secondary">
                {filteredSchemes.length} {filteredSchemes.length === 1 ? 'fund' : 'funds'}
                {selectedCategory !== 'all' || selectedFundHouse !== 'all' ? (
                  <>
                    {' - '}
                    {selectedCategory !== 'all' && selectedCategory}
                    {selectedCategory !== 'all' && selectedFundHouse !== 'all' && ' | '}
                    {selectedFundHouse !== 'all' && selectedFundHouse}
                  </>
                ) : ' in your watchlist'}
              </p>
            )}
          </div>

          <button
            onClick={() => navigate('/mutual-funds/explore-funds')}
            className="px-6 py-2 rounded-lg font-medium transition w-auto justify-self-end bg-bg-secondary text-text-secondary border border-border-main hover:bg-bg-tertiary"
          >
            Explore Funds
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4">
        {loading ? (
          <Loader message="Loading your watchlist..." fullHeight={true} />
        ) : watchlistSchemes.length === 0 ? (
          <div className="rounded-lg p-12 text-center border bg-bg-primary border-border-main">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
            <p className="text-lg mb-6 text-text-secondary">
              Your watchlist is empty. Add funds to track their performance.
            </p>
            <button
              onClick={() => navigate('/mutual-funds/explore-funds')}
              className="px-6 py-3 rounded-lg transition font-medium bg-primary-main text-text-inverse hover:bg-primary-dark"
            >
              Explore Mutual Funds
            </button>
          </div>
        ) : (
          <>
            {/* Filters */}
            {(categories.length > 0 || fundHouses.length > 0) && (
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Filter */}
                {categories.length > 0 && (
                  <SearchableSelect
                    label="Filter by Category"
                    options={[
                      { value: 'all', label: 'All Categories', count: watchlistSchemes.length },
                      ...categories.map(category => ({
                        value: category,
                        label: category,
                        count: watchlistSchemes.filter(s => s.schemeCategory === category).length
                      }))
                    ]}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    placeholder="Select a category..."
                  />
                )}
                
                {/* Fund House Filter */}
                {fundHouses.length > 0 && (
                  <SearchableSelect
                    label="Filter by Fund House"
                    options={[
                      { value: 'all', label: 'All Fund Houses', count: watchlistSchemes.length },
                      ...fundHouses.map(fundHouse => ({
                        value: fundHouse,
                        label: fundHouse,
                        count: watchlistSchemes.filter(s => s.fundHouse === fundHouse).length
                      }))
                    ]}
                    value={selectedFundHouse}
                    onChange={setSelectedFundHouse}
                    placeholder="Select a fund house..."
                  />
                )}
              </div>
            )}

            {filteredSchemes.length === 0 ? (
              <div className="rounded-lg p-12 text-center border bg-bg-primary border-border-main">
                <p className="text-lg text-text-secondary">
                  No funds found matching the selected filters.
                </p>
              </div>
            ) : (
              <section className="grid grid-cols-1 gap-6 mb-8">
                {filteredSchemes.map((scheme) => (
                  <div
                    key={scheme.schemeCode}
                    onClick={() => handleCardClick(scheme.schemeCode)}
                    className="cursor-pointer"
                  >
                    <MutualFundCard scheme={scheme} />
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
