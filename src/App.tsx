import React, { useState, useEffect, useCallback } from 'react';
import { Book, Globe, History, Microscope, Palette, Users, ChevronDown } from 'lucide-react';

interface WikiArticle {
  title: string;
  extract: string;
  thumbnail?: string;
  fullurl: string;
}

function Section({ article }: { article: WikiArticle }) {
  return (
    <div className="h-screen w-full snap-section relative overflow-hidden">
      <img
        src={article.thumbnail || "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1920&q=80"}
        alt={article.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 gradient-overlay">
        <div className="h-full flex flex-col justify-between p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Globe className="w-8 h-8 text-white mr-3" />
              <h1 className="text-2xl font-bold text-white">WikiScroll</h1>
            </div>
            {/* 
            <input
              type="search"
              placeholder="Search Wikipedia..."
              className="w-64 px-4 py-2 rounded-full bg-black/30 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            */}
          </div>

          {/* Content */}
          <div className="max-w-2xl mx-auto text-center flex flex-col justify-center h-[calc(100vh-200px)]">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-lg rounded-full">
                <Book className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">{article.title}</h2>
            <div className="flex-1 overflow-y-auto mb-6 px-4">
              <p className="text-lg text-white/90 leading-relaxed backdrop-blur-sm bg-black/30 p-6 rounded-xl">
                {article.extract}
              </p>
            </div>
            <div className="mt-auto">
              <a 
                href={article.fullurl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-white/10 backdrop-blur-lg text-white rounded-full hover:bg-white/20 transition-colors inline-block"
              >
                Read full article
              </a>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center">
            <ChevronDown className="w-8 h-8 text-white animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [articles, setArticles] = useState<WikiArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchArticles = useCallback(async () => {
    try {
      const apiUrl = 'https://en.wikipedia.org/w/api.php';
      const params = {
        origin: '*',
        action: 'query',
        format: 'json',
        generator: 'random',
        grnnamespace: '0',
        grnlimit: '20',
        prop: 'extracts|pageimages|info',
        exintro: '1',
        explaintext: '1',
        inprop: 'url',
        piprop: 'original'
      };

      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await fetch(`${apiUrl}?${queryString}`);
      const data = await response.json();
      
      if (!data.query || !data.query.pages) {
        throw new Error('Invalid API response');
      }

      const pages = Object.values(data.query.pages);
      const formattedArticles = pages.map((page: any) => ({
        title: page.title,
        extract: page.extract,
        thumbnail: page.original?.source || null,
        fullurl: page.fullurl
      }));

      return formattedArticles;
    } catch (error) {
      console.error('Error fetching Wikipedia articles:', error);
      return [];
    }
  }, []);

  const loadMoreArticles = useCallback(async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const newArticles = await fetchArticles();
    setArticles(prev => [...prev, ...newArticles]);
    setLoadingMore(false);
  }, [fetchArticles, loadingMore]);

  useEffect(() => {
    async function initialLoad() {
      const initialArticles = await fetchArticles();
      setArticles(initialArticles);
      setLoading(false);
    }
    initialLoad();
  }, [fetchArticles]);

  useEffect(() => {
    function handleScroll() {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      if (scrollPosition + (windowHeight * 2) >= documentHeight) {
        loadMoreArticles();
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreArticles]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black">
        <div className="text-white text-2xl">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="bg-black">
      {/* Hero Section */}
      <div className="h-screen w-full snap-section relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1920&q=80"
          alt="Library"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-overlay">
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <Globe className="w-24 h-24 text-white mb-8" />
            <h1 className="text-6xl font-bold text-white mb-4">
              WikiScroll
            </h1>
            <p className="text-2xl text-white/90 mb-8">
            Fuel Your Curiosity
            </p>
            <p className="text-xl text-white/80">
              Scroll down to explore random Wikipedia articles
            </p>
            <ChevronDown className="w-8 h-8 text-white mt-8 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Content Sections */}
      {articles.map((article, index) => (
        <Section key={`${article.title}-${index}`} article={article} />
      ))}

      {/* Loading indicator */}
      {loadingMore && (
        <div className="h-screen w-full flex items-center justify-center bg-black">
          <div className="text-white text-xl">Loading more articles...</div>
        </div>
      )}
    </div>
  );
}

export default App;
