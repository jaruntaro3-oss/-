/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Sparkles, RotateCcw, Play, Info, Home, Copy, Camera, Download, Loader2, BrainCircuit, ThumbsUp, ThumbsDown, Palette } from 'lucide-react';
import { toPng } from 'html-to-image';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface TarotCard {
  name: string;
  emoji: string;
  img: string;
  meaning: string;
  category: 'LOVE' | 'WORK' | 'GENERAL';
}

const TAROT_DATA: TarotCard[] = [
  // GENERAL / MAJOR ARCANA
  { 
    name: "The Sun (ดวงอาทิตย์)", 
    emoji: "☀️", 
    img: "https://upload.wikimedia.org/wikipedia/commons/1/17/RWS_Tarot_19_Sun.jpg",
    meaning: "สำเร็จขั้นสุด! ปัญหาจะคลี่คลาย มีโชคลาภแบบจึ้งๆ เข้ามาแน่นอนครับ",
    category: 'GENERAL'
  },
  { 
    name: "The Moon (ดวงจันทร์)", 
    emoji: "🌙", 
    img: "https://upload.wikimedia.org/wikipedia/commons/7/7f/RWS_Tarot_18_Moon.jpg",
    meaning: "ช่วงนี้สถานการณ์ยังไม่นิ่งครับ มีเรื่องที่คุณยังไม่รู้ หรือมีความกังวลซ่อนอยู่",
    category: 'GENERAL'
  },
  { 
    name: "The Star (ดวงดาว)", 
    emoji: "⭐", 
    img: "https://upload.wikimedia.org/wikipedia/commons/d/db/RWS_Tarot_17_Star.jpg",
    meaning: "ความหวังเป็นจริงแล้ว! สิ่งที่คุณรอคอยจะค่อยๆ ดีขึ้นอย่างใจเย็น",
    category: 'GENERAL'
  },
  { 
    name: "The Wheel of Fortune", 
    emoji: "🎡", 
    img: "https://upload.wikimedia.org/wikipedia/commons/3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg",
    meaning: "ดวงกำลังเปลี่ยน! โชคชะตาเข้าข้างคุณแล้ว อะไรที่เคยแย่จะกลับมาดีแบบฉ่ำๆ",
    category: 'GENERAL'
  },
  { 
    name: "The World (โลก)", 
    emoji: "🌍", 
    img: "https://upload.wikimedia.org/wikipedia/commons/f/ff/RWS_Tarot_21_World.jpg",
    meaning: "ความสมบูรณ์แบบมาถึงแล้ว! สิ่งที่เหนื่อยมาจะคุ้มค่า ได้เวลาฉลองครับ!",
    category: 'GENERAL'
  },

  // LOVE / CUPS
  { 
    name: "The Lovers (คู่รัก)", 
    emoji: "💖", 
    img: "https://upload.wikimedia.org/wikipedia/commons/3/3a/RWS_Tarot_06_Lovers.jpg",
    meaning: "เสน่ห์แรงมาก! มีเกณฑ์พบรักหรือการตัดสินใจที่แฮปปี้สุดๆ ความสัมพันธ์นี้มีเกณฑ์สมหวังสูงมาก!",
    category: 'LOVE'
  },
  { 
    name: "Ace of Cups (1 ถ้วย)", 
    emoji: "🍷", 
    img: "https://upload.wikimedia.org/wikipedia/commons/3/36/Cups01.jpg",
    meaning: "เริ่มต้นความรู้สึกใหม่ๆ มีคนหยิบยื่นไมตรีมาให้ หรือความรักครั้งใหม่กำลังจะผลิบาน",
    category: 'LOVE'
  },
  { 
    name: "Two of Cups (2 ถ้วย)", 
    emoji: "🥂", 
    img: "https://upload.wikimedia.org/wikipedia/commons/f/f8/Cups02.jpg",
    meaning: "ความเข้าใจที่ตรงกัน การพบเนื้อคู่ หรือการตกลงปลงใจที่ลงตัวสุดๆ",
    category: 'LOVE'
  },
  { 
    name: "Ten of Cups (10 ถ้วย)", 
    emoji: "🌈", 
    img: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Cups10.jpg",
    meaning: "ความสุขในครอบครัว ความรักที่สมบูรณ์แบบและมั่นคง ทุกคนรอบข้างแฮปปี้",
    category: 'LOVE'
  },

  // WORK & FINANCE / PENTACLES & WANDS
  { 
    name: "Ace of Pentacles (1 เหรียญ)", 
    emoji: "💰", 
    img: "https://upload.wikimedia.org/wikipedia/commons/2/27/Pents01.jpg",
    meaning: "โอกาสทางการเงินก้อนใหญ่มาถึงแล้ว! การเริ่มต้นธุรกิจหรือการลงทุนจะให้ผลตอบแทนดีเยี่ยม",
    category: 'WORK'
  },
  { 
    name: "Ten of Pentacles (10 เหรียญ)", 
    emoji: "🏦", 
    img: "https://upload.wikimedia.org/wikipedia/commons/d/de/Pents10.jpg",
    meaning: "ความมั่งคั่งร่ำรวย ความมั่นคงในระยะยาว มีเกณฑ์ได้รับมรดกหรือเงินก้อนโตจากครอบครัว",
    category: 'WORK'
  },
  { 
    name: "Ace of Wands (1 ไม้เท้า)", 
    emoji: "🪄", 
    img: "https://upload.wikimedia.org/wikipedia/commons/1/11/Wands01.jpg",
    meaning: "ไอเดียใหม่ๆ พุ่งพล่าน! การเริ่มต้นงานใหม่หรือโปรเจกต์ใหม่จะประสบความสำเร็จอย่างรวดเร็ว",
    category: 'WORK'
  },
  { 
    name: "Eight of Wands (8 ไม้เท้า)", 
    emoji: "🚀", 
    img: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Wands08.jpg",
    meaning: "ทุกอย่างจะดำเนินไปอย่างรวดเร็ว! ข่าวดีเรื่องงานกำลังเดินทางมาถึงคุณแบบติดสปีด",
    category: 'WORK'
  }
];

