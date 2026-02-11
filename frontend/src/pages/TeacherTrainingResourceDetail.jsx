import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Download, ExternalLink, Tag } from 'lucide-react';
import { pageContentsAPI } from '../services/api';
import { PAGE_CONTENT_SLUGS, getDefaultPageContent } from '../utils/pageContentDefaults';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

const resolveAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      if (['localhost', '127.0.0.1'].includes(parsed.hostname)) {
        return `${API_BASE_URL}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch (error) {
      return url;
    }
    return url;
  }
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${normalized}`;
};

const getVideoEmbedUrl = (url) => {
  if (!url) return '';
  const youTubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/i);
  if (youTubeMatch) {
    return `https://www.youtube.com/embed/${youTubeMatch[1]}`;
  }
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }
  return '';
};

const isVideoFile = (url) => /\.(mp4|webm|ogg)$/i.test(url || '');

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const formatInlineMarkdown = (value) =>
  String(value || '')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

const buildMarkdownBlocks = (content) => {
  const lines = String(content || '').split('\n');
  const blocks = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: 'list', items: listItems });
      listItems = [];
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      return;
    }
    if (trimmed.startsWith('- ')) {
      listItems.push(trimmed.replace(/^- /, ''));
      return;
    }
    flushList();

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'heading', level: 3, text: trimmed.replace(/^### /, '') });
      return;
    }
    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading', level: 2, text: trimmed.replace(/^## /, '') });
      return;
    }
    if (trimmed.startsWith('# ')) {
      blocks.push({ type: 'heading', level: 1, text: trimmed.replace(/^# /, '') });
      return;
    }

    blocks.push({ type: 'paragraph', text: trimmed });
  });

  flushList();
  return blocks;
};

const TeacherTrainingResourceDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [resourceContent, setResourceContent] = useState(() =>
    getDefaultPageContent(PAGE_CONTENT_SLUGS.TEACHER_RESOURCES)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    const fetchContent = async () => {
      try {
        const response = await pageContentsAPI.getBySlug(PAGE_CONTENT_SLUGS.TEACHER_RESOURCES);
        const payload = response?.data || {};
        const pageContent = payload.pageContent || payload.data?.pageContent;
        const content = pageContent?.content || getDefaultPageContent(PAGE_CONTENT_SLUGS.TEACHER_RESOURCES);
        if (isMounted) {
          setResourceContent(content);
        }
      } catch (error) {
        if (isMounted) {
          setResourceContent(getDefaultPageContent(PAGE_CONTENT_SLUGS.TEACHER_RESOURCES));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const { item, category } = useMemo(() => {
    const categories = Array.isArray(resourceContent?.categories) ? resourceContent.categories : [];
    for (const categoryItem of categories) {
      const items = Array.isArray(categoryItem.items) ? categoryItem.items : [];
      for (const entry of items) {
        const normalizedItem = typeof entry === 'string'
          ? { title: entry, slug: slugify(entry) }
          : entry;
        const candidateSlug = normalizedItem.slug || slugify(normalizedItem.title);
        if (candidateSlug === slug || String(normalizedItem.id) === slug) {
          return { item: normalizedItem, category: categoryItem };
        }
      }
    }
    return { item: null, category: null };
  }, [resourceContent, slug]);

  const tags = Array.isArray(item?.tags) ? item.tags : [];
  const downloadUrl = resolveAssetUrl(item?.downloadUrl);
  const externalUrl = resolveAssetUrl(item?.externalUrl);
  const thumbnailUrl = resolveAssetUrl(item?.thumbnailUrl);
  const durationValue = item?.duration;
  const hasDuration = durationValue !== undefined && durationValue !== null && durationValue !== '';
  const contentBlocks = Array.isArray(item?.contentBlocks) ? item.contentBlocks : [];
  const hasContentBlocks = contentBlocks.length > 0;
  const summaryText = item?.subtitle || item?.summary;

  const renderMarkdownContent = () => {
    if (!item?.content) {
      return <p className="text-sm text-gray-500">No additional content has been added yet.</p>;
    }

    const blocks = buildMarkdownBlocks(item.content);
    if (!blocks.length) {
      return <p className="text-sm text-gray-500">No additional content has been added yet.</p>;
    }

    return (
      <div className="space-y-4">
        {blocks.map((block, index) => {
          if (block.type === 'heading') {
            const HeadingTag = block.level === 1 ? 'h2' : block.level === 2 ? 'h3' : 'h4';
            const headingClass = block.level === 1
              ? 'text-2xl font-semibold text-gray-900'
              : block.level === 2
                ? 'text-xl font-semibold text-gray-900'
                : 'text-lg font-semibold text-gray-900';
            return (
              <HeadingTag
                key={`heading-${index}`}
                className={headingClass}
                dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.text) }}
              />
            );
          }
          if (block.type === 'list') {
            return (
              <ul key={`list-${index}`} className="list-disc list-inside space-y-1 text-gray-700">
                {block.items.map((listItem, listIndex) => (
                  <li
                    key={`list-${index}-item-${listIndex}`}
                    dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(listItem) }}
                  />
                ))}
              </ul>
            );
          }
          return (
            <p
              key={`paragraph-${index}`}
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(block.text) }}
            />
          );
        })}
      </div>
    );
  };

  const renderContentBlocks = () => (
    <div className="space-y-6">
      {contentBlocks.map((block, index) => {
        const key = block.id || `${block.type}-${index}`;
        if (block.type === 'heading') {
          return (
            <h2 key={key} className="text-2xl font-semibold text-gray-900">
              {block.text}
            </h2>
          );
        }
        if (block.type === 'subheading') {
          return (
            <h3 key={key} className="text-xl font-semibold text-gray-800">
              {block.text}
            </h3>
          );
        }
        if (block.type === 'paragraph') {
          return (
            <p key={key} className="text-gray-700 leading-relaxed">
              {block.text}
            </p>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={key} className="list-disc list-inside space-y-1 text-gray-700">
              {(block.items || []).map((listItem, listIndex) => (
                <li key={`${key}-item-${listIndex}`}>{listItem}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'link') {
          return (
            <div key={key} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
              <p className="text-sm text-gray-500 mb-1">Resource link</p>
              <a
                href={block.url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {block.caption || block.url}
              </a>
              {block.text && <p className="text-sm text-gray-600 mt-2">{block.text}</p>}
            </div>
          );
        }
        if (block.type === 'image') {
          const imageUrl = resolveAssetUrl(block.url);
          return (
            <figure key={key} className="space-y-2">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={block.caption || item.title}
                  className="w-full rounded-xl border border-gray-200"
                />
              )}
              {block.caption && <figcaption className="text-sm text-gray-500">{block.caption}</figcaption>}
            </figure>
          );
        }
        if (block.type === 'pdf') {
          const pdfUrl = resolveAssetUrl(block.url);
          const pdfThumbnail = resolveAssetUrl(block.thumbnailUrl);
          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <span className="text-sm text-gray-700">{block.caption || 'PDF Resource'}</span>
                {pdfUrl && (
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Open PDF
                  </a>
                )}
              </div>
              {pdfThumbnail && (
                <img
                  src={pdfThumbnail}
                  alt={block.caption || 'PDF preview'}
                  className="w-full rounded-lg border border-gray-200"
                />
              )}
            </div>
          );
        }
        if (block.type === 'video') {
          const videoUrl = resolveAssetUrl(block.url);
          const embedUrl = getVideoEmbedUrl(videoUrl);
          const thumbnail = resolveAssetUrl(block.thumbnailUrl);
          return (
            <div key={key} className="space-y-3">
              {embedUrl ? (
                <div className="aspect-video">
                  <iframe
                    src={embedUrl}
                    title={block.caption || item.title}
                    className="w-full h-full rounded-xl border border-gray-200"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : isVideoFile(videoUrl) ? (
                <video
                  controls
                  src={videoUrl}
                  poster={thumbnail}
                  className="w-full rounded-xl border border-gray-200"
                />
              ) : (
                <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                  <p className="text-sm text-gray-600">Video link not supported.</p>
                </div>
              )}
              {block.caption && <p className="text-sm text-gray-600">{block.caption}</p>}
            </div>
          );
        }
        return null;
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
          <p className="mt-4 text-gray-600">Loading resource...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600">Resource not found or unavailable.</p>
          <button
            type="button"
            onClick={() => navigate('/teacher-training', { state: { section: 'resources' } })}
            className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teacher Training
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <button
          type="button"
          onClick={() => navigate('/teacher-training', { state: { section: 'resources' } })}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Teacher Training
        </button>

        <div className="bg-white rounded-2xl shadow-lg mt-6 overflow-hidden">
          {thumbnailUrl && (
            <div className="h-64 w-full">
              <img
                src={thumbnailUrl}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="p-8 space-y-6">
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-600">
              {category?.title && (
                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700">{category.title}</span>
              )}
              {item.type && (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">{item.type}</span>
              )}
              {hasDuration && (
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Number.isNaN(Number(durationValue)) ? durationValue : `${Number(durationValue)} min`}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">{item.title || 'Teaching Resource'}</h1>
              {summaryText && <p className="mt-2 text-gray-600">{summaryText}</p>}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                <Tag className="h-4 w-4" />
                {tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 rounded-full bg-gray-100">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {(downloadUrl || externalUrl) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 border border-blue-100 bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download resource
                    </span>
                    <span className="text-xs font-semibold">PDF</span>
                  </a>
                )}
                {externalUrl && (
                  <a
                    href={externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 border border-gray-200 bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700"
                  >
                    <span className="inline-flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Open external link
                    </span>
                    <span className="text-xs font-semibold">Link</span>
                  </a>
                )}
              </div>
            )}

            <div className="border-t border-gray-200 pt-6">
              {hasContentBlocks ? renderContentBlocks() : renderMarkdownContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherTrainingResourceDetail;
