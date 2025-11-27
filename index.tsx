
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- DESIGN SYSTEM TOKENS (Curator's Odysseia v3.5) ---
const DS = {
  colors: {
    primary: '#28317C',   // Deep Royal Blue (Institution)
    secondary: '#3B82F6', // Azure Blue (Network)
    void: '#050510',      // Deep Ocean Black
    surface: '#ffffff',   // Paper White
    neutral: '#e5e5e5',   // Mist Gray (Academic)
    textMain: '#1a1a1a',
    textLight: '#888888',
    highlight: '#3B82F6',
  },
  fonts: {
    serif: "'Playfair Display', serif",
    sans: "'Inter', sans-serif"
  },
  spacing: {
    xs: '8px',
    s: '16px',
    m: '24px',
    l: '32px',
    xl: '48px'
  }
};

// --- STYLES OBJECT ---
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: DS.colors.void,
    overflow: 'hidden',
  },
  
  // -- Header: Editorial Gallery Label --
  header: {
    flexShrink: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: `0 ${DS.spacing.l}`,
    background: 'rgba(5, 5, 16, 0.8)', // Darker header for Void theme
    backdropFilter: 'blur(12px)',
    borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
    zIndex: 20,
    height: '72px',
    boxSizing: 'border-box' as const,
  },
  brandGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '2px',
  },
  brandTitle: {
    fontFamily: DS.fonts.serif,
    fontStyle: 'italic',
    fontSize: '24px',
    color: '#ffffff', // White title
    fontWeight: 600,
    margin: 0,
    lineHeight: 1,
    letterSpacing: '-0.01em',
  },
  brandSubtitle: {
    fontFamily: DS.fonts.sans,
    fontSize: '9px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
    color: DS.colors.secondary,
    fontWeight: 600,
  },
  
  // -- Controls --
  controlsGroup: {
    display: 'flex',
    gap: '32px',
    alignItems: 'center',
  },
  buttonGroup: {
    display: 'flex',
    gap: '-1px', // Collapse borders
  },
  
  // Micro UI Button
  button: (active: boolean = false) => ({
    background: active ? DS.colors.primary : 'transparent',
    color: active ? '#ffffff' : '#888888',
    border: `1px solid ${active ? DS.colors.primary : 'rgba(255,255,255,0.2)'}`,
    padding: '0 20px',
    height: '28px',
    fontSize: '9px',
    fontFamily: DS.fonts.sans,
    fontWeight: 700 as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    outline: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '90px',
  }),

  // -- Game Void --
  gameWrapper: {
    flex: 1,
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    background: DS.colors.void,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iframeFrame: {
    width: '100%',
    height: '100%',
    border: 'none',
    background: DS.colors.void,
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  },

  // -- Modals: Accession Record Style --
  modalOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(16px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  modalCard: {
    background: 'rgba(10, 10, 20, 0.95)', // Dark card
    width: '600px',
    maxWidth: '90%',
    border: `1px solid rgba(255, 255, 255, 0.1)`,
    boxShadow: '0 40px 80px -20px rgba(0, 0, 0, 0.8)',
    position: 'relative' as const,
    overflow: 'hidden',
    color: '#fff',
  },
  modalBar: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    height: '2px',
    width: '100%',
    background: DS.colors.primary,
  },
  modalContent: {
    padding: '48px 56px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  label: {
    fontFamily: DS.fonts.sans,
    fontSize: '9px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.25em',
    color: DS.colors.secondary,
    marginBottom: '20px',
    display: 'block',
  },
  heading: {
    fontFamily: DS.fonts.serif,
    fontStyle: 'italic',
    fontSize: '48px',
    fontWeight: 500,
    color: '#ffffff',
    margin: '0 0 24px 0',
    lineHeight: 1.05,
    letterSpacing: '-0.02em',
  },
  bodyText: {
    fontFamily: DS.fonts.sans,
    fontSize: '13px',
    lineHeight: '1.7',
    color: '#aaaaaa',
    fontWeight: 400,
    marginBottom: '32px',
    whiteSpace: 'pre-wrap' as const,
  },
  
  // -- Remix List (Data Table Style) --
  remixList: {
    borderTop: `1px solid rgba(255,255,255,0.1)`,
    marginBottom: '32px',
  },
  remixItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 0',
    borderBottom: `1px solid rgba(255,255,255,0.1)`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  remixTitle: {
    fontFamily: DS.fonts.serif,
    fontSize: '18px',
    fontStyle: 'italic',
    color: '#ffffff',
    fontWeight: 500,
  },
  remixMeta: {
    fontFamily: DS.fonts.sans,
    fontSize: '9px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: '#666',
  },
  promptBox: {
    background: '#111',
    border: `1px solid rgba(255,255,255,0.1)`,
    padding: '24px',
    fontFamily: "'Inter', monospace",
    fontSize: '10px',
    color: '#888',
    lineHeight: '1.6',
    maxHeight: '240px',
    overflowY: 'auto' as const,
    marginBottom: '32px',
    letterSpacing: '0.02em',
  },
  actionBtn: {
    width: '100%',
    padding: '18px',
    background: DS.colors.primary,
    color: '#fff',
    border: 'none',
    fontFamily: DS.fonts.sans,
    fontSize: '10px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3em',
    cursor: 'pointer',
    transition: 'background 0.3s ease',
    textAlign: 'center' as const,
  },
  loadingOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(5, 5, 16, 0.8)',
    backdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: `1px solid rgba(255,255,255,0.1)`,
    borderTop: `1px solid ${DS.colors.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '24px',
  },
  loadingText: {
    fontFamily: DS.fonts.sans,
    fontSize: '9px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.3em',
    color: DS.colors.primary,
    fontWeight: 700,
  }
};

const PROMPT_BASE = `
Create a sophisticated, 3D runner game "Curator's Run" contained in a single HTML file using Three.js.
The Design Philosophy is "**Void Nautical**" mapped to "**Editorial Brutalism**".

### 1. Visual Identity (The "Mare Incognita" System)
*   **Palette:** Background is **Void Black / Deep Ocean** (#050510).
*   **Environment:** 
    *   **Sky:** Infinite Void with **Milky Way** particle system (White/Blue stars).
    *   **Sea:** Deep Navy/Black water with Silver reflections.
    *   **Underlay:** A **Blueprint Constellation Map** must be visible *beneath* the water surface. 
    *   **CRITICAL:** Do NOT use external images. Generate the map texture procedurally (CanvasTexture) with dark background and thin white/cyan lines.
*   **Player:** A **Lego-style Voxel Pirate Ship**.
    *   Constructed from primitive BoxGeometries.
    *   Blue Hull, White Deck, Red Trim, Black Mast, White Square Sails.
    *   **CRITICAL:** Ensure Shadow Maps are correctly sized so the ship does not have "box artifacts" or clipped shadows around it.

### 2. Game Assets (The Curator's Artifacts)
*   **Tier 1 (The Magnum Opus):** Dodecahedron (10 Points).
*   **Tier 2 (The Exhibition):** Box (5 Points).
*   **Tier 3 (The Sketch):** Tetrahedron (2 Points).

**Color Mapping:**
*   **Institution:** Deep Royal Blue (#28317C)
*   **Academic:** Silver (#E5E5E5)
*   **Discourse:** White Wireframe (#FFFFFF)
*   **Network:** Azure Blue (#3B82F6)

### 3. Core Logic: The Chronos Gates
*   Eras: 10s -> 20s -> 30s.
*   End of Era: Spawn 3 "Chronos Gates" (Wooden Frames) with canvas text labels.
*   Gate Choices: SCANDAL vs ELITE (10s), EXPULSION vs ACCLAIM (20s), HIATUS vs MUSEUM (30s).

### 4. UI (Editorial HUD)
*   Display "Era", "Score", and "Trajectory Path" using serif fonts on dark backgrounds.
`;

const PROMPTS = {
  gemini2p5: PROMPT_BASE + `\n\n(Generated by Gemini 2.5 Pro - Optimized for Mobile Performance)`,
  gemini3: PROMPT_BASE + `\n\n(Generated by Gemini 3 Pro - High Fidelity Shaders, Lego Ship Model, Void Lighting)`
};

function App() {
  const [activeModel, setActiveModel] = useState('gemini3'); 
  const [showPrompt, setShowPrompt] = useState(false);
  const [showRemix, setShowRemix] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  
  const [gameHtml, setGameHtml] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('ACCESSIONING ARTIFACT...');
  
  const htmlCache = useRef<{ [key: string]: string }>({});
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const switchModel = (model: string) => {
    if (activeModel === model) return;
    setGameHtml(null);
    setIsLoading(true);
    setLoadingText('RETRIEVING ARCHIVE...');
    setActiveModel(model);
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'PAUSE_GAME', payload: showDisclaimer }, '*');
    }
  }, [showDisclaimer]);

  useEffect(() => {
    let isMounted = true;
    const url = activeModel === 'gemini3' ? './init/gemini3.html' : './init/gemini2p5.html';

    const loadGame = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load game');
        let html = await response.text();
        
        const baseTag = '<base href="./init/">';
        if (html.includes('<head')) {
            html = html.replace(/<head[^>]*>/i, `$&${baseTag}`);
        } else {
            html = `${baseTag}${html}`;
        }
        
        htmlCache.current[url] = html;
        
        if (isMounted) {
          setGameHtml(html);
          setIsLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (isMounted) {
          setGameHtml('<div style="color:white;display:flex;height:100%;justify-content:center;align-items:center;font-family:sans-serif;">ARTIFACT CORRUPTED</div>');
          setIsLoading(false);
        }
      }
    };
    
    loadGame();

    return () => {
      isMounted = false;
    };
  }, [activeModel]);

  const handleRemixAction = async (modification: string) => {
    if (!gameHtml) return;
    
    setIsLoading(true);
    setLoadingText('CALCULATING NEW TRAJECTORY...');
    setShowRemix(false); 

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const modelId = activeModel === 'gemini3' ? 'gemini-3-pro-preview' : 'gemini-2.5-pro';
        const currentPrompt = PROMPTS[activeModel as keyof typeof PROMPTS];

        const systemInstruction = `
You are an expert Creative Technologist building "Curator's Run".
Modify the provided HTML/Three.js game code based on the user's remix request.
STRICTLY ADHERE to the "Curator's Run v3.5" PRD:
1. Player is a **LEGO-style Voxel Pirate Ship**.
2. Background is **Void Black / Deep Space** (Not Sepia).
3. Map is **Dark Blueprint/Constellation** (White lines on Black).
4. Use Procedural CanvasTextures.
5. Fix any shadow clipping (box artifacts) by ensuring shadow cameras are large enough.
Output ONLY the raw HTML code.
`;

        const response = await ai.models.generateContent({
            model: modelId,
            config: { systemInstruction },
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: `ORIGINAL SPEC:\n${currentPrompt}` },
                        { text: `CURRENT CODE:\n${gameHtml}` },
                        { text: `REMIX INSTRUCTION: Apply this modification: "${modification}". Keep it single file.` }
                    ]
                }
            ]
        });

        let text = response.text;
        text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');
        
        const baseTag = '<base href="./init/">';
        if (!text.includes('<base') && !text.includes('init/')) {
             if (text.includes('<head')) {
                text = text.replace(/<head[^>]*>/i, `$&${baseTag}`);
            }
        }
        
        setGameHtml(text);

    } catch (error) {
        console.error("Remix failed", error);
        alert("Remix failed. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleIFrameLoad = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow && showDisclaimer) {
      iframe.contentWindow.postMessage({ type: 'PAUSE_GAME', payload: true }, '*');
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        
        .remix-item:hover {
            background-color: rgba(255,255,255,0.05);
            padding-left: 20px !important;
        }
        .remix-item:hover .remix-title {
            color: ${DS.colors.primary} !important;
        }
      `}</style>

      {/* Editorial Header */}
      <header style={styles.header}>
        <div style={styles.brandGroup}>
          <h1 style={styles.brandTitle}>Curator's Odysseia</h1>
          <span style={styles.brandSubtitle}>Archive Collection: The_Run_v3.5</span>
        </div>

        <div style={styles.controlsGroup}>
            <div style={styles.buttonGroup}>
                <button 
                    style={{...styles.button(activeModel === 'gemini2p5'), borderRight: 'none'}}
                    onClick={() => switchModel('gemini2p5')}
                >
                    v2.5 Lite
                </button>
                <button 
                    style={styles.button(activeModel === 'gemini3')}
                    onClick={() => switchModel('gemini3')}
                >
                    v3.0 Void
                </button>
            </div>

            <div style={styles.buttonGroup}>
                <button 
                    style={{...styles.button(showPrompt), borderRight: 'none'}}
                    onClick={() => setShowPrompt(true)}
                >
                    Metadata
                </button>
                <button 
                    style={styles.button(showRemix)}
                    onClick={() => setShowRemix(true)}
                >
                    Iteration
                </button>
            </div>
        </div>
      </header>

      {/* Main Content: The Void */}
      <main style={styles.gameWrapper}>
        {(isLoading || !gameHtml) && (
          <div style={styles.loadingOverlay}>
            <div style={styles.spinner}></div>
            <div style={styles.loadingText}>
                {loadingText}
            </div>
          </div>
        )}

        {!isLoading && gameHtml && (
          <div style={styles.iframeFrame}>
              <iframe 
                ref={iframeRef}
                key={activeModel + gameHtml.length}
                srcDoc={gameHtml}
                style={styles.iframe} 
                title="Artifact Display"
                sandbox="allow-scripts allow-pointer-lock allow-same-origin allow-forms"
                onLoad={handleIFrameLoad}
              />
          </div>
        )}
      </main>

      {/* Curation Report / Mission Modal */}
      {showDisclaimer && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalCard, animation: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)'}}>
            <div style={styles.modalBar}></div>
            <div style={styles.modalContent}>
                <span style={styles.label}>Accession Record #003</span>
                <h2 style={styles.heading}>The Curator's Run</h2>
                
                <div style={styles.bodyText}>
                    <p>
                        <strong style={{color: '#fff'}}>OBJECTIVE:</strong> Navigate the Abyss through three eras of an artist's life (10s, 20s, 30s). Collect Data Artifacts to build your portfolio.
                    </p>
                    <p style={{marginTop: '16px'}}>
                        <strong style={{color: '#fff'}}>CHRONOS GATES:</strong> At the end of each era, you must choose a path. Will you choose <span style={{borderBottom: `1px solid ${DS.colors.neutral}`}}>SCANDAL</span> or <span style={{borderBottom: `1px solid ${DS.colors.neutral}`}}>ELITE COURSE</span>? Your choices define your Persona.
                    </p>
                    <p style={{marginTop: '24px', fontStyle: 'italic', color: '#666', borderLeft: `1px solid ${DS.colors.primary}`, paddingLeft: '16px'}}>
                        "Chart your constellation in the void before the connection is lost."
                    </p>
                </div>

                <button 
                    style={styles.actionBtn} 
                    onClick={() => setShowDisclaimer(false)}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1e255e'}
                    onMouseLeave={(e) => e.currentTarget.style.background = DS.colors.primary}
                >
                    Begin Voyage
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Metadata Modal */}
      {showPrompt && (
        <div style={styles.modalOverlay} onClick={() => setShowPrompt(false)}>
           <div style={{...styles.modalCard, animation: 'fadeIn 0.4s ease'}} onClick={e => e.stopPropagation()}>
             <div style={styles.modalBar}></div>
            <div style={styles.modalContent}>
                <span style={styles.label}>Archival Data</span>
                <h2 style={styles.heading}>Source Metadata</h2>
                <p style={styles.bodyText}>The following generative instructions were issued to the model to synthesize this artifact.</p>
                
                <div style={styles.promptBox}>
                {PROMPTS[activeModel as keyof typeof PROMPTS]}
                </div>
                
                <button 
                    style={{...styles.actionBtn, background: '#111', color: '#fff', border: `1px solid #333`}} 
                    onClick={() => setShowPrompt(false)}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#222';
                        e.currentTarget.style.color = DS.colors.primary;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#111';
                        e.currentTarget.style.color = '#fff';
                    }}
                >
                    Close Record
                </button>
            </div>
          </div>
        </div>
      )}

      {/* Remix Modal */}
      {showRemix && (
        <div style={styles.modalOverlay} onClick={() => setShowRemix(false)}>
           <div style={{...styles.modalCard, animation: 'fadeIn 0.4s ease'}} onClick={e => e.stopPropagation()}>
            <div style={styles.modalBar}></div>
            <div style={styles.modalContent}>
                <span style={styles.label}>Code Mutation</span>
                <h2 style={styles.heading}>Modify Artifact</h2>
                <p style={styles.bodyText}>Inject new parameters into the artifact's runtime code.</p>
                
                <div style={styles.remixList}>
                    {['Hard Mode: Stormy Abyss', 'Visual: Red Alert', 'Mechanic: 2x Speed'].map((item, i) => (
                    <div 
                        key={item}
                        className="remix-item"
                        style={styles.remixItem} 
                        onClick={() => handleRemixAction(item)}
                    >
                        <div>
                            <div className="remix-title" style={styles.remixTitle}>{item}</div>
                        </div>
                        <div style={styles.remixMeta}>
                            {['Violent waves and lightning', 'Emergency aesthetics', 'High velocity career'][i]}
                        </div>
                    </div>
                    ))}
                </div>

                <button 
                    style={{...styles.actionBtn, background: 'transparent', color: '#666'}} 
                    onClick={() => setShowRemix(false)}
                >
                    Cancel Operation
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root') || document.body);
root.render(<App />);
