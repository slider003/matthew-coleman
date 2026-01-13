'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink, Bookmark, Filter, X, Share2, Copy, Check } from 'lucide-react';

interface Resource {
    id: string;
    name: string;
    url: string;
    categories: string[];
    description: string;
    published: boolean;
}

interface ResourcesPageClientProps {
    initialResources: Resource[];
}

export default function ResourcesPageClient({ initialResources }: ResourcesPageClientProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false });

    const allCategories = useMemo(() => {
        const cats = new Set<string>();
        initialResources.forEach(r => r.categories.forEach(c => cats.add(c)));
        return Array.from(cats).sort();
    }, [initialResources]);

    const filteredResources = useMemo(() => {
        if (!selectedCategory) return initialResources;
        return initialResources.filter(r => r.categories.includes(selectedCategory));
    }, [initialResources, selectedCategory]);

    const showToast = (message: string) => {
        setToast({ message, show: true });
        setTimeout(() => setToast({ message: '', show: false }), 3000);
    };

    const handleOpen = (url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleShare = async (name: string, url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: name,
                    url: url
                });
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    showToast('Sharing failed');
                }
            }
        } else {
            showToast('Sharing not supported on this device');
        }
    };

    const handleCopy = async (url: string, id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            showToast('Link copied to clipboard!');
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            showToast('Failed to copy link');
        }
    };

    return (
        <div className="container mx-auto px-4 py-16 max-w-5xl">
            <header className="mb-12 text-center text-balance">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 leading-tight">
                    Resources
                    <span className="block text-xl md:text-2xl font-medium text-muted-foreground mt-2">
                        Tools, Websites & Inspiration
                    </span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    A curated collection of useful websites, tools, and resources I've gathered over time.
                </p>
            </header>

            {/* Filter Bar */}
            <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
                <div className="flex items-center gap-2 mr-2 text-muted-foreground text-sm font-medium">
                    <Filter className="h-4 w-4" />
                    <span>Filter:</span>
                </div>
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === null
                            ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                            : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground'
                        }`}
                >
                    All
                </button>
                {allCategories.map(category => (
                    <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === category
                                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                                : 'bg-accent/50 text-muted-foreground hover:bg-accent hover:text-foreground'
                            }`}
                    >
                        {category}
                    </button>
                ))}
                {selectedCategory && (
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="p-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all ml-2"
                        title="Clear filter"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredResources.map((resource) => (
                    <article
                        key={resource.id}
                        className="group relative flex flex-col h-full p-6 rounded-2xl border border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:bg-background/80 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                <Bookmark className="h-5 w-5" />
                            </div>
                        </div>

                        <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
                                {resource.name}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                {resource.description}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-2 mb-4">
                            {resource.categories.map(cat => (
                                <span
                                    key={cat}
                                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${selectedCategory === cat
                                            ? 'bg-primary/10 border-primary/20 text-primary'
                                            : 'bg-muted/50 border-border text-muted-foreground'
                                        }`}
                                >
                                    {cat}
                                </span>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t border-border/30">
                            <button
                                onClick={(e) => handleOpen(resource.url, e)}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
                                title="Open link"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Open
                            </button>
                            <button
                                onClick={(e) => handleShare(resource.name, resource.url, e)}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-colors text-sm font-medium"
                                title="Share link"
                            >
                                <Share2 className="h-4 w-4" />
                                Share
                            </button>
                            <button
                                onClick={(e) => handleCopy(resource.url, resource.id, e)}
                                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground hover:bg-accent/80 transition-colors text-sm font-medium"
                                title="Copy link"
                            >
                                {copiedId === resource.id ? (
                                    <Check className="h-4 w-4" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                                {copiedId === resource.id ? 'Copied' : 'Copy'}
                            </button>
                        </div>

                        <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary group-hover:w-full transition-all duration-500 rounded-b-2xl" />
                    </article>
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-24 bg-accent/10 rounded-3xl border border-dashed border-border/50 animate-in zoom-in-95 duration-500">
                    <div className="p-4 rounded-full bg-accent/20 w-16 h-16 flex items-center justify-center mx-auto mb-6">
                        <Filter className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No resources found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        We couldn't find any resources matching your current criteria. Try clearing your filters.
                    </p>
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="mt-8 px-6 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-8 right-8 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-5 duration-300 z-50">
                    {toast.message}
                </div>
            )}
        </div>
    );
}