type ViewState = 'HOME' | 'READING' | 'ABOUT';
type Topic = 'LOVE' | 'WORK' | 'GENERAL';
type ReadingStyle = 'GENZ' | 'NORMAL';
type Theme = 'Y2K' | 'PASTEL';

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [theme, setTheme] = useState<Theme>('Y2K');
  const [topic, setTopic] = useState<Topic>('GENERAL');
  const [readingStyle, setReadingStyle] = useState<ReadingStyle>('GENZ');
  const [cardCount, setCardCount] = useState<number>(1);
  const [question, setQuestion] = useState('');
  const [dob, setDob] = useState('');
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [aiReading, setAiReading] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<'UP' | 'DOWN' | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('คัดลอกลิงก์เว็บ');
  const [isDownloading, setIsDownloading] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const handleCardClick = async () => {
    if (!question.trim()) {
      setError('กรุณาพิมพ์คำถามก่อนเลือกไพ่นะครับ เพื่อความแม่นยำ!');
      return;
    }
    setError('');
    
    // Filter cards by topic
    const pool = TAROT_DATA.filter(c => c.category === topic || c.category === 'GENERAL');
    
    // Draw multiple unique cards
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const drawn = shuffled.slice(0, cardCount);
    
    setSelectedCards(drawn);
    setIsRevealed(true);
    setIsGenerating(true);

    try {
      const model = "gemini-3-flash-preview";
      const cardsList = drawn.map((c, i) => `ใบที่ ${i+1}: ${c.name}`).join(', ');
      const topicText = topic === 'LOVE' ? 'ความรักและความรู้สึก' : topic === 'WORK' ? 'การงานและการเงิน' : 'ทั่วไป';
      const dobInfo = dob ? `วันเดือนปีเกิดของผู้ถาม: ${dob}` : 'ไม่ได้ระบุวันเกิด';
      
      const stylePrompt = readingStyle === 'GENZ' 
        ? `คุณคือหมอดูไพ่ยิปซีชายสไตล์ Y2K ที่มีความแม่นยำและทันสมัย (ใช้ภาษาวัยรุ่นผู้ชาย มีความจึ้งๆ ฉ่ำๆ แต่สุภาพแบบพี่ชาย/เพื่อนชาย ใช้คำลงท้ายว่า "ครับ" หรือ "ผม" เป็นหลัก)`
        : `คุณคือหมอดูไพ่ยิปซีมืออาชีพที่ใช้ภาษาที่เป็นทางการ สุภาพ และเข้าใจง่าย (ภาษาปกติ ไม่ใช้ศัพท์วัยรุ่น)`;

      const prompt = `${stylePrompt}
      คำถามของลูกค้าคือ: "${question}"
      หัวข้อที่เลือก: ${topicText}
      ${dobInfo}
      ไพ่ที่สุ่มได้ (${cardCount} ใบ): ${cardsList}
      
      กรุณาวิเคราะห์ไพ่เหล่านี้ให้สอดคล้องกับคำถามและพื้นดวง (ถ้ามีวันเกิด) ของลูกค้าโดยเฉพาะ 
      - ถ้ามี 1 ใบ ให้เน้นคำตอบที่ชัดเจน
      - ถ้ามี 3 ใบ ให้วิเคราะห์เป็น อดีต/ปัจจุบัน/อนาคต หรือ สถานการณ์/ปัญหา/ทางออก
      - ถ้ามี 5 ใบ ให้วิเคราะห์ภาพรวมอย่างละเอียด
      
      ตอบเป็นภาษาไทยที่อ่านง่าย และให้กำลังใจ (ไม่ต้องใส่ Markdown หนาๆ เยอะเกินไป เอาแบบอ่านในแอปสวยๆ)`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
      });

      setAiReading(response.text || 'ขออภัยครับ จิตสัมผัสขัดข้องชั่วคราว ลองใหม่อีกครั้งนะแม่!');
    } catch (err) {
      console.error('AI Generation Error:', err);
      setAiReading('อุ๊ย! ระบบขัดข้อง สงสัยดวงจะแรงเกินไป ลองกดถามใหม่อีกรอบนะจ๊ะ');
    } finally {
      setIsGenerating(false);
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  const reset = () => {
    setQuestion('');
    setDob('');
    setSelectedCards([]);
    setAiReading('');
    setFeedback(null);
    setIsRevealed(false);
    setError('');
    setCopyStatus('คัดลอกลิงก์เว็บ');
  };

  const shareToLine = () => {
    if (selectedCards.length === 0) return;
    const disclaimer = "\n\n*โปรดใช้วิจารณญาณในการดูไพ่ ไพ่ไม่สามารถกำหนดชีวิตเราได้ ให้เราใช้ชีวิตปกติได้เลย ดูเพื่อเป็นแนวทาง หรือดูเอาสนุก*";
    const text = `🔮 REAL TAROT Y2K\nคำถาม: ${question}\n\nคำทำนายจาก AI:\n${aiReading}${disclaimer}\n\nดูดวงแม่นๆ ได้ที่นี่!`;
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopyStatus('คัดลอกแล้ว! ✅');
    setTimeout(() => setCopyStatus('คัดลอกลิงก์เว็บ'), 2000);
  };

  const shareToStory = () => {
    if (selectedCards.length === 0) return;
    const disclaimer = "\n\n*โปรดใช้วิจารณญาณในการดูไพ่ ไพ่ไม่สามารถกำหนดชีวิตเราได้ ให้เราใช้ชีวิตปกติได้เลย ดูเพื่อเป็นแนวทาง หรือดูเอาสนุก*";
    const text = `🔮 REAL TAROT Y2K\n\nคำถาม: ${question}\n\nคำทำนาย:\n${aiReading}${disclaimer}`;
    navigator.clipboard.writeText(text);
    alert('คัดลอกคำทำนาย AI แล้ว! นำไปวางใน Story ได้เลย ✨');
  };

  const downloadResultAsImage = async () => {
    if (!captureRef.current) return;
    
    setIsDownloading(true);
    try {
      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataUrl = await toPng(captureRef.current, {
        cacheBust: true,
        backgroundColor: theme === 'Y2K' ? '#050505' : '#fdfdfd', 
        style: {
          borderRadius: '0', 
        }
      });
      
      const link = document.createElement('a');
      link.download = `y2k-tarot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to capture image:', err);
      alert('ไม่สามารถบันทึกรูปภาพได้ในขณะนี้ กรุณาลองใหม่อีกครั้งครับ');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className={`relative flex flex-col items-center min-h-screen overflow-x-hidden py-10 px-4 transition-colors duration-500 ${
      theme === 'Y2K' ? 'bg-dark-bg text-white' : 'bg-pastel-bg text-pastel-text'
    }`}>
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setTheme(prev => prev === 'Y2K' ? 'PASTEL' : 'Y2K')}
          className={`p-3 rounded-full shadow-lg transition-all active:scale-90 flex items-center gap-2 font-bold text-xs uppercase tracking-widest ${
            theme === 'Y2K' 
              ? 'bg-y2k-blue text-dark-blue hover:bg-white' 
              : 'bg-pastel-pink text-white hover:bg-pastel-blue'
          }`}
        >
          <Palette size={18} />
          {theme === 'Y2K' ? 'Y2K MODE' : 'PASTEL MODE'}
        </button>
      </div>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {theme === 'Y2K' ? (
          <div className="absolute -top-1/4 -left-1/4 text-[80vw] text-y2k-blue/5 leading-none">
            ★
          </div>
        ) : (
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-64 h-64 bg-pastel-pink rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-pastel-blue rounded-full blur-3xl" />
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === 'HOME' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="flex flex-col items-center justify-center flex-1 max-w-2xl w-full text-center space-y-12"
                >
                  <div className="space-y-4">
                    <motion.h1 
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`text-6xl md:text-8xl font-bold uppercase tracking-[0.15em] italic ${
                        theme === 'Y2K' ? 'y2k-text-shadow' : 'text-pastel-pink drop-shadow-sm'
                      }`}
                    >
                      REAL TAROT
                    </motion.h1>
                    <p className={`text-2xl md:text-3xl font-light flex items-center justify-center gap-2 ${
                      theme === 'Y2K' ? 'text-y2k-blue' : 'text-pastel-blue'
                    }`}>
                      <Sparkles className={theme === 'Y2K' ? 'text-y2k-pink' : 'text-pastel-pink'} />
                      แม่นจนตัวแม่ต้องแคร์
                      <Sparkles className={theme === 'Y2K' ? 'text-y2k-pink' : 'text-pastel-pink'} />
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
                    <button
                      onClick={() => setView('READING')}
                      className={`group relative py-6 px-8 text-3xl font-bold rounded-full transition-all active:scale-95 flex items-center justify-center gap-4 overflow-hidden ${
                        theme === 'Y2K' 
                          ? 'bg-white text-dark-blue hover:bg-y2k-blue hover:text-white y2k-shadow' 
                          : 'bg-pastel-pink text-white hover:bg-pastel-blue shadow-md'
                      }`}
                    >
                      <Play className="fill-current" />
                      เริ่มดูดวง
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    </button>

                    <button
                      onClick={() => setView('ABOUT')}
                      className={`py-4 px-8 text-xl font-bold rounded-full transition-all active:scale-95 flex items-center justify-center gap-3 ${
                        theme === 'Y2K' 
                          ? 'bg-dark-blue/50 border-2 border-y2k-blue text-y2k-blue hover:bg-y2k-blue hover:text-white' 
                          : 'bg-white border-2 border-pastel-blue text-pastel-blue hover:bg-pastel-blue hover:text-white'
                      }`}
                    >
                      <Info />
                      วิธีใช้งาน
                    </button>
                  </div>

                  <div className={`p-6 rounded-3xl border text-sm opacity-80 ${
                    theme === 'Y2K' ? 'glass border-white/10' : 'bg-white border-pastel-pink/20 shadow-sm'
                  }`}>
                    <p>✨ สุ่มไพ่รายวัน ✨ ถามคำถามที่ติดค้างในใจ ✨ แชร์คำทำนายลงโซเชียล ✨</p>
                  </div>
                </motion.div>
        )}

        {view === 'READING' && (
          <motion.div
            key="reading"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="w-full max-w-2xl space-y-8"
          >
            <header className="flex items-center justify-between mb-4">
              <button 
                onClick={() => { setView('HOME'); reset(); }}
                className={`p-3 rounded-full transition-colors ${
                  theme === 'Y2K' ? 'bg-white/10 hover:bg-white/20 text-y2k-blue' : 'bg-pastel-blue/20 hover:bg-pastel-blue/40 text-pastel-text'
                }`}
              >
                <Home size={24} />
              </button>
              <h1 className={`text-3xl font-bold uppercase tracking-widest italic ${
                theme === 'Y2K' ? 'y2k-text-shadow' : 'text-pastel-pink'
              }`}>🔮 ถามไพ่</h1>
              <div className="w-12" />
            </header>

            <AnimatePresence mode="wait">
              {!isRevealed ? (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <div className={`border-2 rounded-3xl p-6 space-y-6 ${
                    theme === 'Y2K' ? 'glass border-y2k-blue y2k-shadow' : 'bg-white border-pastel-blue shadow-sm'
                  }`}>
                    <div>
                      <label className={`block text-lg mb-2 font-bold ${
                        theme === 'Y2K' ? 'text-y2k-blue' : 'text-pastel-text'
                      }`}>
                        1. เลือกหัวข้อที่คุณต้องการถาม:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['GENERAL', 'LOVE', 'WORK'] as Topic[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTopic(t)}
                            className={`py-2 px-1 rounded-xl text-sm font-bold transition-all ${
                              topic === t 
                                ? (theme === 'Y2K' ? 'bg-y2k-blue text-dark-blue scale-105' : 'bg-pastel-blue text-white scale-105')
                                : (theme === 'Y2K' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200')
                            }`}
                          >
                            {t === 'GENERAL' ? 'ทั่วไป' : t === 'LOVE' ? 'ความรัก' : 'การงาน'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-lg mb-2 font-bold ${
                        theme === 'Y2K' ? 'text-y2k-blue' : 'text-pastel-text'
                      }`}>
                        2. เลือกสไตล์การทำนาย:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['GENZ', 'NORMAL'] as ReadingStyle[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => setReadingStyle(s)}
                            className={`py-2 px-4 rounded-xl text-sm font-bold transition-all ${
                              readingStyle === s 
                                ? (theme === 'Y2K' ? 'bg-y2k-pink text-white scale-105 shadow-[0_0_10px_var(--color-y2k-pink)]' : 'bg-pastel-pink text-white scale-105 shadow-sm')
                                : (theme === 'Y2K' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200')
                            }`}
                          >
                            {s === 'GENZ' ? 'วัยรุ่น Y2K (ชาย)' : 'ภาษาทางการ/ปกติ'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-lg mb-2 font-bold ${
                        theme === 'Y2K' ? 'text-y2k-blue' : 'text-pastel-text'
                      }`}>
                        3. เลือกจำนวนไพ่:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 3, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setCardCount(n)}
                            className={`py-2 px-4 rounded-xl text-lg font-bold transition-all ${
                              cardCount === n 
                                ? (theme === 'Y2K' ? 'bg-y2k-pink text-white scale-105 shadow-[0_0_10px_var(--color-y2k-pink)]' : 'bg-pastel-pink text-white scale-105 shadow-sm')
                                : (theme === 'Y2K' ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200')
                            }`}
                          >
                            {n} ใบ
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={`block text-lg mb-2 font-bold ${
                        theme === 'Y2K' ? 'text-y2k-blue' : 'text-pastel-text'
                      }`}>
                        4. วันเดือนปีเกิด (ใส่เพื่อความแม่นยำยิ่งขึ้น ✨):
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className={`w-full border-b-2 p-4 rounded-xl outline-none transition-colors text-lg appearance-none ${
                          theme === 'Y2K' 
                            ? 'bg-black/40 border-y2k-blue text-white focus:border-y2k-pink' 
                            : 'bg-gray-50 border-pastel-blue text-pastel-text focus:border-pastel-pink'
                        }`}
                      />
                    </div>

                    <div>
                      <label className={`block text-lg mb-2 font-bold ${
                        theme === 'Y2K' ? 'text-y2k-blue' : 'text-pastel-text'
                      }`}>
                        5. พิมพ์คำถามของคุณ:
                      </label>
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="เช่น ช่วงนี้จะรวยไหม?, เขาคิดยังไงกับเรา?"
                        className={`w-full border-b-2 p-4 rounded-xl outline-none transition-colors text-lg ${
                          theme === 'Y2K' 
                            ? 'bg-black/40 border-y2k-pink text-white focus:border-y2k-blue' 
                            : 'bg-gray-50 border-pastel-pink text-pastel-text focus:border-pastel-blue'
                        }`}
                      />
                      {error && <p className="mt-2 text-y2k-pink text-sm font-bold">{error}</p>}
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <div className={`font-bold text-xl flex items-center justify-center gap-2 ${
                      theme === 'Y2K' ? 'text-y2k-blue' : 'text-pastel-blue'
                    }`}>
                      <Sparkles className="animate-pulse" />
                      เลือกไพ่ที่คุณรู้สึก 'ดึงดูด' ที่สุด 1 ใบ
                      <Sparkles className="animate-pulse" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                      {Array.from({ length: 22 }).map((_, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ y: -10, scale: 1.1, zIndex: 10 }}
                          onClick={handleCardClick}
                          className={`w-12 h-20 border rounded-md cursor-pointer shadow-lg transition-all ${
                            theme === 'Y2K' 
                              ? 'bg-linear-to-br from-dark-blue to-y2k-blue border-white hover:shadow-y2k-pink/50' 
                              : 'bg-linear-to-br from-pastel-blue to-pastel-pink border-white hover:shadow-pastel-pink/50'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  ref={resultRef}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`border-2 rounded-[40px] p-8 text-center space-y-6 overflow-hidden ${
                    theme === 'Y2K' ? 'glass border-y2k-blue y2k-shadow' : 'bg-white border-pastel-blue shadow-sm'
                  }`}
                >
                  {/* Capture Area */}
                  <div ref={captureRef} className={`space-y-6 p-4 rounded-3xl ${
                    theme === 'Y2K' ? 'bg-dark-blue/20' : 'bg-pastel-bg/50'
                  }`}>
                    <div className={`p-4 rounded-2xl text-lg ${
                      theme === 'Y2K' ? 'bg-white/10' : 'bg-white border border-pastel-blue/20'
                    }`}>
                      หัวข้อ: <span className={`font-bold ${theme === 'Y2K' ? 'text-y2k-pink' : 'text-pastel-pink'}`}>{topic === 'LOVE' ? 'ความรัก' : topic === 'WORK' ? 'การงาน/การเงิน' : 'ทั่วไป'}</span> | 
                      คำถาม: <span className={`font-bold italic ${theme === 'Y2K' ? 'text-y2k-blue' : 'text-pastel-blue'}`}>"{question}"</span>
                    </div>

                    <div className={`grid gap-6 ${cardCount === 1 ? 'grid-cols-1' : cardCount === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-5'}`}>
                      {selectedCards.map((card, index) => (
                        <motion.div
                          key={index}
                          initial={{ rotateY: 180, opacity: 0 }}
                          animate={{ rotateY: 0, opacity: 1 }}
                          transition={{ duration: 0.8, delay: index * 0.2 }}
                          className="space-y-3"
                        >
                          <div className="relative w-full aspect-[2/3] max-w-[150px] mx-auto">
                            <img 
                              src={card.img} 
                              alt={card.name}
                              referrerPolicy="no-referrer"
                              className={`w-full h-full object-cover rounded-xl border-2 shadow-lg ${
                                theme === 'Y2K' ? 'border-y2k-blue shadow-[0_0_10px_var(--color-y2k-blue)]' : 'border-pastel-blue shadow-sm'
                              }`}
                            />
                          </div>
                          <div className={`text-xs font-bold uppercase truncate ${
                            theme === 'Y2K' ? 'text-y2k-blue' : 'text-pastel-text'
                          }`}>{card.name}</div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="space-y-4 text-left">
                      <div className={`p-6 rounded-3xl text-lg leading-relaxed border-l-[10px] shadow-xl ${
                        theme === 'Y2K' ? 'bg-white text-dark-blue border-y2k-pink' : 'bg-white text-pastel-text border-pastel-pink'
                      }`}>
                        <div className={`flex items-center gap-2 mb-3 font-bold uppercase tracking-wider ${
                          theme === 'Y2K' ? 'text-y2k-pink' : 'text-pastel-pink'
                        }`}>
                          <BrainCircuit size={24} />
                          AI วิเคราะห์ดวงชะตา
                        </div>
                        {isGenerating ? (
                          <div className="flex flex-col items-center justify-center py-12 space-y-6 relative overflow-hidden">
                            {/* Floating Sparkles */}
                            <div className="absolute inset-0 pointer-events-none">
                              {[...Array(6)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ 
                                    opacity: [0, 1, 0], 
                                    scale: [0, 1.5, 0],
                                    x: [Math.random() * 200 - 100, Math.random() * 200 - 100],
                                    y: [Math.random() * 200 - 100, Math.random() * 200 - 100]
                                  }}
                                  transition={{ 
                                    duration: 2, 
                                    repeat: Infinity, 
                                    delay: i * 0.3,
                                    ease: "easeInOut"
                                  }}
                                  className={theme === 'Y2K' ? 'text-y2k-pink' : 'text-pastel-pink'}
                                >
                                  <Sparkles size={16} />
                                </motion.div>
                              ))}
                            </div>

                            {/* Spinning/Floating Cards */}
                            <div className="flex gap-4 relative z-10">
                              {[0, 1, 2].map((i) => (
                                <motion.div
                                  key={i}
                                  animate={{ 
                                    y: [0, -20, 0],
                                    rotateY: [0, 180, 360],
                                    scale: [1, 1.1, 1]
                                  }}
                                  transition={{ 
                                    duration: 3, 
                                    repeat: Infinity, 
                                    delay: i * 0.5,
                                    ease: "easeInOut"
                                  }}
                                  className={`w-12 h-20 border-2 border-white rounded-lg shadow-lg ${
                                    theme === 'Y2K' ? 'bg-linear-to-br from-y2k-blue to-y2k-pink' : 'bg-linear-to-br from-pastel-blue to-pastel-pink'
                                  }`}
                                />
                              ))}
                            </div>

                            <div className="text-center space-y-2 relative z-10">
                              <motion.p 
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className={`text-lg font-bold uppercase tracking-tighter italic ${
                                  theme === 'Y2K' ? 'text-dark-blue' : 'text-pastel-text'
                                }`}
                              >
                                กำลังสื่อจิตกับไพ่...
                              </motion.p>
                              <p className={`text-xs font-medium animate-pulse ${
                                theme === 'Y2K' ? 'text-y2k-pink' : 'text-pastel-pink'
                              }`}>
                                ดวงชะตาของคุณกำลังถูกวิเคราะห์แบบฉ่ำๆ
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="whitespace-pre-wrap">
                              {aiReading}
                            </div>
                            <div className={`pt-4 border-t text-[10px] font-bold italic leading-tight ${
                              theme === 'Y2K' ? 'border-y2k-pink/20 text-y2k-pink/60' : 'border-pastel-pink/20 text-pastel-pink/60'
                            }`}>
                              * โปรดใช้วิจารณญาณในการดูไพ่ ไพ่ไม่สามารถกำหนดชีวิตเราได้ ให้เราใช้ชีวิตปกติได้เลย ดูเพื่อเป็นแนวทาง หรือดูเอาสนุก
                            </div>
                            
                            {/* Feedback Mechanism */}
                            {!isGenerating && aiReading && (
                              <div className={`pt-4 flex flex-col items-center gap-3 border-t ${
                                theme === 'Y2K' ? 'border-y2k-pink/10' : 'border-pastel-pink/10'
                              }`}>
                                <p className={`text-xs font-bold uppercase tracking-wider ${
                                  theme === 'Y2K' ? 'text-dark-blue/60' : 'text-pastel-text/60'
                                }`}>
                                  คำทำนายนี้แม่นยำไหมครับ?
                                </p>
                                <div className="flex gap-4">
                                  <button
                                    onClick={() => setFeedback('UP')}
                                    className={`p-3 rounded-full transition-all ${
                                      feedback === 'UP' 
                                        ? (theme === 'Y2K' ? 'bg-y2k-blue text-white scale-110 shadow-lg' : 'bg-pastel-blue text-white scale-110 shadow-lg')
                                        : (theme === 'Y2K' ? 'bg-white/10 text-y2k-blue hover:bg-white/20' : 'bg-gray-100 text-pastel-blue hover:bg-gray-200')
                                    }`}
                                  >
                                    <ThumbsUp size={20} className={feedback === 'UP' ? 'fill-current' : ''} />
                                  </button>
                                  <button
                                    onClick={() => setFeedback('DOWN')}
                                    className={`p-3 rounded-full transition-all ${
                                      feedback === 'DOWN' 
                                        ? (theme === 'Y2K' ? 'bg-y2k-pink text-white scale-110 shadow-lg' : 'bg-pastel-pink text-white scale-110 shadow-lg')
                                        : (theme === 'Y2K' ? 'bg-white/10 text-y2k-pink hover:bg-white/20' : 'bg-gray-100 text-pastel-pink hover:bg-gray-200')
                                    }`}
                                  >
                                    <ThumbsDown size={20} className={feedback === 'DOWN' ? 'fill-current' : ''} />
                                  </button>
                                </div>
                                {feedback && (
                                  <motion.p 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`text-[10px] font-bold animate-bounce ${
                                      theme === 'Y2K' ? 'text-y2k-blue' : 'text-pastel-blue'
                                    }`}
                                  >
                                    ขอบคุณสำหรับคำแนะนำนะครับ! ✨
                                  </motion.p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-2">
                        {selectedCards.map((card, index) => (
                          <div key={index} className={`p-3 rounded-xl text-xs opacity-60 border ${
                            theme === 'Y2K' ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'
                          }`}>
                            <span className={`font-bold ${theme === 'Y2K' ? 'text-y2k-blue' : 'text-pastel-blue'}`}>ใบที่ {index + 1}: {card.name}</span> - {card.meaning}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-[10px] opacity-30 uppercase tracking-[0.3em] pt-2">
                      REAL TAROT {theme} • {new Date().toLocaleDateString('th-TH')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-4">
                    <button
                      onClick={downloadResultAsImage}
                      disabled={isDownloading}
                      className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        theme === 'Y2K' 
                          ? 'bg-linear-to-r from-y2k-blue to-y2k-pink text-white' 
                          : 'bg-linear-to-r from-pastel-blue to-pastel-pink text-white shadow-md'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          กำลังสร้างรูปภาพ...
                        </>
                      ) : (
                        <>
                          <Download size={20} />
                          บันทึกเป็นรูปภาพ (แชร์ลง Story)
                        </>
                      )}
                    </button>

                    <button
                      onClick={shareToStory}
                      className={`w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                        theme === 'Y2K' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-white border-2 border-pastel-blue text-pastel-blue hover:bg-pastel-blue/5'
                      }`}
                    >
                      <Camera size={20} />
                      คัดลอกข้อความแชร์
                    </button>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={shareToLine}
                        className="bg-[#25d366] hover:bg-[#1ebe57] text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                      >
                        <Share2 size={20} />
                        LINE
                      </button>
                      <button
                        onClick={copyLink}
                        className={`py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 ${
                          theme === 'Y2K' ? 'bg-y2k-blue text-dark-blue' : 'bg-pastel-blue text-white'
                        }`}
                      >
                        <Copy size={20} />
                        {copyStatus.includes('✅') ? 'สำเร็จ!' : 'คัดลอกลิงก์'}
                      </button>
                    </div>

                    <button
                      onClick={reset}
                      className={`w-full py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 mt-2 ${
                        theme === 'Y2K' ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <RotateCcw size={18} />
                      ถามคำถามใหม่
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {view === 'ABOUT' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`w-full max-w-2xl border-2 rounded-[40px] p-8 ${
              theme === 'Y2K' ? 'glass border-y2k-blue y2k-shadow' : 'bg-white border-pastel-blue shadow-sm'
            }`}
          >
            <header className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setView('HOME')}
                className={`p-3 rounded-full transition-colors ${
                  theme === 'Y2K' ? 'bg-white/10 hover:bg-white/20 text-y2k-blue' : 'bg-pastel-blue/20 hover:bg-pastel-blue/40 text-pastel-text'
                }`}
              >
                <Home size={24} />
              </button>
              <h1 className={`text-3xl font-bold uppercase italic ${
                theme === 'Y2K' ? 'text-y2k-blue' : 'text-pastel-pink'
              }`}>วิธีใช้งาน</h1>
              <div className="w-12" />
            </header>

            <div className={`space-y-6 text-lg leading-relaxed ${
              theme === 'Y2K' ? 'text-white' : 'text-pastel-text'
            }`}>
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  theme === 'Y2K' ? 'bg-y2k-blue text-dark-blue' : 'bg-pastel-blue text-white'
                }`}>1</div>
                <p>ตั้งสมาธิให้แน่วแน่ นึกถึงเรื่องที่ต้องการจะถาม</p>
              </div>
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  theme === 'Y2K' ? 'bg-y2k-blue text-dark-blue' : 'bg-pastel-blue text-white'
                }`}>2</div>
                <p>พิมพ์คำถามลงในช่องว่าง (ยิ่งระบุชัดเจน ยิ่งแม่นนะแม่!)</p>
              </div>
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  theme === 'Y2K' ? 'bg-y2k-blue text-dark-blue' : 'bg-pastel-blue text-white'
                }`}>3</div>
                <p>เลือกไพ่จากกองที่รู้สึกว่า "ใช่" ที่สุดเพียง 1 ใบ</p>
              </div>
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                  theme === 'Y2K' ? 'bg-y2k-blue text-dark-blue' : 'bg-pastel-blue text-white'
                }`}>4</div>
                <p>อ่านคำทำนายและแชร์ให้เพื่อนๆ หรือลูกหลานได้เลย!</p>
              </div>

              <button
                onClick={() => setView('READING')}
                className={`w-full py-4 rounded-full font-bold text-xl mt-8 transition-colors active:scale-95 ${
                  theme === 'Y2K' 
                    ? 'bg-y2k-blue text-dark-blue hover:bg-white' 
                    : 'bg-pastel-pink text-white hover:bg-pastel-blue shadow-md'
                }`}
              >
                เข้าใจแล้ว เริ่มเลย!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view !== 'HOME' && (
        <div className={`w-full max-w-2xl mt-10 pt-6 border-t border-dashed text-center ${
          theme === 'Y2K' ? 'border-y2k-blue/50' : 'border-pastel-blue/50'
        }`}>
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Advertisement</div>
          <div className={`h-24 flex items-center justify-center border rounded-xl text-sm italic ${
            theme === 'Y2K' ? 'border-y2k-blue/30 bg-white/5 text-gray-500' : 'border-pastel-blue/30 bg-white text-pastel-text/50'
          }`}>
            พื้นที่สำหรับโฆษณา / ติดต่อรีวิว
          </div>
        </div>
      )}

      <footer className={`mt-auto py-8 text-sm opacity-60 text-center ${
        theme === 'Y2K' ? 'text-white' : 'text-pastel-text'
      }`}>
        <p>© 2026 REAL TAROT {theme} | โปรดใช้วิจารณญาณในการดูดวง</p>
        <p className="mt-1">✨ {theme === 'Y2K' ? 'จึ้งมากแม่' : 'ขอให้เป็นวันที่ดีนะคะ'} ✨</p>
      </footer>
    </div>
  );
}
