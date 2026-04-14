/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Sparkles, RotateCcw, Info, Home, Copy, Camera, Loader2, BrainCircuit, ThumbsUp, ThumbsDown, Instagram, QrCode } from 'lucide-react';
import { toPng } from 'html-to-image';
import { GoogleGenAI } from "@google/genai";
import { QRCodeSVG } from 'qrcode.react';

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

function CrystalOrb() {
  return (
    <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-8">
      {/* Chromatic Aberration Effect Layers */}
      <div className="absolute inset-0 rounded-full bg-cosmic-purple/20 blur-xl animate-pulse" />
      <div className="absolute inset-0 rounded-full border-4 border-red-500/10 scale-105 blur-[2px]" />
      <div className="absolute inset-0 rounded-full border-4 border-cyan-500/10 scale-95 blur-[2px]" />
      
      {/* Main Orb Body */}
      <div className="absolute inset-0 rounded-full bg-linear-to-br from-white/20 via-transparent to-black/40 backdrop-blur-md border border-white/30 shadow-[inset_0_0_50px_rgba(255,255,255,0.2)] overflow-hidden">
        {/* Inner Glow */}
        <div className="absolute inset-0 bg-radial-gradient from-cosmic-electric/30 to-transparent" />
        
        {/* Inner Sparkle */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
            rotate: [0, 90, 180, 270, 360]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center text-cosmic-aqua"
        >
          <Sparkles size={120} className="drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]" />
        </motion.div>
      </div>
      
      {/* Outer Glow */}
      <div className="absolute inset-0 rounded-full shadow-[0_0_60px_rgba(191,0,255,0.3)] pointer-events-none" />
    </div>
  );
}

interface TarotCardComponentProps {
  card?: TarotCard;
  isBack?: boolean;
  onClick?: () => void;
  className?: string;
  delay?: number;
  key?: string | number;
}

function TarotCardComponent({ card, isBack = false, onClick, className = "", delay = 0 }: TarotCardComponentProps) {
  return (
    <motion.div
      initial={isBack ? { opacity: 0, y: 20 } : { rotateY: 180, opacity: 0, y: 20 }}
      animate={isBack ? { opacity: 1, y: 0 } : { rotateY: 0, opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay }}
      whileHover={{ y: -10, scale: 1.05, zIndex: 10 }}
      onClick={onClick}
      className={`relative aspect-[2/3] rounded-xl cursor-pointer perspective-1000 group ${className}`}
    >
      <div className="absolute -inset-1 bg-linear-to-r from-cosmic-aqua via-cosmic-electric to-cosmic-aqua rounded-xl blur-sm opacity-30 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative w-full h-full rounded-xl border-2 border-white/20 overflow-hidden bg-cosmic-deep shadow-2xl z-10">
        {isBack ? (
          <div className="w-full h-full card-back-pattern flex items-center justify-center p-4">
            <div className="w-full h-full border border-cosmic-aqua/20 rounded-lg flex items-center justify-center relative">
              <div className="absolute inset-0 bg-radial-gradient from-cosmic-electric/10 to-transparent" />
              <Sparkles className="text-cosmic-aqua/40 animate-pulse" size={32} />
            </div>
          </div>
        ) : (
          <div className="w-full h-full relative holographic-shimmer">
            <img 
              src={card?.img} 
              alt={card?.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2 text-[10px] font-bold uppercase text-white truncate drop-shadow-md">
              {card?.name}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [topic, setTopic] = useState<Topic>('GENERAL');
  const [readingStyle, setReadingStyle] = useState<ReadingStyle>('GENZ');
  const [cardCount, setCardCount] = useState<number>(1);
  const [question, setQuestion] = useState('');
  const [dob, setDob] = useState('');
  const [selectedCards, setSelectedCards] = useState<TarotCard[]>([]);
  const [aiReading, setAiReading] = useState<string>('');
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState<'UP' | 'DOWN' | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [error, setError] = useState('');
  const [copyStatus, setCopyStatus] = useState('คัดลอกลิงก์เว็บ');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharingIG, setIsSharingIG] = useState(false);
  const [viewingCard, setViewingCard] = useState<TarotCard | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const igStoryRef = useRef<HTMLDivElement>(null);

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
        ? `คุณคือหมอดูไพ่ยิปซีชายสไตล์ Cosmic ที่มีความแม่นยำและทันสมัย (ใช้ภาษาวัยรุ่นผู้ชาย มีความจึ้งๆ ฉ่ำๆ แต่สุภาพแบบพี่ชาย/เพื่อนชาย ใช้คำลงท้ายว่า "ครับ" หรือ "ผม" เป็นหลัก)`
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

      const fullReading = response.text || 'ขออภัยครับ จิตสัมผัสขัดข้องชั่วคราว ลองใหม่อีกครั้งนะแม่!';
      setAiReading(fullReading);

      // Generate a punchy summary for IG Story
      try {
        const summaryPrompt = `จากคำทำนายนี้: "${fullReading}" 
        ช่วยสรุปเป็นประโยคสั้นๆ เพียงประโยคเดียวที่ "จึ้ง" และ "โดนใจ" (Punchline) สำหรับแชร์ลง Instagram Story 
        (เช่น "ความรักกำลังพุ่งชน!" หรือ "เงินก้อนโตเตรียมเข้าบัญชี!") 
        ตอบเป็นภาษาไทยสั้นๆ ไม่ต้องมีเครื่องหมายคำพูด`;
        
        const summaryResponse = await ai.models.generateContent({
          model,
          contents: [{ parts: [{ text: summaryPrompt }] }],
        });
        setAiSummary(summaryResponse.text?.trim() || 'ดวงชะตาของคุณกำลังจะเปลี่ยนไปในทางที่ดี!');
      } catch (sErr) {
        console.error('Summary Generation Error:', sErr);
        setAiSummary('ดวงชะตาของคุณกำลังจะเปลี่ยนไปในทางที่ดี!');
      }
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
    const text = `🔮 REAL TAROT\nคำถาม: ${question}\n\nคำทำนายจาก AI:\n${aiReading}${disclaimer}\n\nดูดวงแม่นๆ ได้ที่นี่!`;
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
    const text = `🔮 REAL TAROT\n\nคำถาม: ${question}\n\nคำทำนาย:\n${aiReading}${disclaimer}`;
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
        backgroundColor: '#1A0B3B', 
        style: {
          borderRadius: '0', 
        }
      });
      
      const link = document.createElement('a');
      link.download = `cosmic-tarot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to capture image:', err);
      alert('ไม่สามารถบันทึกรูปภาพได้ในขณะนี้ กรุณาลองใหม่อีกครั้งครับ');
    } finally {
      setIsDownloading(false);
    }
  };

  const shareToInstagramStory = async () => {
    if (!igStoryRef.current || selectedCards.length === 0) return;
    
    setIsSharingIG(true);
    try {
      // Ensure fonts and images are loaded
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const dataUrl = await toPng(igStoryRef.current, {
        cacheBust: true,
        width: 1080,
        height: 1920,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });

      // Convert dataUrl to File object for Web Share API
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `real-tarot-story-${Date.now()}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Real Tarot Prediction',
          text: 'สัมผัสคำทำนายจากจิตจักรวาล ✨',
        });
      } else {
        // Fallback: Download
        const link = document.createElement('a');
        link.download = `real-tarot-story-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        alert('บันทึกรูปภาพสำหรับ Instagram Story แล้ว! คุณสามารถนำไปโพสต์ได้เลย ✨');
      }
    } catch (err) {
      console.error('IG Story Share Error:', err);
      alert('ไม่สามารถแชร์ได้ในขณะนี้ กรุณาลองใหม่อีกครั้งครับ');
    } finally {
      setIsSharingIG(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen overflow-x-hidden py-10 px-4 transition-all duration-700 bg-cosmic-deep text-white">
      {/* Noise Overlay */}
      <div className="noise-overlay" />

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute inset-0 bg-radial-gradient from-cosmic-purple via-black to-black" />
      </div>

      <AnimatePresence mode="wait">
        {view === 'HOME' && (
                  <motion.div
                    key="home"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="flex flex-col items-center justify-center flex-1 max-w-2xl w-full text-center space-y-8"
                  >
                    <CrystalOrb />

                    <div className="space-y-4">
                      <h1 className="text-6xl md:text-8xl font-bold uppercase tracking-[0.15em] font-geometric neon-cyan-glow">
                        REAL TAROT
                      </h1>
                      <p className="text-2xl md:text-3xl font-light flex items-center justify-center gap-2 font-modern text-white">
                        <Sparkles className="text-cosmic-aqua" size={16} />
                        สัมผัสคำทำนายจากจิตจักรวาล
                        <Sparkles className="text-cosmic-aqua" size={16} />
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 w-full max-w-sm">
                      <button
                        onClick={() => setView('READING')}
                        className="group relative py-6 px-8 text-3xl font-bold transition-all active:scale-95 flex items-center justify-center gap-4 overflow-hidden bg-cosmic-electric/20 text-white border border-cosmic-electric/50 backdrop-blur-md hover:bg-cosmic-electric/40 cosmic-glow rounded-full"
                      >
                        <Sparkles className="text-cosmic-aqua" />
                        เริ่มดูดวง
                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      </button>

                      <button
                        onClick={() => setView('ABOUT')}
                        className="py-4 px-8 text-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-3 bg-white/5 border border-white/20 text-white backdrop-blur-sm hover:bg-white/10 rounded-full"
                      >
                        <Info />
                        วิธีใช้งาน
                      </button>
                    </div>

                    <div className="p-6 rounded-3xl border text-sm opacity-80 glass-cosmic border-white/10 font-modern">
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
                className="p-3 rounded-full transition-colors bg-white/5 hover:bg-white/10 text-cosmic-aqua"
              >
                <Home size={24} />
              </button>
              <h1 className="text-3xl font-bold uppercase tracking-widest font-geometric neon-cyan-glow">🔮 ถามไพ่</h1>
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
                  <div className="rounded-3xl p-6 space-y-6 glass-cosmic cosmic-border-thick cosmic-glow">
                    <div>
                      <label className="block text-lg mb-2 font-bold font-modern text-cosmic-aqua">
                        1. เลือกหัวข้อที่คุณต้องการถาม:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['GENERAL', 'LOVE', 'WORK'] as Topic[]).map((t) => (
                          <button
                            key={t}
                            onClick={() => setTopic(t)}
                            className={`py-2 px-1 rounded-xl text-sm font-bold transition-all ${
                              topic === t 
                                ? 'iridescent-selection text-white scale-105 active cosmic-button-glow'
                                : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'
                            }`}
                          >
                            {t === 'GENERAL' ? 'ทั่วไป' : t === 'LOVE' ? 'ความรัก' : 'การงาน'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg mb-2 font-bold font-modern text-cosmic-aqua">
                        2. เลือกสไตล์การทำนาย:
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['GENZ', 'NORMAL'] as ReadingStyle[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => setReadingStyle(s)}
                            className={`py-2 px-4 rounded-xl text-sm font-bold transition-all ${
                              readingStyle === s 
                                ? 'iridescent-selection text-white scale-105 active cosmic-button-glow'
                                : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'
                            }`}
                          >
                            {s === 'GENZ' ? 'วัยรุ่น (ชาย)' : 'ภาษาทางการ/ปกติ'}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg mb-2 font-bold font-modern text-cosmic-aqua">
                        3. เลือกจำนวนไพ่:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 3, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setCardCount(n)}
                            className={`py-2 px-4 rounded-xl text-lg font-bold transition-all ${
                              cardCount === n 
                                ? 'iridescent-selection text-white scale-105 active cosmic-button-glow'
                                : 'bg-white/5 text-white/40 hover:bg-white/10 border border-white/5'
                            }`}
                          >
                            {n} ใบ
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg mb-2 font-bold font-modern text-cosmic-aqua">
                        4. วันเดือนปีเกิด (ไม่บังคับ ✨):
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full border-b-2 p-4 rounded-xl outline-none transition-all text-lg appearance-none bg-white/5 border-white/10 text-white cosmic-input-glow"
                      />
                    </div>

                    <div>
                      <label className="block text-lg mb-2 font-bold font-modern text-cosmic-aqua">
                        5. พิมพ์คำถามของคุณ:
                      </label>
                      <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="เช่น ช่วงนี้จะรวยไหม?, เขาคิดยังไงกับเรา?"
                        className="w-full border-b-2 p-4 rounded-xl outline-none transition-all text-lg bg-white/5 border-white/10 text-white cosmic-input-glow"
                      />
                      {error && <p className="mt-2 text-sm font-bold text-red-400">{error}</p>}
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="font-bold text-xl flex items-center justify-center gap-2 font-modern text-cosmic-aqua">
                      <Sparkles className="animate-pulse" />
                      เลือกไพ่ที่คุณรู้สึก 'ดึงดูด' ที่สุด 1 ใบ
                      <Sparkles className="animate-pulse" />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                      {Array.from({ length: 22 }).map((_, i) => (
                        <TarotCardComponent
                          key={i}
                          isBack
                          onClick={handleCardClick}
                          className="w-12 h-20"
                          delay={i * 0.02}
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
                  className="rounded-[40px] p-8 text-center space-y-6 overflow-hidden glass-cosmic cosmic-border-thick cosmic-glow"
                >
                  {/* Capture Area */}
                  <div ref={captureRef} className="space-y-6 p-4 rounded-3xl bg-cosmic-purple/40">
                    <div className="p-4 rounded-2xl text-lg bg-white/5 border border-white/10">
                      หัวข้อ: <span className="font-bold text-cosmic-electric">{topic === 'LOVE' ? 'ความรัก' : topic === 'WORK' ? 'การงาน/การเงิน' : 'ทั่วไป'}</span> | 
                      คำถาม: <span className="font-bold italic text-cosmic-aqua">"{question}"</span>
                    </div>

                    <div className={`grid gap-6 ${cardCount === 1 ? 'grid-cols-1' : cardCount === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-5'}`}>
                      {selectedCards.map((card, index) => (
                        <TarotCardComponent
                          key={index}
                          card={card}
                          delay={index * 0.2}
                          onClick={() => setViewingCard(card)}
                          className="w-full max-w-[150px] mx-auto"
                        />
                      ))}
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="p-6 rounded-3xl text-lg leading-relaxed border-l-[10px] shadow-xl bg-white/5 text-white border-cosmic-electric backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-3 font-bold uppercase tracking-wider text-cosmic-electric">
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
                                  className="text-cosmic-electric"
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
                                  className="w-12 h-20 border-2 border-white rounded-lg shadow-lg bg-linear-to-br from-cosmic-purple to-cosmic-electric"
                                />
                              ))}
                            </div>

                            <div className="text-center space-y-2 relative z-10">
                              <motion.p 
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-lg font-bold uppercase tracking-tighter italic text-white"
                              >
                                กำลังสื่อจิตกับไพ่...
                              </motion.p>
                              <p className="text-xs font-medium animate-pulse text-cosmic-aqua">
                                ดวงชะตาของคุณกำลังถูกวิเคราะห์แบบฉ่ำๆ
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="whitespace-pre-wrap">
                              {aiReading}
                            </div>
                            <div className="pt-4 border-t text-[10px] font-bold italic leading-tight border-white/10 text-white/40">
                              * โปรดใช้วิจารณญาณในการดูไพ่ ไพ่ไม่สามารถกำหนดชีวิตเราได้ ให้เราใช้ชีวิตปกติได้เลย ดูเพื่อเป็นแนวทาง หรือดูเอาสนุก
                            </div>
                            
                            {/* Feedback Mechanism */}
                            {!isGenerating && aiReading && (
                              <div className="pt-4 flex flex-col items-center gap-3 border-t border-white/10">
                                <p className="text-xs font-bold uppercase tracking-wider text-white/60">
                                  คำทำนายนี้แม่นยำไหมครับ?
                                </p>
                                <div className="flex gap-4">
                                  <button
                                    onClick={() => setFeedback('UP')}
                                    className={`p-3 rounded-full transition-all ${
                                      feedback === 'UP' 
                                        ? 'bg-cosmic-aqua text-cosmic-purple scale-110 shadow-lg'
                                        : 'bg-white/5 text-cosmic-aqua hover:bg-white/10'
                                    }`}
                                  >
                                    <ThumbsUp size={20} className={feedback === 'UP' ? 'fill-current' : ''} />
                                  </button>
                                  <button
                                    onClick={() => setFeedback('DOWN')}
                                    className={`p-3 rounded-full transition-all ${
                                      feedback === 'DOWN' 
                                        ? 'bg-cosmic-electric text-white scale-110 shadow-lg'
                                        : 'bg-white/5 text-cosmic-electric hover:bg-white/10'
                                    }`}
                                  >
                                    <ThumbsDown size={20} className={feedback === 'DOWN' ? 'fill-current' : ''} />
                                  </button>
                                </div>
                                {feedback && (
                                  <motion.p 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-[10px] font-bold animate-bounce text-cosmic-aqua"
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
                          <div key={index} className="p-3 rounded-xl text-xs opacity-60 border bg-white/5 border-white/5">
                            <span className="font-bold text-cosmic-aqua">ใบที่ {index + 1}: {card.name}</span> - {card.meaning}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-[10px] opacity-30 uppercase tracking-[0.3em] pt-2">
                      REAL TAROT COSMIC • {new Date().toLocaleDateString('th-TH')}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 pt-4">
                    <button
                      onClick={shareToInstagramStory}
                      disabled={isSharingIG || isGenerating}
                      className="w-full py-5 px-6 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 transition-all active:scale-95 disabled:opacity-50 bg-linear-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-xl hover:shadow-[0_0_25px_rgba(253,29,29,0.4)]"
                    >
                      <div className="flex items-center gap-2 text-lg">
                        {isSharingIG ? <Loader2 className="animate-spin" size={24} /> : <Instagram size={24} />}
                        แชร์ลง Instagram Story
                      </div>
                      <span className="text-[10px] opacity-80 font-medium uppercase tracking-widest">สร้างรูปภาพสรุปดวง 9:16</span>
                    </button>

                    <button
                      onClick={downloadResultAsImage}
                      disabled={isDownloading}
                      className="w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-linear-to-r from-cosmic-electric to-cosmic-aqua text-white shadow-lg cosmic-glow"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          กำลังสร้างรูปภาพ...
                        </>
                      ) : (
                        <>
                          <Camera size={20} />
                          บันทึกเป็นรูปภาพ (แชร์ลง Story)
                        </>
                      )}
                    </button>

                    <button
                      onClick={shareToStory}
                      className="w-full py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 bg-white/5 border border-white/20 text-white hover:bg-white/10"
                    >
                      <Copy size={20} />
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
                        className="py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 bg-cosmic-aqua text-cosmic-purple"
                      >
                        <Share2 size={20} />
                        {copyStatus.includes('✅') ? 'สำเร็จ!' : 'คัดลอกลิงก์'}
                      </button>
                    </div>

                    <button
                      onClick={reset}
                      className="w-full py-3 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 mt-2 bg-white/5 text-white/40 hover:bg-white/10"
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
            className="w-full max-w-2xl rounded-[40px] p-8 glass-cosmic cosmic-border-thick cosmic-glow"
          >
            <header className="flex items-center justify-between mb-8">
              <button 
                onClick={() => setView('HOME')}
                className="p-3 rounded-full transition-colors bg-white/5 hover:bg-white/10 text-cosmic-aqua"
              >
                <Home size={24} />
              </button>
              <h1 className="text-3xl font-bold uppercase tracking-widest font-geometric neon-cyan-glow">วิธีใช้งาน</h1>
              <div className="w-12" />
            </header>

            <div className="space-y-6 text-lg leading-relaxed text-white font-modern">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 bg-cosmic-electric text-white">1</div>
                <p>ตั้งสมาธิให้แน่วแน่ นึกถึงเรื่องที่ต้องการจะถาม</p>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 bg-cosmic-electric text-white">2</div>
                <p>พิมพ์คำถามลงในช่องว่าง (ยิ่งระบุชัดเจน ยิ่งแม่นนะแม่!)</p>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 bg-cosmic-electric text-white">3</div>
                <p>เลือกไพ่จากกองที่รู้สึกว่า "ใช่" ที่สุดเพียง 1 ใบ</p>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 bg-cosmic-electric text-white">4</div>
                <p>อ่านคำทำนายและแชร์ให้เพื่อนๆ หรือลูกหลานได้เลย!</p>
              </div>

              <button
                onClick={() => setView('READING')}
                className="w-full py-4 rounded-full font-bold text-xl mt-8 transition-colors active:scale-95 bg-cosmic-electric text-white hover:bg-cosmic-aqua hover:text-cosmic-purple cosmic-glow"
              >
                เข้าใจแล้ว เริ่มเลย!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {view !== 'HOME' && (
        <div className="w-full max-w-2xl mt-10 pt-6 border-t border-dashed text-center border-white/20">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Advertisement</div>
          <div className="h-24 flex items-center justify-center border rounded-xl text-sm italic border-white/10 bg-white/5 text-white/40">
            พื้นที่สำหรับโฆษณา / ติดต่อรีวิว
          </div>
        </div>
      )}

      <footer className="mt-auto py-8 text-sm opacity-60 text-center text-white font-modern">
        <p>© 2026 REAL TAROT COSMIC | โปรดใช้วิจารณญาณในการดูดวง</p>
        <p className="mt-1">✨ ขอให้จักรวาลอยู่ข้างคุณ ✨</p>
      </footer>

      {/* Hidden IG Story Capture Area (9:16) */}
      <div className="fixed left-[-9999px] top-0">
        <div 
          ref={igStoryRef}
          className="w-[1080px] h-[1920px] relative overflow-hidden flex flex-col items-center justify-between py-24 px-16 bg-cosmic-deep text-white"
          style={{ 
            backgroundImage: 'radial-gradient(circle at 50% 50%, #1A0B3B 0%, #000000 100%)'
          }}
        >
          {/* Noise/Star Texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
          
          {/* Decorative Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cosmic-electric/20 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cosmic-aqua/10 rounded-full blur-[100px] -z-10" />

          {/* Header */}
          <div className="text-center space-y-4 z-10">
            <h1 className="text-7xl font-bold uppercase tracking-[0.2em] font-geometric neon-cyan-glow">REAL TAROT</h1>
            <p className="text-3xl font-light tracking-widest opacity-80">สัมผัสคำทำนายจากจิตจักรวาล</p>
          </div>

          {/* Main Card */}
          {selectedCards.length > 0 && (
            <div className="relative z-10 flex flex-col items-center space-y-12">
              <div className="relative w-[500px] aspect-[2/3] rounded-[40px] overflow-hidden border-8 border-cosmic-aqua/50 shadow-[0_0_80px_rgba(0,255,255,0.4)]">
                <img 
                  src={selectedCards[0].img} 
                  alt={selectedCards[0].name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="text-center space-y-4">
                <h2 className="text-6xl font-bold uppercase text-cosmic-aqua drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]">
                  {selectedCards[0].name}
                </h2>
                <div className="h-2 w-48 bg-linear-to-r from-transparent via-cosmic-electric to-transparent mx-auto" />
              </div>
            </div>
          )}

          {/* Punchy Summary */}
          <div className="w-full text-center z-10 px-8">
            <div className="p-12 rounded-[50px] bg-white/5 border-2 border-white/10 backdrop-blur-xl shadow-2xl">
              <p className="text-5xl font-bold leading-tight text-white drop-shadow-lg">
                "{aiSummary}"
              </p>
            </div>
          </div>

          {/* Footer with QR and Watermark */}
          <div className="w-full flex items-end justify-between z-10">
            <div className="space-y-2">
              <p className="text-2xl font-bold tracking-widest opacity-40 uppercase font-geometric">REAL TAROT</p>
              <p className="text-xl opacity-30 uppercase tracking-tighter">COSMIC AI PREDICTION</p>
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-white rounded-3xl shadow-2xl">
                <QRCodeSVG 
                  value={window.location.href} 
                  size={180}
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-xl font-bold text-cosmic-aqua animate-pulse">SCAN TO READ YOURS</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Meaning Modal */}
      <AnimatePresence>
        {viewingCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setViewingCard(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md glass-cosmic cosmic-border-thick p-8 rounded-[40px] space-y-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setViewingCard(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60"
              >
                <RotateCcw size={20} className="rotate-45" />
              </button>

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-32 aspect-[2/3] rounded-xl overflow-hidden border-2 border-cosmic-aqua shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                  <img 
                    src={viewingCard.img} 
                    alt={viewingCard.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-bold font-geometric neon-cyan-glow uppercase tracking-wider">
                  {viewingCard.name}
                </h2>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-lg leading-relaxed font-modern">
                  {viewingCard.meaning}
                </div>
                <button
                  onClick={() => setViewingCard(null)}
                  className="w-full py-3 rounded-full font-bold bg-cosmic-electric text-white hover:bg-cosmic-aqua hover:text-cosmic-purple transition-all"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
