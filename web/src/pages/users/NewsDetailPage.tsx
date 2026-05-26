import React from 'react';
import { Link, useParams } from '@routes/router';
import { motion } from 'motion/react';
import { ArrowLeft, Clock, Tag, ArrowUpRight } from 'lucide-react';
import { MOCK_NEWS as ALL_NEWS } from '@/data/news';

export const NewsDetailPage: React.FC = () => {
  const { slug } = useParams('/news/:slug');
  const article = ALL_NEWS.find(n => n.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen pt-40 text-center">
        <p className="text-2xl font-bold text-black dark:text-white mb-4">Bài viết không tồn tại</p>
        <Link to="/news" className="text-neutral-500 hover:text-black dark:hover:text-white underline">
          Quay lại Tin tức
        </Link>
      </div>
    );
  }

  const related = ALL_NEWS.filter(n => article.relatedSlugs?.includes(n.slug));

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] pt-24 pb-24">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 xl:gap-24 items-start">
          
          <div className="flex-1 w-full max-w-[860px] mx-auto lg:mx-0">

        {/* Back */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Link to="/news" className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-neutral-400 hover:text-black dark:hover:text-white mb-12 transition-colors uppercase">
            <ArrowLeft size={15} /> Tin tức
          </Link>
        </motion.div>

        {/* Meta */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center gap-3 mb-6">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              <Tag size={10} /> {article.category}
            </span>
            <span className="text-neutral-200 dark:text-neutral-800">·</span>
            <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Clock size={11} /> {article.readTime}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-black dark:text-white leading-[1.1] mb-8">
            {article.title}
          </h1>

          {/* Author bar */}
          <div className="flex items-center gap-4 pb-8 mb-10 border-b border-neutral-100 dark:border-neutral-900">
            <img src={article.authorAvatar} alt={article.author} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <div className="text-sm font-bold text-black dark:text-white">{article.author}</div>
              <div className="text-xs text-neutral-400">{article.date}</div>
            </div>
          </div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12 rounded-2xl overflow-hidden aspect-[16/9]"
        >
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose-custom"
        >
          {article.content.map((block, i) => {
            if (block.type === 'lead') {
              return (
                <p key={i} className="text-xl md:text-2xl font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed mb-10 border-l-4 border-black dark:border-white pl-6">
                  {block.text}
                </p>
              );
            }
            if (block.type === 'h2') {
              return (
                <h2 key={i} className="text-2xl md:text-3xl font-black tracking-tight text-black dark:text-white mt-12 mb-5">
                  {block.text}
                </h2>
              );
            }
            if (block.type === 'p') {
              return (
                <p key={i} className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed mb-6 font-medium">
                  {block.text}
                </p>
              );
            }
            if (block.type === 'image') {
              return (
                <figure key={i} className="my-10">
                  <div className="rounded-xl overflow-hidden aspect-[16/9]">
                    <img src={block.src} alt={block.caption} className="w-full h-full object-cover" />
                  </div>
                  {block.caption && (
                    <figcaption className="text-center text-xs text-neutral-400 mt-3">{block.caption}</figcaption>
                  )}
                </figure>
              );
            }
            return null;
          })}
        </motion.div>

        {/* Tags / Share */}
        <div className="mt-16 pt-8 border-t border-neutral-100 dark:border-neutral-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">Chủ đề:</span>
            <span className="text-xs font-bold bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 px-3 py-1.5 rounded-full">
              {article.category}
            </span>
          </div>
        </div>
          </div>

          {/* Related Articles */}
          {related.length > 0 && (
            <div className="w-full lg:w-[320px] xl:w-[360px] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-100 dark:border-neutral-900 pt-12 lg:pt-0 lg:pl-12 xl:pl-16">
              <div className="sticky top-28">
                <h3 className="text-lg font-black tracking-tight text-black dark:text-white mb-6 uppercase">Bài viết liên quan</h3>
                <div className="flex flex-col gap-8">
                  {related.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                      <Link to={`/news/${n.slug}`} className="group flex flex-col">
                        <div className="overflow-hidden rounded-xl aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 mb-3">
                          <img src={n.image} alt={n.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{n.category}</span>
                          <h4 className="text-sm md:text-base font-bold text-black dark:text-white mt-1 mb-2 group-hover:opacity-70 transition-opacity leading-snug">
                            {n.title}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] text-neutral-400">{n.date}</span>
                            <ArrowUpRight size={14} className="text-neutral-300 dark:text-neutral-700 group-hover:text-black dark:group-hover:text-white transition-colors" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
