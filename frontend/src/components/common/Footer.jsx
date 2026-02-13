import { useEffect, useState } from 'react';
import { Music, Mail, Github, Linkedin } from 'lucide-react';
import { pageContentsAPI } from '../../services/api';
import { PAGE_CONTENT_SLUGS, getDefaultPageContent } from '../../utils/pageContentDefaults';

const Footer = () => {
  const [pageContent, setPageContent] = useState(() =>
    getDefaultPageContent(PAGE_CONTENT_SLUGS.FOOTER)
  );

  useEffect(() => {
    let isMounted = true;

    const loadContent = async () => {
      try {
        const response = await pageContentsAPI.getBySlug(PAGE_CONTENT_SLUGS.FOOTER);
        const payload = response?.data || {};
        const pageContentResponse = payload.pageContent || payload.data?.pageContent;
        const defaults = getDefaultPageContent(PAGE_CONTENT_SLUGS.FOOTER);
        const rawContent = pageContentResponse?.content || defaults;
        const mergedContent = {
          ...defaults,
          ...rawContent,
          brand: { ...defaults.brand, ...(rawContent.brand || {}) },
          styles: { ...defaults.styles, ...(rawContent.styles || {}) }
        };

        if (isMounted) {
          setPageContent(mergedContent);
        }
      } catch (error) {
        if (isMounted) {
          setPageContent(getDefaultPageContent(PAGE_CONTENT_SLUGS.FOOTER));
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  const brand = pageContent.brand || {};
  const quickLinks = Array.isArray(pageContent.quickLinks)
    ? pageContent.quickLinks.filter((link) => {
        const label = (link.label || '').trim().toLowerCase();
        const url = (link.url || '').trim().toLowerCase();
        return label !== 'admin dashboard' && url !== '/admin' && url !== '/admin/';
      })
    : [];

  const connectLinks = Array.isArray(pageContent.connectLinks) ? pageContent.connectLinks : [];
  const connectTitle = pageContent.connectTitle || 'Connect';
  const styles = pageContent.styles || {};
  const bottomText =
    pageContent.bottomText || 'Spatial AI for Music Teacher Training. All rights reserved.';
  const iconMap = { Mail, Github, Linkedin };
  const footerStyles = {
    '--footer-bg': styles.backgroundColor || '#111827',
    '--footer-text': styles.textColor || '#d1d5db',
    '--footer-heading': styles.headingColor || '#ffffff',
    '--footer-accent': styles.accentColor || '#60a5fa',
    '--footer-border': styles.borderColor || '#1f2937',
  };

  return (
    <footer
      className="bg-[var(--footer-bg)] text-[var(--footer-text)]"
      style={footerStyles}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Music className="h-6 w-6 text-[var(--footer-accent)]" />
              <span className="text-xl font-bold text-[var(--footer-heading)]">
                {brand.name || 'Spatial AI'}
              </span>
            </div>
            {brand.description && (
              <p className="mb-4 text-sm md:text-base opacity-90">
                {brand.description}
              </p>
            )}
            {brand.tagline && (
              <p className="text-sm opacity-70">
                {brand.tagline}
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-[var(--footer-heading)] font-semibold mb-4">Quick Links</h3>
            {quickLinks.length === 0 ? (
              <p className="text-sm opacity-70">Add quick links in the admin editor.</p>
            ) : (
              <ul className="space-y-2">
                {quickLinks.map((link, index) => {
                  const url = link.url || '#';
                  const isExternal = /^https?:\/\//i.test(url);

                  return (
                    <li key={link.id || link.label || index}>
                      <a
                        href={url}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noreferrer' : undefined}
                        className="hover:text-[var(--footer-accent)] transition-colors"
                      >
                        {link.label || url}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-[var(--footer-heading)] font-semibold mb-4">{connectTitle}</h3>
            {connectLinks.length === 0 ? (
              <p className="text-sm opacity-70">Add contact links in the admin editor.</p>
            ) : (
              <ul className="space-y-3">
                {connectLinks.map((link, index) => {
                  const IconComponent = typeof link.icon === 'string' ? iconMap[link.icon] : link.icon;
                  const url = link.url || '#';
                  const isExternal = /^https?:\/\//i.test(url);

                  return (
                    <li key={link.id || link.label || index} className="flex items-center space-x-2">
                      {link.avatarUrl ? (
                        <img
                          src={link.avatarUrl}
                          alt={link.label || 'Avatar'}
                          className="h-6 w-6 rounded-full object-cover border border-white/20"
                        />
                      ) : IconComponent ? (
                        <IconComponent className="h-4 w-4 text-[var(--footer-accent)]" />
                      ) : (
                        <span className="h-4 w-4" />
                      )}
                      <a
                        href={url}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noreferrer' : undefined}
                        className="hover:text-[var(--footer-accent)] transition-colors break-words"
                      >
                        {link.label || url}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="border-t mt-8 pt-8 text-center"
          style={{ borderColor: styles.borderColor || '#1f2937' }}
        >
          <p className="text-sm opacity-70">
            &copy; {new Date().getFullYear()} {bottomText}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;