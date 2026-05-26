import React, { useState } from 'react';
import { Link } from '@routes/router';
import { motion } from 'motion/react';
import { ArrowUpRight, Clock, Tag, Search } from 'lucide-react';
import { MOCK_NEWS, NEWS_CATEGORIES } from '@/data/news';

export const NewsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [search, setSearch] = useState('');

  const featured = MOCK_NEWS[0];
  const rest = MOCK_NEWS.slice(1);

  const filtered = (activeCategory === 'Tất cả' ? rest : rest.filter(n => n.category === activeCategory))
    .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-24 pb-24">



      {/* Featured Article */}
      <div className="max-w-[1400px] mx-auto px-6 mb-20">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <Link to={`/news/${featured.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-2xl aspect-[16/7] md:aspect-[16/6] bg-neutral-100 dark:bg-neutral-900">
              <img
                src={featured.image}
                alt={featured.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-white text-black text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full">
                    {featured.category}
                  </span>
                  <span className="text-white/60 text-sm flex items-center gap-1.5">
                    <Clock size={13} /> {featured.readTime}
                  </span>
                </div>
                <h2 className="text-2xl md:text-4xl font-black text-white leading-tight max-w-3xl mb-3 group-hover:opacity-80 transition-opacity">
                  {featured.title}
                </h2>
                <p className="text-white/60 text-sm md:text-base max-w-2xl hidden md:block">{featured.excerpt}</p>
                <div className="mt-5 flex items-center gap-2 text-white/50 text-sm">
                  <span>{featured.author}</span>
                  <span>·</span>
                  <span>{featured.date}</span>
                </div>
              </div>
              <div className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                <ArrowUpRight size={18} className="text-white" />
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="max-w-[1400px] mx-auto px-6 mb-10">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {NEWS_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeCategory === cat
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Tìm bài viết..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-full text-sm outline-none text-black dark:text-white placeholder:text-neutral-400 w-48 focus:w-64 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="max-w-[1400px] mx-auto px-6">
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-neutral-400">Không tìm thấy bài viết nào.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((news, i) => (
              <motion.div
                key={news.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link to={`/news/${news.slug}`} className="group block h-full">
                  <div className="overflow-hidden rounded-xl aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 mb-5">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        <Tag size={10} /> {news.category}
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-700">·</span>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Clock size={11} /> {news.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-black dark:text-white leading-snug mb-2 group-hover:opacity-70 transition-opacity">
                      {news.title}
                    </h3>
                    <p className="text-neutral-500 text-sm line-clamp-2 leading-relaxed mb-4">{news.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-400">{news.author} · {news.date}</span>
                      <ArrowUpRight size={16} className="text-neutral-300 dark:text-neutral-700 group-hover:text-black dark:group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-200" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
