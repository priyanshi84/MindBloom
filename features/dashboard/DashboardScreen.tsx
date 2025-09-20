import React, { useState, useMemo } from 'react';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { MoodEntry, Page, PageProps } from '../../types';
import MoodChart from './MoodChart';

const moodOptions = [
  { level: 9, emoji: '😄', label: 'Happy', color: 'bg-green-500', darkColor: 'dark:bg-green-500', gradientClass: 'bg-gradient-to-br from-green-400 to-green-500' },
  { level: 8, emoji: '😊', label: 'Proud', color: 'bg-lime-500', darkColor: 'dark:bg-lime-500', gradientClass: 'bg-gradient-to-br from-lime-400 to-lime-500' },
  { level: 7, emoji: '🙏', label: 'Grateful', color: 'bg-sky-500', darkColor: 'dark:bg-sky-500', gradientClass: 'bg-gradient-to-br from-sky-400 to-sky-500' },
  { level: 6, emoji: '🙂', label: 'Calm', color: 'bg-emerald-500', darkColor: 'dark:bg-emerald-500', gradientClass: 'bg-gradient-to-br from-emerald-400 to-emerald-500' },
  { level: 5, emoji: '😐', label: 'Okay', color: 'bg-amber-500', darkColor: 'dark:bg-amber-500', gradientClass: 'bg-gradient-to-br from-amber-400 to-amber-500' },
  { level: 4, emoji: '🥱', label: 'Tired', color: 'bg-slate-500', darkColor: 'dark:bg-slate-500', gradientClass: 'bg-gradient-to-br from-slate-400 to-slate-500' },
  { level: 3, emoji: '😟', label: 'Anxious', color: 'bg-orange-500', darkColor: 'dark:bg-orange-500', gradientClass: 'bg-gradient-to-br from-orange-400 to-orange-500' },
  { level: 2, emoji: '😫', label: 'Stressed', color: 'bg-red-600', darkColor: 'dark:bg-red-600', gradientClass: 'bg-gradient-to-br from-red-500 to-red-600' },
  { level: 1, emoji: '😔', label: 'Sad', color: 'bg-red-500', darkColor: 'dark:bg-red-500', gradientClass: 'bg-gradient-to-br from-red-400 to-red-500' },
];

