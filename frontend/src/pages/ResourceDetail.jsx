import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Tag } from 'lucide-react';
import { resourcesAPI } from '../services/api';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace(/\/api\/?$/, '');

const resolveAssetUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
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

const getPdfEmbedUrl = (url) => {
  if (!url) return '';
  const params = 'view=FitH&toolbar=0&navpanes=0&scrollbar=1';
  return url.includes('#') ? `${url}&${params}` : `${url}#${params}`;
};

const isVideoFile = (url) => /\.(mp4|webm|ogg)$/i.test(url || '');

const ResourceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const response = await resourcesAPI.getById(id);
        const payload = response?.data || {};
        const data = payload.resource || payload.data?.resource || payload.data || null;
        if (!data) {
          throw new Error('Resource not found');
        }
        setResource(data);
      } catch (err) {
        console.error('Failed to load resource:', err);
        setError('Resource not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchResource();
    }
  }, [id]);

  const contentBlocks = useMemo(() => resource?.contentBlocks || [], [resource]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading resource...</p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-600">{error || 'Resource not available.'}</p>
        <button
          onClick={() => navigate('/resources')}
          className="mt-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to resources
        </button>
      </div>
    );
  }

  const fileUrl = resolveAssetUrl(resource.fileUrl);
  const thumbnailUrl = resolveAssetUrl(resource.thumbnailUrl);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('/resources')}
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to resources
        </button>
        <span className="text-xs text-gray-400">Resource ID: {resource.id}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {thumbnailUrl && (
          <div className="h-64 w-full">
            <img
              src={thumbnailUrl}
              alt={resource.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-8 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-600 mb-3">
              <span className="px-2 py-1 rounded-full bg-blue-50 text-blue-700">{resource.category}</span>
              <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700">{resource.type}</span>
              <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{resource.difficulty}</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{resource.title}</h1>
            <p className="mt-2 text-gray-600">{resource.description}</p>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <span>Duration: {resource.duration} min</span>
              {resource.authorName && <span>Author: {resource.authorName}</span>}
              {resource.university && <span>Institution: {resource.university}</span>}
            </div>
          </div>

          {resource.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <Tag className="h-4 w-4" />
              {resource.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 rounded-full bg-gray-100">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {fileUrl && (
            <div className="flex flex-wrap items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="flex-1 text-sm text-blue-700">Primary PDF attached</div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-700"
              >
                <Download className="h-4 w-4" />
                Open PDF
              </a>
            </div>
          )}

          {contentBlocks.length === 0 ? (
            <div className="text-sm text-gray-500">No additional content blocks added yet.</div>
          ) : (
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
                      {(block.items || []).map((item, idx) => (
                        <li key={`${key}-item-${idx}`}>{item}</li>
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
                      {block.text && (
                        <p className="text-sm text-gray-600 mt-2">{block.text}</p>
                      )}
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
                          alt={block.caption || resource.title}
                          className="w-full rounded-xl border border-gray-200"
                        />
                      )}
                      {block.caption && (
                        <figcaption className="text-sm text-gray-500">{block.caption}</figcaption>
                      )}
                    </figure>
                  );
                }
                if (block.type === 'pdf') {
                  const pdfUrl = resolveAssetUrl(block.url);
                  const embedUrl = getPdfEmbedUrl(pdfUrl);
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
                      {pdfUrl && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                          <iframe
                            src={embedUrl}
                            title={block.caption || 'PDF preview'}
                            className="w-full min-h-[640px] bg-white"
                            loading="lazy"
                          />
                        </div>
                      )}
                    </div>
                  );
                }
                if (block.type === 'video') {
                  const embedUrl = getVideoEmbedUrl(block.url);
                  const thumbnailUrl = resolveAssetUrl(block.thumbnailUrl);
                  if (embedUrl) {
                    return (
                      <div key={key} className="space-y-2">
                        {thumbnailUrl && (
                          <img
                            src={thumbnailUrl}
                            alt={block.caption || 'Video thumbnail'}
                            className="w-full rounded-lg border border-gray-200"
                          />
                        )}
                        <div className="aspect-video w-full">
                          <iframe
                            src={embedUrl}
                            title={block.caption || 'Video'}
                            className="w-full h-full rounded-lg border border-gray-200"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        {block.caption && (
                          <p className="text-sm text-gray-500">{block.caption}</p>
                        )}
                      </div>
                    );
                  }
                  if (isVideoFile(block.url)) {
                    return (
                      <div key={key} className="space-y-2">
                        <video
                          controls
                          poster={thumbnailUrl || undefined}
                          className="w-full rounded-lg border border-gray-200"
                        >
                          <source src={resolveAssetUrl(block.url)} />
                        </video>
                        {block.caption && (
                          <p className="text-sm text-gray-500">{block.caption}</p>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div key={key} className="space-y-1">
                      {thumbnailUrl && (
                        <img
                          src={thumbnailUrl}
                          alt={block.caption || 'Video thumbnail'}
                          className="w-full rounded-lg border border-gray-200"
                        />
                      )}
                      <p className="text-sm text-gray-600">Video link</p>
                      <a
                        href={block.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {block.caption || block.url}
                      </a>
                      {block.caption && (
                        <p className="text-sm text-gray-500">{block.caption}</p>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        <Link to="/resources" className="text-blue-600 hover:text-blue-700">
          Browse more resources
        </Link>
      </div>
    </div>
  );
};

export default ResourceDetail;
