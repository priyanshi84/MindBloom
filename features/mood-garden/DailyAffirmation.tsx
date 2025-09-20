import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { getDailyAffirmation } from '../../services/geminiService';

const DailyAffirmation = () => {
    const [affirmation, setAffirmation] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAffirmation = async () => {
            const today = new Date().toISOString().split('T')[0];
            const storedData = localStorage.getItem('dailyAffirmation');
            if (storedData) {
                const { date, text } = JSON.parse(storedData);
                if (date === today) {
                    setAffirmation(text);
                    setIsLoading(false);
                    return;
                }
            }

            try {
                const newAffirmation = await getDailyAffirmation();
                setAffirmation(newAffirmation);
                localStorage.setItem('dailyAffirmation', JSON.stringify({ date: today, text: newAffirmation }));
            } catch (error) {
                console.error("Failed to fetch daily affirmation:", error);
                setAffirmation("Be kind to your mind today."); // Fallback
            } finally {
                setIsLoading(false);
            }
        };

        fetchAffirmation();
    }, []);

    return (
        <Card className="mb-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 border-violet-200/50">
            <div className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 flex-shrink-0 bg-white/50 rounded-lg flex items-center justify-center shadow-inner-white">
                    <Icon name="Sparkles" className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                    <h3 className="font-semibold text-slate-800">Your Daily Affirmation</h3>
                    {isLoading ? (
                        <p className="text-violet-800 italic">Finding some inspiration for you...</p>
                    ) : (
                        <p className="text-violet-800 font-medium animate-fade-in">"{affirmation}"</p>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default DailyAffirmation;