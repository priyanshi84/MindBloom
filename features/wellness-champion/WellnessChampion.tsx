import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { Icon } from '../../components/Icon';
import { useToast } from '../../hooks/useToast';

// New visual components for the redesigned screen
const ChampionProgressBar: React.FC<{ progress: number; text: string }> = ({ progress, text }) => (
  <div className="bg-slate-200 rounded-full h-5 relative overflow-hidden shadow-inner">
    <div
      className="bg-gradient-to-r from-purple-400 to-fuchsia-500 h-full rounded-full transition-all duration-500 ease-out"
      style={{ width: `${progress}%` }}
    />
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-xs font-bold text-white mix-blend-lighten">{text}</span>
    </div>
  </div>
);

const SpecialBloom: React.FC<{ unlocked: boolean }> = ({ unlocked }) => (
  <div className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 ${unlocked ? '' : 'grayscale opacity-60'}`}>
    <div className={`w-full h-full rounded-full bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-500 relative flex items-center justify-center shadow-lg ${unlocked ? 'animate-pulse-glow-slow' : 'shadow-none'}`}>
      <Icon name="Sparkles" className="w-12 h-12 text-white/80" />
    </div>
  </div>
);

const WellnessChampion: React.FC = () => {
  const [referralCode, setReferralCode] = useState('');
  const [friendsReferred, setFriendsReferred] = useState(1); // Start with one for demo
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let code = 'MB-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setReferralCode(code);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Your referral code is on your clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const message = `I'm using MindBloom, a private mental wellness app for Indian students. It's confidential and helps manage stress. Join with my code: ${referralCode}`;
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const requiredFriends = 3;
  const progress = Math.min((friendsReferred / requiredFriends) * 100, 100);
  const bloomsUnlocked = friendsReferred >= requiredFriends;

  return (
    <>
      <div className="text-center">
        <p className="mt-2 text-slate-600">Share MindBloom with {requiredFriends} friends. When they check in, you'll earn a unique, radiant bloom in your garden that only Champions can grow.</p>
      </div>

      <div className="mt-8 space-y-8">
        {/* Share Section */}
        <div>
            <h3 className="font-semibold text-center mb-4 text-slate-700">Share your unique code</h3>
            <div className="bg-slate-100 p-4 rounded-xl flex items-center gap-3">
                <p className="flex-1 text-center font-mono text-2xl tracking-widest text-purple-600">{referralCode}</p>
                <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Copy referral code">
                    {copied ? <Icon name="CheckCircle" className="w-5 h-5 text-green-500" /> : <Icon name="Copy" className="w-5 h-5" />}
                </Button>
            </div>
              <Button variant="primary" className="w-full mt-3" onClick={shareViaWhatsApp}><Icon name="Share2" className="w-4 h-4 mr-2" />Share on WhatsApp</Button>
        </div>

        {/* Progress Section */}
        <div>
            <h3 className="font-semibold text-center mb-4 text-slate-700">Track Your Progress</h3>
            <ChampionProgressBar progress={progress} text={`${friendsReferred} of ${requiredFriends} friends joined`} />
            <p className="text-xs text-center text-slate-500 mt-2">Progress updates when a friend checks in for the first time.</p>
        </div>
        
        {/* Reward Section */}
        <div>
            <h3 className="font-semibold text-center mb-4 text-slate-700">Your Reward: A Special Bloom</h3>
            <div className="flex justify-center">
              <SpecialBloom unlocked={bloomsUnlocked} />
            </div>
            <p className="text-center text-slate-600 mt-3 font-medium">
              {bloomsUnlocked ? "You've unlocked a special bloom!" : 'Your special bloom is waiting to be unlocked.'}
            </p>
        </div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-600 flex items-center justify-center gap-2 bg-slate-100 p-3 rounded-2xl shadow-sm">
          <Icon name="CheckCircle" className="w-5 h-5 text-purple-600 flex-shrink-0"/>
          <span className="font-semibold">Privacy First:</span> Friends never know who referred them.
        </p>
      </div>
    </>
  );
};

export default WellnessChampion;