const MoodCalendar: React.FC<{ entries: MoodEntry[], onDayClick: (entry: MoodEntry) => void }> = ({ entries, onDayClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const entriesByDate = useMemo(() => {
        const map = new Map<string, MoodEntry>();
        entries.forEach(entry => map.set(entry.date, entry));
        return map;
    }, [entries]);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const blanks = Array(startDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
    };

    return (
        <Card className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-100" aria-label="Previous month">&lt;</button>
                <h3 className="font-bold text-lg">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-100" aria-label="Next month">&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 md:gap-2">
                {blanks.map((_, i) => <div key={`blank-${i}`} />)}
                {days.map(day => {
                    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const entry = entriesByDate.get(dateStr);
                    const moodInfo = entry ? moodOptions.find(m => m.level === entry.level) : null;
                    const isToday = new Date().toDateString() === new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
                    return (
                        <div key={day} onClick={() => entry && onDayClick(entry)} className={`w-full aspect-square flex items-center justify-center rounded-full transition-all duration-200 ${entry ? 'cursor-pointer hover:ring-2 ring-violet-400 ring-offset-2' : ''}`}>
                            <div className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-transform duration-200 ${entry ? 'hover:scale-110' : ''} ${isToday && !entry ? 'bg-slate-200' : ''} ${moodInfo ? `${moodInfo.gradientClass} text-white shadow-md` : 'text-slate-700'}`}>
                                {entry ? <span className="text-3xl">{moodInfo?.emoji}</span> : day}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
};


const DashboardScreen: React.FC<PageProps> = ({ setActivePage }) => {
  const [moodHistory] = useLocalStorage<MoodEntry[]>('moodHistory', []);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);

  const moodCounts = useMemo(() => {
    const counts = moodOptions.map(option => ({...option, count: 0}));
    moodHistory.forEach(entry => {
      const mood = counts.find(c => c.level === entry.level);
      if (mood) mood.count++;
    });
    return counts;
  }, [moodHistory]);
  
  const totalEntries = moodHistory.length;

  const currentStreak = useMemo(() => {
    if (moodHistory.length === 0) return 0;
    const uniqueDates = [...new Set(moodHistory.map(e => e.date))].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    if (uniqueDates.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const firstDate = new Date(uniqueDates[0] + 'T00:00:00');
    if (firstDate.toDateString() === today.toDateString() || firstDate.toDateString() === yesterday.toDateString()) {
      streak = 1;
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const currentDate = new Date(uniqueDates[i] + 'T00:00:00');
        const previousDate = new Date(uniqueDates[i+1] + 'T00:00:00');
        const diffDays = (currentDate.getTime() - previousDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays === 1) streak++;
        else break;
      }
    }
    return streak;
  }, [moodHistory]);

  const mostFrequentMood = useMemo(() => {
    if (totalEntries === 0) return null;
    return moodCounts.reduce((prev, current) => (prev.count > current.count) ? prev : current);
  }, [moodCounts, totalEntries]);


  return (
    <>
      <header className="p-4 md:p-6 lg:p-8 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Icon name="ChartBar" className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Your Dashboard</h1>
            <p className="text-slate-500 mt-1">Reflect on your emotional journey.</p>
          </div>
        </div>
      </header>
      
      <div className="p-4 md:p-6 lg:p-8 space-y-6">
        <button
            onClick={() => setActivePage(Page.Today)}
            className="inline-flex items-center gap-1 text-slate-500 hover:bg-slate-200/60 rounded-md p-2 -ml-2"
            aria-label="Go back"
        >
            <Icon name="ArrowLeft" className="w-5 h-5" />
            <span>Back</span>
        </button>
        
        <div>
            <h2 className="text-xl font-bold mb-4">At a Glance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
                        <Icon name="CheckCircle" className="w-7 h-7 text-violet-600" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{totalEntries}</p>
                        <p className="text-sm text-slate-500">Total Check-ins</p>
                    </div>
                </Card>
                 <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Icon name="TrendingUp" className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-3xl font-bold">{currentStreak}</p>
                        <p className="text-sm text-slate-500">Current Streak</p>
                    </div>
                </Card>
                 <Card className="p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center">
                        {mostFrequentMood ? <span className="text-4xl">{mostFrequentMood.emoji}</span> : <Icon name="Flower" className="w-7 h-7 text-sky-600" />}
                    </div>
                    <div>
                        <p className="text-lg font-bold">{mostFrequentMood ? mostFrequentMood.label : 'N/A'}</p>
                        <p className="text-sm text-slate-500">Frequent Mood</p>
                    </div>
                </Card>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
             <MoodCalendar entries={moodHistory} onDayClick={setSelectedEntry} />
          </div>
          <div className="lg:col-span-2">
            <Card className="p-4 md:p-6 h-full">
                <h3 className="font-bold mb-4 text-lg">Mood Breakdown</h3>
                <div className="space-y-3">
                    {moodCounts
                        .sort((a, b) => b.count - a.count || b.level - a.level)
                        .map(mood => (
                            <div key={mood.level}>
                                <div className="flex justify-between items-center text-sm mb-1.5">
                                    <span className="font-medium flex items-center">{mood.emoji}<span className="ml-2">{mood.label}</span></span>
                                    <span className="text-slate-500 font-semibold">{`${mood.count} (${totalEntries > 0 ? Math.round((mood.count / totalEntries) * 100) : 0}%)`}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5">
                                    <div className={`${mood.gradientClass} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${totalEntries > 0 ? (mood.count / totalEntries) * 100 : 0}%` }}></div>
                                </div>
                            </div>
                        ))}
                </div>
            </Card>
          </div>
        </div>
        <div className="mt-6">
          <MoodChart data={moodHistory} />
        </div>
      </div>
      
      {selectedEntry && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedEntry(null)}>
            <Card className="max-w-md w-full p-0 overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className={`p-4 ${moodOptions.find(m => m.level === selectedEntry.level)?.gradientClass} text-white flex justify-between items-center`}>
                    <div>
                        <h2 className="font-bold">{new Date(selectedEntry.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-3xl">{moodOptions.find(m => m.level === selectedEntry.level)?.emoji}</span>
                            <span className="font-semibold text-xl">{moodOptions.find(m => m.level === selectedEntry.level)?.label}</span>
                        </div>
                    </div>
                     <button onClick={() => setSelectedEntry(null)} className="p-1 rounded-full text-white/70 hover:bg-black/20">
                        <Icon name="XCircle" className="w-6 h-6" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="max-h-60 overflow-y-auto space-y-4 -mr-2 pr-2">
                        {selectedEntry.photo && <img src={selectedEntry.photo} alt="Mood" className="rounded-lg object-cover w-full" />}
                        {selectedEntry.audio && (
                            <div>
                                <h4 className="text-sm font-semibold text-slate-600 mb-1">Voice Note</h4>
                                <audio src={selectedEntry.audio} controls className="w-full h-10" />
                            </div>
                        )}
                        {selectedEntry.note && (
                           <div>
                                <h4 className="text-sm font-semibold text-slate-600 mb-1">Journal Entry</h4>
                                <div className="bg-slate-100 p-3 rounded-xl">
                                    <p className="whitespace-pre-wrap text-slate-700 italic">"{selectedEntry.note}"</p>
                                </div>
                           </div>
                        )}
                        {!selectedEntry.note && !selectedEntry.photo && !selectedEntry.audio && <p className="text-slate-500 italic text-center py-4">No note, photo, or voice note was added.</p>}
                    </div>
                </div>
            </Card>
        </div>
      )}
    </>
  );
};

export default DashboardScreen;