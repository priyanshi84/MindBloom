import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Icon } from '../../components/Icon';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { Page, PageProps } from '../../types';

type Tool = 'brush' | 'eraser';

const drawingPrompts = [
  "What does 'calm' look like?",
  "Draw a safe and comfortable place.",
  "Doodle your feelings without thinking.",
  "Illustrate a happy memory.",
  "Draw a pattern that feels soothing.",
  "What color is your mood right now?",
  "Draw the shape of your breath.",
];

const promptColors = [
  { bg: 'bg-amber-50 dark:bg-amber-900/40', border: 'border-amber-400', icon: 'text-amber-500', text: 'text-amber-700 dark:text-amber-300' },
  { bg: 'bg-violet-50 dark:bg-violet-900/40', border: 'border-violet-400', icon: 'text-violet-500', text: 'text-violet-700 dark:text-violet-300' },
  { bg: 'bg-sky-50 dark:bg-sky-900/40', border: 'border-sky-400', icon: 'text-sky-500', text: 'text-sky-700 dark:text-sky-300' },
  { bg: 'bg-rose-50 dark:bg-rose-900/40', border: 'border-rose-400', icon: 'text-rose-500', text: 'text-rose-700 dark:text-rose-300' },
  { bg: 'bg-emerald-50 dark:bg-emerald-900/40', border: 'border-emerald-400', icon: 'text-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
];
type PromptColorTheme = typeof promptColors[0];

const CalmCanvas: React.FC<PageProps> = ({ setActivePage }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const contextRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDrawingRef = useRef(false);
    const lastPosition = useRef<{x: number; y: number} | null>(null);

    const [tool, setTool] = useState<Tool>('brush');
    const [color, setColor] = useState('#7c3aed');
    const [brushSize, setBrushSize] = useState(5);
    
    const [history, setHistory] = useLocalStorage<string[]>('calmCanvasHistory', []);
    const [historyIndex, setHistoryIndex] = useState(history.length > 0 ? history.length - 1 : -1);
    
    const [activePrompt, setActivePrompt] = useState<{ text: string; key: number; colorTheme: PromptColorTheme } | null>(null);
    const promptTimerRef = useRef<number | null>(null);
    
    const redrawCanvas = useCallback((dataUrl: string | null) => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;
        
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (dataUrl) {
            const image = new Image();
            image.onload = () => {
                context.drawImage(image, 0, 0);
            };
            image.src = dataUrl;
        }
    }, []);

    // Effect to setup canvas, context, and resize listener. Runs ONCE on mount.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return;
        
        contextRef.current = context;

        const handleResize = () => {
            const parent = canvas.parentElement;
            if (parent && contextRef.current) {
                const currentDataUrl = canvas.toDataURL();
                
                canvas.width = parent.offsetWidth;
                canvas.height = parent.offsetHeight;
                
                contextRef.current.lineCap = 'round';
                contextRef.current.lineJoin = 'round';
                
                const image = new Image();
                image.onload = () => {
                    contextRef.current?.drawImage(image, 0, 0);
                };
                image.src = currentDataUrl;
            }
        };
        
        window.addEventListener('resize', handleResize);
        handleResize(); // Set initial size

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Effect to initialize history if empty, or redraw from existing history.
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !contextRef.current) return;
        
        if (history.length > 0) {
            redrawCanvas(history[historyIndex]);
        } else if (canvas.width > 0 && canvas.height > 0) {
            // If history is empty, but canvas is sized, create initial state.
            const blankDataUrl = canvas.toDataURL();
            setHistory([blankDataUrl]);
            setHistoryIndex(0);
        }
    }, [history, historyIndex, redrawCanvas, setHistory, setHistoryIndex]);

    const getCoords = (e: MouseEvent | TouchEvent): { x: number, y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();

        if (e instanceof MouseEvent) {
            return { x: e.clientX - rect.left, y: e.clientY - rect.top };
        }
        if (e.touches[0]) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return null;
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (e.nativeEvent instanceof TouchEvent) e.preventDefault();
        const coords = getCoords(e.nativeEvent);
        const context = contextRef.current;
        if (!coords || !context) return;

        isDrawingRef.current = true;
        lastPosition.current = coords;

        context.fillStyle = tool === 'brush' ? color : 'rgba(0,0,0,1)';
        context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        
        context.beginPath();
        context.arc(coords.x, coords.y, brushSize / 2, 0, Math.PI * 2);
        context.fill();
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (e.nativeEvent instanceof TouchEvent) e.preventDefault();
        if (!isDrawingRef.current) return;
        const coords = getCoords(e.nativeEvent);
        const context = contextRef.current;

        if (!coords || !context || !lastPosition.current) return;

        context.strokeStyle = color;
        context.lineWidth = brushSize;
        context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';

        context.beginPath();
        context.moveTo(lastPosition.current.x, lastPosition.current.y);
        context.lineTo(coords.x, coords.y);
        context.stroke();
        
        lastPosition.current = coords;
    };
    
    const stopDrawing = useCallback(() => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        lastPosition.current = null;
        
        const canvas = canvasRef.current;
        if (canvas) {
            const newCanvasData = canvas.toDataURL();
            const newHistory = history.slice(0, historyIndex + 1);
            
            setHistory([...newHistory, newCanvasData]);
            setHistoryIndex(newHistory.length);
        }
    }, [setHistory, history, historyIndex]);

    const dismissPrompt = () => {
        if (promptTimerRef.current) {
            clearTimeout(promptTimerRef.current);
        }
        setActivePrompt(null);
    };
    
    const handleClearCanvas = () => {
        const canvas = canvasRef.current;
        const context = contextRef.current;
        if (!canvas || !context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        const blankDataUrl = canvas.toDataURL();

        setHistory([blankDataUrl]);
        setHistoryIndex(0);
        dismissPrompt();
    };
    
    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = 'mindbloom-canvas.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    };
    
    const handleShowIdea = () => {
        const promptText = drawingPrompts[Math.floor(Math.random() * drawingPrompts.length)];
        const colorTheme = promptColors[Math.floor(Math.random() * promptColors.length)];
        
        if (promptTimerRef.current) {
            clearTimeout(promptTimerRef.current);
        }

        setActivePrompt({ text: promptText, key: Date.now(), colorTheme });
        promptTimerRef.current = window.setTimeout(() => {
            setActivePrompt(null);
        }, 10000);
    };
    
    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(prevIndex => prevIndex - 1);
        }
    }, [historyIndex]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(prevIndex => prevIndex + 1);
        }
    }, [history.length, historyIndex]);

    const colors = ['#7c3aed', '#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'];

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 md:p-6 lg:p-8 border-b border-slate-200/80 dark:border-slate-700/80 bg-white/50 dark:bg-[#111119]/50 backdrop-blur-lg sticky top-0 z-10 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-rose-400 via-fuchsia-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                         <Icon name="Brush" className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Calm Canvas</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">A quiet space to doodle and unwind.</p>
                    </div>
                </div>
            </header>
            <div className="flex-1 relative">
                <button
                    onClick={() => setActivePage(Page.Today)}
                    className="absolute top-4 left-4 md:left-6 lg:left-8 z-20 inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/60 hover:bg-white/90 dark:hover:bg-slate-700/90 backdrop-blur-sm rounded-lg p-2 transition-colors shadow-md"
                    aria-label="Go back"
                >
                    <Icon name="ArrowLeft" className="w-5 h-5" />
                    <span>Back</span>
                </button>
                <canvas
                    ref={canvasRef}
                    data-drawing-canvas
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="absolute top-0 left-0 w-full h-full"
                />
            </div>
            <div className="flex-shrink-0 p-3 bg-white/80 dark:bg-[#111119]/80 border-t border-slate-200/80 dark:border-slate-700/80 backdrop-blur-sm">
                <div className="relative">
                    {/* Prompt bar, positioned relative to the card below */}
                    <div className={`absolute bottom-[calc(100%+0.5rem)] left-0 right-0 mx-auto w-full max-w-xl transition-all duration-300 ease-out ${activePrompt ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                        {activePrompt && (
                            <div key={activePrompt.key} className={`px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 border-l-4 ${activePrompt.colorTheme.bg} ${activePrompt.colorTheme.border}`}>
                                <div className="flex items-center gap-3">
                                    <Icon name="Lightbulb" className={`w-5 h-5 ${activePrompt.colorTheme.icon} flex-shrink-0`} />
                                    <p className={`text-sm font-medium ${activePrompt.colorTheme.text}`}>{activePrompt.text}</p>
                                </div>
                                <button onClick={dismissPrompt} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 flex-shrink-0" aria-label="Dismiss prompt">
                                    <Icon name="XCircle" className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                    <Card className="p-2">
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                            {/* Left Side: Tools & Style */}
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                {/* Tool Selection */}
                                <div className="flex items-center p-1 bg-slate-200/80 dark:bg-slate-700/50 rounded-lg" role="group">
                                    <Button size="sm" variant={tool === 'brush' ? 'subtle' : 'ghost'} onClick={() => setTool('brush')} data-tooltip="Brush" aria-label="Select Brush" className={`!px-2 !py-1 ${tool === 'brush' ? '!bg-white dark:!bg-slate-600 shadow' : ''}`}>
                                        <Icon name="Brush" className="w-5 h-5" />
                                    </Button>
                                    <Button size="sm" variant={tool === 'eraser' ? 'subtle' : 'ghost'} onClick={() => setTool('eraser')} data-tooltip="Eraser" aria-label="Select Eraser" className={`!px-2 !py-1 ${tool === 'eraser' ? '!bg-white dark:!bg-slate-600 shadow' : ''}`}>
                                        <Icon name="Eraser" className="w-5 h-5" />
                                    </Button>
                                </div>
                                
                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />

                                {/* Color Palette */}
                                <div className="flex items-center gap-2" role="group" aria-label="Color selection">
                                    {colors.map(c => (
                                        <button 
                                            key={c} 
                                            onClick={() => setColor(c)} 
                                            className={`rounded-full transition-all duration-200 border-2 flex items-center justify-center hover:opacity-100
                                                ${color === c 
                                                    ? 'w-8 h-8 ring-2 ring-offset-2 ring-violet-500 dark:ring-offset-slate-900 border-white dark:border-slate-800 opacity-100' 
                                                    : 'w-7 h-7 border-transparent opacity-60'
                                                }`
                                            }
                                            style={{ backgroundColor: c }} 
                                            data-tooltip={c} 
                                            aria-label={`Select color ${c}`}
                                        />
                                    ))}
                                    <div data-tooltip="Custom Color" aria-label="Choose custom color" className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600 overflow-hidden relative cursor-pointer" style={{ background: 'conic-gradient(from 180deg at 50% 50%, #ef4444, #f97316, #eab308, #84cc16, #22c55e, #14b8a6, #06b6d4, #3b82f6, #8b5cf6, #d946ef, #ef4444)' }}>
                                      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer opacity-0" />
                                    </div>
                                </div>

                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

                                {/* Brush Size */}
                                <div className="flex items-center gap-3" aria-label="Brush size controls">
                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center" data-tooltip={`Size: ${brushSize}`}>
                                      <div className="rounded-full bg-slate-800 dark:bg-slate-100 transition-all" style={{ width: `${4 + 20 * (brushSize - 1) / 49}px`, height: `${4 + 20 * (brushSize - 1) / 49}px` }}/>
                                    </div>
                                    <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-24 md:w-32 cursor-pointer" aria-label="Adjust brush size" />
                                </div>
                            </div>

                            {/* Right Side: Actions */}
                            <div className="flex items-center gap-2" role="group" aria-label="Canvas actions">
                                <Button size="icon" variant="subtle" onClick={handleUndo} disabled={historyIndex <= 0} data-tooltip="Undo" aria-label="Undo"><Icon name="RotateCcw" className="w-5 h-5" /></Button>
                                <Button size="icon" variant="subtle" onClick={handleRedo} disabled={historyIndex >= history.length - 1} data-tooltip="Redo" aria-label="Redo"><Icon name="RotateCw" className="w-5 h-5" /></Button>
                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                                <Button size="icon" variant="subtle" onClick={handleShowIdea} data-tooltip="Get an Idea" aria-label="Get Idea"><Icon name="Lightbulb" className="w-5 h-5" /></Button>
                                <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
                                <Button size="icon" variant="subtle" onClick={handleDownload} data-tooltip="Download" aria-label="Download Image"><Icon name="Download" className="w-5 h-5" /></Button>
                                <Button size="icon" variant="subtle" onClick={handleClearCanvas} data-tooltip="Clear Canvas" aria-label="Clear Canvas"><Icon name="Trash2" className="w-5 h-5" /></Button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CalmCanvas;