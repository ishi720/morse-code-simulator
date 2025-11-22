import React, { useState, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import './App.css';

const MorseCodeSimulator = () => {
  const [inputText, setInputText] = useState('');
  const [morseCode, setMorseCode] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const audioContextRef = useRef(null);
  const isPlayingRef = useRef(false);

  // モールス信号の対応表
  const morseCodeMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--',
    '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..',
    '9': '----.', '0': '-----', '.': '.-.-.-', ',': '--..--', '?': '..--..',
    "'": '.----.', '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
    '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
    '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
    ' ': '/'
  };

  // テキストをモールス信号に変換
  const convertToMorse = (text) => {
    return text
      .toUpperCase()
      .split('')
      .map(char => morseCodeMap[char] || '')
      .join(' ');
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setMorseCode(convertToMorse(text));
    setCurrentIndex(-1);
  };

  // 音を再生する関数
  const playSound = (frequency, duration) => {
    if (isMuted) return Promise.resolve();
    
    return new Promise((resolve) => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const context = audioContextRef.current;
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
      
      setTimeout(resolve, duration * 1000);
    });
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // モールス信号を再生
  const playMorseCode = async () => {
    if (isPlayingRef.current || !morseCode) return;
    
    isPlayingRef.current = true;
    setIsPlaying(true);
    
    const dotDuration = 0.1; // 短点の長さ（秒）
    const dashDuration = dotDuration * 3; // 長点の長さ
    const symbolGap = dotDuration; // 記号間の間隔
    const letterGap = dotDuration * 3; // 文字間の間隔
    const wordGap = dotDuration * 7; // 単語間の間隔
    const frequency = 600; // 周波数（Hz）
    
    const symbols = morseCode.split('');
    
    for (let i = 0; i < symbols.length && isPlayingRef.current; i++) {
      setCurrentIndex(i);
      const symbol = symbols[i];
      
      if (symbol === '.') {
        await playSound(frequency, dotDuration);
        await sleep(symbolGap * 1000);
      } else if (symbol === '-') {
        await playSound(frequency, dashDuration);
        await sleep(symbolGap * 1000);
      } else if (symbol === ' ') {
        await sleep(letterGap * 1000);
      } else if (symbol === '/') {
        await sleep(wordGap * 1000);
      }
    }
    
    setIsPlaying(false);
    isPlayingRef.current = false;
    setCurrentIndex(-1);
  };

  const stopPlaying = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentIndex(-1);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlaying();
    } else {
      playMorseCode();
    }
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        <div className="card">
          <h1 className="title">モールス信号シミュレーター</h1>
          <p className="subtitle">Morse Code Simulator</p>

          {/* テキスト入力エリア */}
          <div className="input-section">
            <label className="label">テキストを入力してください</label>
            <textarea
              value={inputText}
              onChange={handleInputChange}
              placeholder="Hello World"
              className="text-input"
              rows="3"
            />
          </div>

          {/* モールス信号表示エリア */}
          <div className="morse-section">
            <label className="label">モールス信号</label>
            <div className="morse-display">
              <div className="morse-text">
                {morseCode.split('').map((char, index) => (
                  <span
                    key={index}
                    className={currentIndex === index ? 'highlight' : ''}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* コントロールボタン */}
          <div className="controls">
            <button
              onClick={togglePlay}
              disabled={!morseCode}
              className="btn btn-primary"
            >
              {isPlaying ? (
                <>
                  <Pause size={20} />
                  <span>停止</span>
                </>
              ) : (
                <>
                  <Play size={20} />
                  <span>再生</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="btn btn-secondary"
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              <span>{isMuted ? 'ミュート' : '音声ON'}</span>
            </button>
          </div>

          {/* モールス信号対応表 */}
          <div className="morse-table">
            <h3 className="table-title">モールス信号対応表</h3>
            <div className="table-grid">
              {Object.entries(morseCodeMap).slice(0, 36).map(([letter, code]) => (
                <div key={letter} className="table-cell">
                  <div className="letter">{letter}</div>
                  <div className="code">{code}</div>
                </div>
              ))}
            </div>
            <div className="table-footer">
              <span className="symbol">・</span> = 短点（dit）
              <span className="divider">|</span>
              <span className="symbol">ー</span> = 長点（dah）
            </div>
          </div>

          {/* 使い方 */}
          <div className="instructions">
            <h4 className="instructions-title">使い方</h4>
            <ul className="instructions-list">
              <li>• テキストを入力すると自動的にモールス信号に変換されます</li>
              <li>• 「再生」ボタンでモールス信号を音声で聞くことができます</li>
              <li>• 再生中は緑色のハイライトが進行状況を示します</li>
              <li>• 英字、数字、一部の記号に対応しています</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MorseCodeSimulator;