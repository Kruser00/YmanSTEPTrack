import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { UserProfile, NutrientGoals, DailyLog, FoodItem, MealType, WeeklyProgress, AnalyzedRecipe } from './types';
import { ACTIVITY_LEVELS, GOALS } from './constants';
import { analyzeRecipeWithGemini } from './services/geminiService';
import { fetchFoodByBarcode } from './services/openFoodFactsService';
import jsqr from 'jsqr';


// --- ICONS ---
const DashboardIcon = ({ className = '' }: { className?: string; }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
const DiaryIcon = ({ className = '' }: { className?: string; }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>;
const ChartBarIcon = ({ className = '' }: { className?: string; }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>;
const PlusIcon = ({ className = '' }: { className?: string; }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const CloseIcon = ({ className = '' }: { className?: string; }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const BarcodeIcon = ({ className = '' }: { className?: string; }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5ZM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" /></svg>;
const SparklesIcon = ({ className = '' }: { className?: string; }) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>;

// --- REUSABLE UI COMPONENTS ---
const Button = ({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }: {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    variant?: 'primary' | 'secondary' | 'ghost';
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}) => {
    const base = 'px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
    const variants = {
        primary: 'bg-[#32D74B] text-white hover:bg-green-500 focus:ring-green-400',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
        ghost: 'bg-transparent text-[#32D74B] hover:bg-green-50 dark:hover:bg-green-900/50',
    };
    return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

const Input = ({ id, label, value, onChange, type = 'text', required = false, disabled = false, placeholder, name }: {
    id: string;
    label: string;
    value: string | number;
    onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    type?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    name?: string;
}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        <input id={id} name={name || id} type={type} value={value} onChange={onChange} required={required} disabled={disabled} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#32D74B] focus:border-[#32D74B] dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700/50 disabled:cursor-not-allowed" />
    </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

// --- FEATURE COMPONENTS ---
const BarcodeScanner = ({ onScan, onClose }: { onScan: (code: string) => void; onClose: () => void; }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        let animationFrameId: number;

        const startScan = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute("playsinline", "true"); // Required for iOS
                    videoRef.current.play();
                    animationFrameId = requestAnimationFrame(tick);
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                alert("برای اسکن بارکد، نیاز به دسترسی به دوربین است.");
                onClose();
            }
        };

        const tick = () => {
            if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const canvas = canvasRef.current;
                const video = videoRef.current;
                if (canvas) {
                    const ctx = canvas.getContext('2d');
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsqr(imageData.data, imageData.width, imageData.height);
                    if (code) {
                        onScan(code.data);
                        return; // Stop scanning once a code is found
                    }
                }
            }
            animationFrameId = requestAnimationFrame(tick);
        };

        startScan();

        return () => {
            cancelAnimationFrame(animationFrameId);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [onScan, onClose]);

    return (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 max-w-sm h-32 border-4 border-white/80 rounded-lg shadow-lg" />
            </div>
            <Button onClick={onClose} variant="secondary" className="absolute bottom-8">بستن</Button>
        </div>
    );
};

const RecipeAnalyzer = ({ onAddFood }: { onAddFood: (food: FoodItem) => void; }) => {
    const [recipeText, setRecipeText] = useState('');
    const [result, setResult] = useState<AnalyzedRecipe | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!recipeText.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const analysis = await analyzeRecipeWithGemini(recipeText);
            if (analysis) {
                setResult(analysis);
            } else {
                setError('تحلیل دستور پخت با خطا مواجه شد. لطفا دوباره تلاش کنید.');
            }
        } catch (e) {
            setError('خطای غیرمنتظره در هنگام تحلیل.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddRecipe = () => {
        if (!result) return;
        const foodItem: FoodItem = {
            id: `recipe-${Date.now()}`,
            name: result.foodName,
            calories: result.calories,
            protein: result.protein,
            carbs: result.carbs,
            fat: result.fat,
            servingSize: result.servingSize,
        };
        onAddFood(foodItem);
        setRecipeText('');
        setResult(null);
    };

    return (
        <div className="space-y-4">
            <label htmlFor="recipe" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                دستور پخت یا لیست مواد اولیه را برای تحلیل وارد کنید:
            </label>
            <textarea
                id="recipe"
                rows={6}
                value={recipeText}
                onChange={(e) => setRecipeText(e.target.value)}
                placeholder="مثال: ۱۰۰ گرم سینه مرغ، ۱ پیمانه برنج، ۱ قاشق روغن زیتون"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#32D74B] focus:border-[#32D74B] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <Button onClick={handleAnalyze} disabled={isLoading || !recipeText.trim()} className="w-full">
                <SparklesIcon className="w-5 h-5" />
                {isLoading ? 'در حال تحلیل...' : 'تحلیل با هوش مصنوعی'}
            </Button>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            {result && (
                <div className="p-4 bg-green-50 dark:bg-gray-700/50 rounded-lg space-y-3">
                    <h4 className="font-bold text-lg text-gray-800 dark:text-white">{result.foodName}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">اندازه سروینگ: {result.servingSize}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>کالری:</strong> {result.calories} kcal</p>
                        <p><strong>پروتئین:</strong> {result.protein}g</p>
                        <p><strong>کربوهیدرات:</strong> {result.carbs}g</p>
                        <p><strong>چربی:</strong> {result.fat}g</p>
                    </div>
                    <Button onClick={handleAddRecipe} className="w-full mt-2" variant="secondary">افزودن به وعده</Button>
                </div>
            )}
        </div>
    );
};

const CustomFoodForm = ({ onAddFood }: { onAddFood: (food: FoodItem) => void; }) => {
    const [food, setFood] = useState({ name: '', servingSize: '', calories: '', protein: '', carbs: '', fat: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFood(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newFood: FoodItem = {
            id: `custom-${Date.now()}`,
            name: food.name,
            servingSize: food.servingSize,
            calories: Number(food.calories) || 0,
            protein: Number(food.protein) || 0,
            carbs: Number(food.carbs) || 0,
            fat: Number(food.fat) || 0,
        };
        onAddFood(newFood);
        setFood({ name: '', servingSize: '', calories: '', protein: '', carbs: '', fat: '' });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input id="name" name="name" label="نام غذا" value={food.name} onChange={handleChange} required />
            <Input id="servingSize" name="servingSize" label="اندازه سروینگ" value={food.servingSize} onChange={handleChange} required />
            <div className="grid grid-cols-2 gap-4">
                <Input id="calories" name="calories" label="کالری" type="number" value={food.calories} onChange={handleChange} required />
                <Input id="protein" name="protein" label="پروتئین (g)" type="number" value={food.protein} onChange={handleChange} />
                <Input id="carbs" name="carbs" label="کربوهیدرات (g)" type="number" value={food.carbs} onChange={handleChange} />
                <Input id="fat" name="fat" label="چربی (g)" type="number" value={food.fat} onChange={handleChange} />
            </div>
            <Button type="submit" variant="primary" className="w-full">افزودن غذای سفارشی</Button>
        </form>
    );
};


const AddFoodModal = ({ isOpen, onClose, onAddFood, foodDatabase, onBarcodeClick }: { isOpen: boolean; onClose: () => void; onAddFood: (food: FoodItem) => void; foodDatabase: FoodItem[]; onBarcodeClick: () => void; }) => {
    const [activeTab, setActiveTab] = useState('search');
    const [searchTerm, setSearchTerm] = useState('');
    const filteredFoods = useMemo(() => {
        if (!searchTerm) return [];
        return foodDatabase.filter(food => food.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, foodDatabase]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="افزودن غذا">
            <div className="relative">
                <input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="جستجوی غذا..."
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#32D74B] focus:border-[#32D74B] dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                    onClick={onBarcodeClick}
                    title="اسکن بارکد"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                >
                    <BarcodeIcon className="w-6 h-6" />
                </button>
            </div>
             <div className="border-b border-gray-200 dark:border-gray-700 mt-4 mb-4">
                <nav className="flex space-x-4 space-x-reverse -mb-px overflow-x-auto" aria-label="Tabs">
                    <button onClick={() => setActiveTab('search')} className={`shrink-0 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'search' ? 'border-[#32D74B] text-[#32D74B]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>جستجو</button>
                    <button onClick={() => setActiveTab('recipe')} className={`shrink-0 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'recipe' ? 'border-[#32D74B] text-[#32D74B]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>دستور پخت</button>
                    <button onClick={() => setActiveTab('custom')} className={`shrink-0 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'custom' ? 'border-[#32D74B] text-[#32D74B]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>سفارشی</button>
                    <button onClick={() => setActiveTab('recent')} className={`shrink-0 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'recent' ? 'border-[#32D74B] text-[#32D74B]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>اخیر</button>
                </nav>
            </div>
            <div className="max-h-80 overflow-y-auto">
                {activeTab === 'search' && (
                    <ul className="space-y-2">
                        {filteredFoods.map(food => (
                            <li key={food.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600">
                                <div>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{food.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{food.servingSize} - {food.calories} کالری</p>
                                </div>
                                <Button onClick={() => onAddFood(food)} variant="secondary" className="p-1 h-8 w-8 !rounded-full"><PlusIcon className="w-5 h-5"/></Button>
                            </li>
                        ))}
                    </ul>
                )}
                {activeTab === 'recipe' && <RecipeAnalyzer onAddFood={onAddFood} />}
                {activeTab === 'custom' && <CustomFoodForm onAddFood={onAddFood} />}
                {activeTab === 'recent' && <p className="text-center text-gray-500 py-8">هنوز غذایی اخیراً اضافه نکرده‌اید.</p>}
            </div>
        </Modal>
    );
};

// --- SCREENS ---
const AuthScreen = ({ onLogin }: { onLogin: () => void; }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="w-full max-w-sm p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div>
                <h1 className="text-3xl font-bold text-center text-[#32D74B]">میزان</h1>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">به ردیاب تغذیه خود خوش آمدید</p>
            </div>
            <div className="mt-8 space-y-6">
                <Button onClick={onLogin} variant="primary" className="w-full">ادامه به عنوان مهمان</Button>
            </div>
        </div>
    </div>
);

const DashboardScreen = ({ profile, goals, log, onAddFoodClick }: { profile: UserProfile; goals: NutrientGoals; log: DailyLog; onAddFoodClick: (mealType: MealType) => void; }) => {
    const totals = useMemo(() => {
        let calories = 0, protein = 0, carbs = 0, fat = 0;
        Object.values(log.meals).forEach(meal => meal.forEach(food => {
            calories += food.calories; protein += food.protein; carbs += food.carbs; fat += food.fat;
        }));
        return { calories, protein, carbs, fat };
    }, [log]);
    
    const caloriesLeft = goals.calories - totals.calories;
    const progress = (totals.calories / goals.calories) * 100;
    const today = new Date().toLocaleDateString('fa-IR', { weekday: 'long', day: 'numeric', month: 'long' });

    const getCalorieStyling = (p: number) => {
        if (p >= 95) {
            return {
                gradientUrl: "url(#calorieGradientDanger)",
                textColor: "text-red-500",
            };
        }
        if (p >= 75) {
            return {
                gradientUrl: "url(#calorieGradientWarning)",
                textColor: "text-amber-500",
            };
        }
        return {
            gradientUrl: "url(#calorieGradient)",
            textColor: "text-[#32D74B]",
        };
    };
    const calorieStyling = getCalorieStyling(progress);

    const MacroProgressBar = ({ label, consumed, goal, gradientClass }: { label: string, consumed: number, goal: number, gradientClass: string }) => (
        <div>
            <div className="flex justify-between items-center mb-1 text-sm">
                <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
                <span className="text-gray-500 dark:text-gray-400">{Math.round(consumed)} / {goal}g</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className={`${gradientClass} h-2 rounded-full`} style={{ width: `${goal > 0 ? Math.min((consumed / goal) * 100, 100) : 0}%` }}></div>
            </div>
        </div>
    );

    return (
        <div className="p-4 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">صبح بخیر، {profile.name}!</h1>
                <p className="text-gray-500 dark:text-gray-400">{today}</p>
            </header>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md flex flex-col items-center">
                <div className="relative w-48 h-48">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <defs>
                            <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#4AEB61" />
                                <stop offset="100%" stopColor="#32D74B" />
                            </linearGradient>
                            <linearGradient id="calorieGradientWarning" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#FBBF24" />
                                <stop offset="100%" stopColor="#F59E0B" />
                            </linearGradient>
                            <linearGradient id="calorieGradientDanger" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#F87171" />
                                <stop offset="100%" stopColor="#EF4444" />
                            </linearGradient>
                        </defs>
                        <circle cx="60" cy="60" r="54" fill="none" strokeWidth="12" className="stroke-gray-200 dark:stroke-gray-700" />
                        <circle cx="60" cy="60" r="54" fill="none" stroke={calorieStyling.gradientUrl} strokeWidth="12" strokeDasharray="339.292" strokeDashoffset={339.292 - (progress / 100) * 339.292} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className={`text-3xl font-bold ${calorieStyling.textColor}`}>{Math.round(caloriesLeft)}</span>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">باقیمانده</span>
                    </div>
                </div>
                <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                    <p>{goals.calories} <span className="text-xs">هدف</span> - {totals.calories} <span className="text-xs">غذا</span> + 0 <span className="text-xs">ورزش</span> = {caloriesLeft} <span className="text-xs">باقیمانده</span></p>
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md space-y-4">
                 <MacroProgressBar label="پروتئین" consumed={totals.protein} goal={goals.protein} gradientClass="bg-gradient-to-r from-sky-400 to-blue-500" />
                 <MacroProgressBar label="کربوهیدرات" consumed={totals.carbs} goal={goals.carbs} gradientClass="bg-gradient-to-r from-amber-400 to-orange-500" />
                 <MacroProgressBar label="چربی" consumed={totals.fat} goal={goals.fat} gradientClass="bg-gradient-to-r from-yellow-300 to-yellow-400" />
            </div>

            <div className="space-y-4">
                 {(Object.entries(log.meals) as [MealType, FoodItem[]][]).map(([mealType, meal]) => (
                    <div key={mealType} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">{ {breakfast: 'صبحانه', lunch: 'ناهار', dinner: 'شام', snacks: 'میان‌وعده'}[mealType] }</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{meal.reduce((sum, item) => sum + item.calories, 0)} کالری</span>
                        </div>
                        <div className="space-y-2 mb-3">
                             {meal.map(food => (
                                <div key={food.id} className="flex justify-between items-center text-sm">
                                    <div>
                                        <p className="font-semibold text-gray-700 dark:text-gray-200">{food.name}</p>
                                        <p className="text-gray-500 dark:text-gray-400">{food.servingSize}</p>
                                    </div>
                                    <p className="font-medium text-gray-600 dark:text-gray-300">{food.calories} kcal</p>
                                </div>
                            ))}
                        </div>
                        <Button onClick={() => onAddFoodClick(mealType as MealType)} variant="ghost" className="w-full">افزودن غذا</Button>
                    </div>
                 ))}
            </div>
        </div>
    );
};

const DiaryScreen = ({ log }: { log: DailyLog; }) => (
    <div className="p-4 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">دفترچه خاطرات غذایی</h1>
        {(Object.entries(log.meals) as [MealType, FoodItem[]][]).map(([mealType, meal]) => (
            <div key={mealType} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4 border-b pb-2 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">{ {breakfast: 'صبحانه', lunch: 'ناهار', dinner: 'شام', snacks: 'میان‌وعده'}[mealType] }</h3>
                    <span className="font-semibold text-gray-600 dark:text-gray-300">{meal.reduce((sum, item) => sum + item.calories, 0)} کالری</span>
                </div>
                <div className="space-y-3">
                    {meal.length === 0 ? (
                        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">غذایی برای این وعده ثبت نشده.</p>
                    ) : (
                         meal.map(food => (
                            <div key={food.id} className="flex justify-between items-center text-sm">
                                <div>
                                    <p className="font-semibold text-gray-700 dark:text-gray-200">{food.name}</p>
                                    <p className="text-gray-500 dark:text-gray-400">{food.servingSize}</p>
                                </div>
                                <p className="font-medium text-gray-600 dark:text-gray-300">{food.calories} کالری</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        ))}
    </div>
);

const ProgressScreen = () => {
    const weeklyData: WeeklyProgress[] = [
        { day: 'ش', calories: 1850 }, { day: 'ی', calories: 2100 },
        { day: 'د', calories: 1950 }, { day: 'س', calories: 2200 },
        { day: 'چ', calories: 2050 }, { day: 'پ', calories: 2300 },
        { day: 'ج', calories: 2150 },
    ];
    const maxCalories = Math.max(...weeklyData.map(d => d.calories), 2500);

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">روند پیشرفت</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold mb-4">کالری دریافتی - ۷ روز گذشته</h3>
                <div className="flex justify-between items-end h-48 border-b-2 border-gray-200 dark:border-gray-700 pb-2">
                    {weeklyData.map(item => (
                        <div key={item.day} className="flex flex-col items-center h-full justify-end w-1/7">
                             <div className="w-6 bg-gradient-to-t from-green-400 to-[#32D74B] rounded-t-md" style={{ height: `${(item.calories / maxCalories) * 100}%` }}></div>
                             <span className="text-xs mt-2 text-gray-500 dark:text-gray-400">{item.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">تغییر وزن</h4>
                    <p className="text-2xl font-bold text-[#32D74B]">-۰.۵ کیلوگرم</p>
                 </div>
                 <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300">میانگین هفتگی</h4>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">۲۰۸۵</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">کالری/روز</span>
                 </div>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [foodDatabase, setFoodDatabase] = useState<FoodItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [isFetchingBarcode, setIsFetchingBarcode] = useState(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [activeMealType, setActiveMealType] = useState<MealType>('breakfast');
    const [profile] = useState<UserProfile>({
        name: 'کاربر', age: 30, weight: 70, height: 175,
        gender: 'male', activityLevel: 'moderate', goal: 'maintain',
    });
    const [dailyLog, setDailyLog] = useState<DailyLog>({
        date: new Date().toISOString().split('T')[0],
        meals: { 
            breakfast: [{ id: "12", name: "تخم مرغ آب پز", calories: 78, protein: 6, carbs: 0.6, fat: 5, servingSize: "۱ عدد بزرگ" }], 
            lunch: [{ id: "26", name: "زرشک پلو با مرغ", calories: 600, protein: 40, carbs: 70, fat: 18, servingSize: "۱ پرس" }], 
            dinner: [], 
            snacks: [{ id: "51", name: "شکلات شیری", calories: 210, protein: 3, carbs: 25, fat: 11, servingSize: "۱ بسته (۴۰ گرم)" }] 
        },
    });

    useEffect(() => {
        const fetchFoodData = async () => {
            try {
                const response = await fetch('/foods.json');
                const data: FoodItem[] = await response.json();
                setFoodDatabase(data);
            } catch (error) { console.error("Could not fetch food database:", error); }
        };
        fetchFoodData();
    }, []);

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const nutrientGoals = useMemo<NutrientGoals>(() => {
        const { weight, height, age, gender, activityLevel, goal } = profile;
        const bmr = gender === 'male' ? 10 * weight + 6.25 * height - 5 * age + 5 : 10 * weight + 6.25 * height - 5 * age - 161;
        const tdee = bmr * ACTIVITY_LEVELS[activityLevel].value;
        const goalCalories = tdee + GOALS[goal].modifier;
        return {
            calories: Math.round(goalCalories),
            protein: Math.round((goalCalories * 0.25) / 4),
            carbs: Math.round((goalCalories * 0.45) / 4),
            fat: Math.round((goalCalories * 0.30) / 9),
        };
    }, [profile]);
    
    const handleLogin = () => setIsAuthenticated(true);
    
    const addFoodToMeal = useCallback((food: FoodItem) => {
        setDailyLog(prev => ({ ...prev, meals: { ...prev.meals, [activeMealType]: [...prev.meals[activeMealType], food] } }));
        setIsModalOpen(false);
        setNotification(`${food.name} اضافه شد.`);
    }, [activeMealType]);
    
    const handleAddFoodClick = (mealType: MealType) => {
        setActiveMealType(mealType);
        setIsModalOpen(true);
    };

    const handleBarcodeScan = async (barcode: string) => {
        setIsScannerOpen(false);
        setIsFetchingBarcode(true);
        try {
            const foodItem = await fetchFoodByBarcode(barcode);
            if (foodItem) {
                addFoodToMeal(foodItem);
            } else {
                setNotification('محصول یافت نشد. می‌توانید آن را به صورت دستی اضافه کنید.');
                setIsModalOpen(true); // Re-open modal for manual entry
            }
        } catch (error) {
            setNotification('خطا در جستجوی بارکد.');
        } finally {
            setIsFetchingBarcode(false);
        }
    };
    
    if (!isAuthenticated) return <AuthScreen onLogin={handleLogin} />;

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'diary': return <DiaryScreen log={dailyLog} />;
            case 'progress': return <ProgressScreen />;
            case 'dashboard':
            default: return <DashboardScreen profile={profile} goals={nutrientGoals} log={dailyLog} onAddFoodClick={handleAddFoodClick} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
            <main className="pb-24">{renderCurrentPage()}</main>
            
            <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-40">
                 <button onClick={() => handleAddFoodClick(activeMealType)} className="bg-[#32D74B] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:bg-green-500 transition-transform transform hover:scale-110">
                    <PlusIcon className="w-8 h-8" />
                </button>
            </div>
            
            <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="flex justify-around max-w-md mx-auto">
                    {([['dashboard', 'داشبورد', DashboardIcon], ['diary', 'دفترچه', DiaryIcon], ['progress', 'پیشرفت', ChartBarIcon]] as const).map(([id, label, Icon]) => (
                        <button key={id} onClick={() => setCurrentPage(id)} className={`flex flex-col items-center justify-center p-3 w-full text-sm font-medium transition-colors ${currentPage === id ? 'text-[#32D74B]' : 'text-gray-500 dark:text-gray-400 hover:text-[#32D74B]'}`}>
                            <Icon className="w-6 h-6 mb-1" />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </nav>

            <AddFoodModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAddFood={addFoodToMeal} 
                foodDatabase={foodDatabase}
                onBarcodeClick={() => {
                    setIsModalOpen(false);
                    setIsScannerOpen(true);
                }} 
            />
            {isScannerOpen && <BarcodeScanner onScan={handleBarcodeScan} onClose={() => setIsScannerOpen(false)} />}
            
            {isFetchingBarcode && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-[101] flex justify-center items-center text-white">
                    <div className="bg-gray-800 p-4 rounded-lg flex items-center gap-3">
                         <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         در حال جستجوی بارکد...
                    </div>
                </div>
            )}
            
            {notification && (
                 <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-[102] animate-pulse">
                    {notification}
                </div>
            )}
        </div>
    );
}