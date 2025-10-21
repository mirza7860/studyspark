import React, { useEffect, useRef, useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ArrowsPointingOutIcon,
  Cog6ToothIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

declare const pdfjsLib: any;

interface PdfViewerProps {
  file: File;
}

const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3];

export const PdfViewer = ({ file }: PdfViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [pageNum, setPageNum] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.5);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [renderTrigger, setRenderTrigger] = useState<number>(0);

  // Load PDF
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      if (!mounted) return;
      try {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(data).promise;
        if (!mounted) return;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setPageNum(1);
        setPageInput("1");
        setRenderTrigger((p) => p + 1);
      } catch (e) {
        console.error("Failed to load PDF:", e);
        if (mounted) setError("Could not load the PDF. It might be corrupted.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    reader.onerror = () => {
      if (mounted) {
        setError("Failed to read the file.");
        setIsLoading(false);
      }
    };

    reader.readAsArrayBuffer(file);

    return () => {
      mounted = false;
      try {
        renderTaskRef.current?.cancel?.();
      } catch (e) {
        // swallow
      }
      pdfDocRef.current?.destroy?.();
      pdfDocRef.current = null;
    };
  }, [file]);

  // Render page
  useEffect(() => {
    const renderPage = async () => {
      const pdfDoc = pdfDocRef.current;
      const canvas = canvasRef.current;
      if (!pdfDoc || !canvas) return;

      // Cancel previous render
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // ignore
        }
        renderTaskRef.current = null;
      }

      setIsLoading(true);
      setError(null);

      try {
        const page = await pdfDoc.getPage(pageNum);
        const devicePixelRatio = Math.max(1, window.devicePixelRatio || 1);
        const viewport = page.getViewport({ scale });

        // Set canvas size in CSS pixels but account for DPR for crisp rendering
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        canvas.width = Math.floor(viewport.width * devicePixelRatio);
        canvas.height = Math.floor(viewport.height * devicePixelRatio);

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");

        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });

        renderTaskRef.current = renderTask;
        await renderTask.promise;
        renderTaskRef.current = null;
        setIsLoading(false);

        // Reset scroll to top of container so user sees page start
        if (scrollContainerRef.current)
          scrollContainerRef.current.scrollTop = 0;
      } catch (e: any) {
        if (e && e.name === "RenderingCancelledException") {
          // ignore cancelled renders
        } else {
          console.error("Render error:", e);
          setError(`Failed to render page ${pageNum}.`);
        }
        setIsLoading(false);
      }
    };

    renderPage();
  }, [pageNum, scale, renderTrigger]);

  // Page navigation helpers
  const goToPrev = () => setPageNum((p) => Math.max(1, p - 1));
  const goToNext = () => setPageNum((p) => Math.min(numPages || p + 1, p + 1));

  // Keep pageInput in sync when pageNum changes from other controls
  useEffect(() => setPageInput(String(pageNum)), [pageNum]);

  // Zoom helpers using zoomLevels
  const zoomIn = () => {
    setScale((prev) => {
      const next = zoomLevels.find((z) => z > prev);
      return next ?? prev;
    });
  };
  const zoomOut = () => {
    setScale((prev) => {
      const next = [...zoomLevels].reverse().find((z) => z < prev);
      return next ?? prev;
    });
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        goToPrev();
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "+" || e.key === "=") {
        // +/=
        zoomIn();
      } else if (e.key === "-") {
        zoomOut();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [numPages]);

  // Page input handlers
  const onPageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };
  const onPageInputBlur = () => {
    const parsed = parseInt(pageInput, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(1, Math.min(numPages || parsed, parsed));
      setPageNum(clamped);
    } else {
      setPageInput(String(pageNum));
    }
  };

  const onScaleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) setScale(v);
  };

  // const onFullscreen = () => {
  //   const el = canvasRef.current?.parentElement ?? document.documentElement;
  //   if (!document.fullscreenElement) {
  //     el.requestFullscreen?.().catch((err) => console.error(err));
  //   } else {
  //     document.exitFullscreen?.();
  //   }
  // };

  const onDownload = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="flex flex-col h-full w-full bg-gray-50 rounded-md overflow-hidden">
      {/* top toolbar */}
      <div className="flex items-center justify-between gap-4 p-3 bg-gray-100 border-b">
        {/* Left: Page Navigation */}
        <div className="flex items-center gap-2">
            <button
                onClick={goToPrev}
                disabled={pageNum <= 1 || isLoading}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous page"
                title="Previous page (Left Arrow)"
            >
                <ChevronLeftIcon className="h-5 w-5" />
            </button>

            <div className="flex items-center">
                <input
                type="text"
                value={pageInput}
                onChange={onPageInputChange}
                onBlur={onPageInputBlur}
                className="w-4 text-center bg-transparent text-gray-500 outline-none"
                aria-label="Page number"
                />
                <span className="text-sm text-gray-500">/ {numPages || "--"}</span>
            </div>

            <button
                onClick={goToNext}
                disabled={pageNum >= numPages || isLoading}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next page"
                title="Next page (Right Arrow)"
            >
                <ChevronRightIcon className="h-5 w-5" />
            </button>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-2">
            <button
                onClick={zoomOut}
                disabled={scale <= zoomLevels[0] || isLoading}
                aria-label="Zoom out"
                title="Zoom out (-)"
                className="p-1 rounded-md text-gray-700 hover:bg-gray-200 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <MagnifyingGlassMinusIcon className="h-5 w-5" />
            </button>

            <select
                value={scale}
                onChange={onScaleSelect}
                disabled={isLoading}
                className="bg-transparent outline-none text-gray-700"
            >
                {zoomLevels.map((z) => (
                <option key={z} value={z}>
                    {Math.round(z * 100)}%
                </option>
                ))}
            </select>

            <button
                onClick={zoomIn}
                disabled={scale >= zoomLevels[zoomLevels.length - 1] || isLoading}
                aria-label="Zoom in"
                title="Zoom in (+)"
                className="p-1 rounded-md text-gray-700 hover:bg-gray-200 hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <MagnifyingGlassPlusIcon className="h-5 w-5" />
            </button>
        </div>

        {/* Right: Download & Fullscreen */}
        <div className="flex items-center gap-2">
            <button
                onClick={onDownload}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-black"
                aria-label="Download"
                title="Download"
            >
                <ArrowDownTrayIcon className="h-5 w-5" />
            </button>
            {/* <button
                onClick={onFullscreen}
                className="p-2 rounded-md text-gray-700 hover:bg-gray-200 hover:text-black"
                aria-label="Toggle fullscreen"
                title="Fullscreen"
            >
                <ArrowsPointingOutIcon className="h-5 w-5" />
            </button> */}
        </div>
      </div>

      {/* viewport */}
      <div
        ref={scrollContainerRef}
        className="flex-1 w-full overflow-auto p-6 flex justify-center items-start bg-gradient-to-b from-white to-gray-50"
      >
        <div className="w-full max-w-5xl flex justify-center">
          <div className="shadow-lg bg-white rounded-md p-4">
            <div className="relative">
              {/* loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                  <div className="text-sm text-gray-600">Rendering page...</div>
                </div>
              )}

              <canvas ref={canvasRef} className="block rounded-md" />
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
};
