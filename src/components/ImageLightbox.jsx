import { useState, useEffect } from "react";
import { FiX, FiChevronLeft, FiChevronRight, FiZoomIn, FiZoomOut } from "react-icons/fi";

export default function ImageLightbox({ images, currentIndex, onClose }) {
    const [index, setIndex] = useState(currentIndex || 0);
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        setIndex(currentIndex || 0);
        setZoom(1);
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                onClose();
            } else if (e.key === "ArrowLeft") {
                handlePrev();
            } else if (e.key === "ArrowRight") {
                handleNext();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "unset";
        };
    }, [index]);

    const handlePrev = () => {
        setIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
        setZoom(1);
    };

    const handleNext = () => {
        setIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
        setZoom(1);
    };

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.25, 0.5));
    };

    const handleResetZoom = () => {
        setZoom(1);
    };

    if (!images || images.length === 0) return null;

    const currentImage = images[index];

    return (
        <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-2 right-2 md:top-4 md:right-4 z-10 rounded-full bg-white/10 p-2 md:p-3 text-white transition hover:bg-white/20 backdrop-blur-sm"
                aria-label="Close"
            >
                <FiX className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePrev();
                        }}
                        className="absolute left-2 md:left-4 z-10 rounded-full bg-white/10 p-2 md:p-3 text-white transition hover:bg-white/20 backdrop-blur-sm"
                        aria-label="Previous"
                    >
                        <FiChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNext();
                        }}
                        className="absolute right-2 md:right-4 z-10 rounded-full bg-white/10 p-2 md:p-3 text-white transition hover:bg-white/20 backdrop-blur-sm"
                        aria-label="Next"
                    >
                        <FiChevronRight className="h-5 w-5 md:h-6 md:w-6" />
                    </button>
                </>
            )}

            {/* Zoom Controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleZoomOut();
                    }}
                    className="rounded-full p-2 text-white transition hover:bg-white/20"
                    aria-label="Zoom Out"
                >
                    <FiZoomOut className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium text-white min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                </span>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleZoomIn();
                    }}
                    className="rounded-full p-2 text-white transition hover:bg-white/20"
                    aria-label="Zoom In"
                >
                    <FiZoomIn className="h-5 w-5" />
                </button>
                {zoom !== 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleResetZoom();
                        }}
                        className="ml-2 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/30"
                    >
                        Reset
                    </button>
                )}
            </div>

            {images.length > 1 && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                    {index + 1} / {images.length}
                </div>
            )}
            <div
                className="relative max-h-[90vh] max-w-[90vw]"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={currentImage}
                    alt={`Image ${index + 1}`}
                    className="max-h-[90vh] max-w-[90vw] object-contain transition-transform duration-300"
                    style={{
                        transform: `scale(${zoom})`,
                        cursor: zoom > 1 ? "grab" : "default",
                    }}
                    draggable={false}
                />
            </div>
        </div>
    );
}

