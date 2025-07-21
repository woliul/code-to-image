import React, { useState, useRef, useEffect } from 'react';

// --- NEW CodeMirror Imports ---
import { UnControlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css'; // Core CodeMirror CSS
import 'codemirror/theme/dracula.css'; // Example: Dracula theme (used in your screenshots)
import 'codemirror/theme/material.css'; // Example: Another theme
import 'codemirror/theme/monokai.css'; // Example: Another theme
// Add more themes as needed from node_modules/codemirror/theme/

// --- CodeMirror Language Modes ---
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/python/python';
import 'codemirror/mode/css/css';
import 'codemirror/mode/xml/xml';
import {toJpeg, toPng, toSvg} from "html-to-image"; // For HTML/XML


function App() {
    const [code, setCode] = useState(`const pluckDeep = key => obj => key.split('.').reduce((accum, key) => accum[key], obj)

const compose = (...fns) => res => fns.reduce((accum, next) => next(accum), res)

const unfold = (f, seed) => {
  const go = (f, seed, acc) => {
    const res = f(seed)
    return res ? go(f, res[1], acc.concat([res[0]])) : acc
  }
  return go(f, seed, [])
}
`);

    // codeRef will now point to the CodeMirror container
    const codeRef = useRef(null);
    const codeMirrorInstance = useRef(null); // To store the CodeMirror editor instance
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [selectedThemeName, setSelectedThemeName] = useState('dracula'); // Default CodeMirror theme

    // Map theme options to CodeMirror themes and their background colors
    const themeOptions = [
        { label: 'Dracula', value: 'dracula', cmTheme: 'dracula', backgroundColor: '#282a36' },
        { label: 'Material', value: 'material', cmTheme: 'material', backgroundColor: '#263238' },
        { label: 'Monokai', value: 'monokai', cmTheme: 'monokai', backgroundColor: '#272822' },
    ];

    // Find the current background color based on the selected CodeMirror theme
    const currentCmThemeOption = themeOptions.find(opt => opt.value === selectedThemeName);
    const currentBgColor = currentCmThemeOption ? currentCmThemeOption.backgroundColor : '#282a36'; // Default to Dracula BG

    // Update selectedLanguage options to match CodeMirror modes
    const languageOptions = [
        { label: 'JavaScript', value: 'javascript', cmMode: 'javascript' },
        { label: 'Python', value: 'python', cmMode: 'python' },
        { label: 'CSS', value: 'css', cmMode: 'css' },
        { label: 'HTML/XML', value: 'html', cmMode: 'xml' }, // CodeMirror uses 'xml' mode for HTML
        { label: 'JSON', value: 'json', cmMode: 'javascript' }, // JSON often uses JS mode in CM
    ];

    // This useEffect hook is crucial for ensuring CodeMirror renders correctly
    // after the DOM element is available and stable.
    useEffect(() => {
        if (codeMirrorInstance.current) {
            // Force CodeMirror to refresh its layout.
            // This is often needed when its container's size changes or on initial render
            // when it might not correctly perceive its dimensions.
            codeMirrorInstance.current.refresh();
        }
    }, [selectedLanguage, selectedThemeName, code]); // Re-run if language, theme, or code changes

    // The handleDownloadImage function should remain largely the same,
    // as it captures the entire codeRef div.
    const handleDownloadImage = async (format) => {
        if (!codeRef.current) {
            alert('Code snippet element not found. Cannot capture image.');
            return;
        }

        const nodeToCapture = codeRef.current;

        try {
            const commonOptions = {
                cacheBust: true,
                backgroundColor: 'transparent',
            };

            let imagePromise;
            let fileName;

            switch (format) {
                case 'png':
                    imagePromise = toPng(nodeToCapture, commonOptions);
                    fileName = 'code-snippet.png';
                    break;
                case 'svg':
                    imagePromise = toSvg(nodeToCapture, commonOptions);
                    fileName = 'code-snippet.svg';
                    break;
                case 'jpeg':
                    imagePromise = toJpeg(nodeToCapture, { ...commonOptions, backgroundColor: 'white' });
                    fileName = 'code-snippet.jpeg';
                    break;
                default:
                    alert('Invalid image format selected.');
                    return;
            }

            const dataUrl = await imagePromise;
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err) {
            console.error(`Failed to download image as ${format}:`, err);
            alert(`Failed to download image as ${format}. Please check the browser console for details: ${err.message}`);
        }
    };


    return (
        <div style={{
            width: '100%',
            maxWidth: '900px',
            boxSizing: 'border-box',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                backgroundColor: 'rgb(231 236 239)',
                borderRadius: '12px',
                padding: '15px',
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginRight: '40px',
                    marginTop: '20px',
                    marginLeft: '40px',
                    flexWrap: 'wrap',
                    gap: '20px',
                }}>
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="language-select" style={{ marginRight: '8px', fontSize: '15px', color: 'rgb(62 68 81)' }}>Lang:</label>
                            <select
                                id="language-select"
                                value={selectedLanguage}
                                onChange={(e) => setSelectedLanguage(e.target.value)}
                                style={{
                                    padding: '6px 10px',
                                    fontSize: '14px',
                                    borderRadius: '6px',
                                    border: '1px solid #b5b5b5',
                                    backgroundColor: 'white',
                                    color: 'rgb(62 68 81)',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {languageOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="theme-select" style={{ marginRight: '8px', fontSize: '15px', color: 'rgb(62 68 81)' }}>Theme:</label>
                            <select
                                id="theme-select"
                                value={selectedThemeName}
                                onChange={(e) => setSelectedThemeName(e.target.value)}
                                style={{
                                    padding: '6px 10px',
                                    fontSize: '14px',
                                    borderRadius: '6px',
                                    border: '1px solid #b5b5b5',
                                    backgroundColor: 'white',
                                    color: 'rgb(62 68 81)',
                                    outline: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                {themeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => handleDownloadImage('png')}
                            style={{
                                padding: '10px 30px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                backgroundColor: '#3e4451',
                                color: '#e0e0e0',
                                border: 'none',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            PNG
                        </button>

                        <button
                            onClick={() => handleDownloadImage('jpeg')}
                            style={{
                                padding: '10px 30px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                backgroundColor: '#3e4451',
                                color: '#e0e0e0',
                                border: 'none',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            JPEG
                        </button>

                        <button
                            onClick={() => handleDownloadImage('svg')}
                            style={{
                                padding: '10px 30px',
                                fontSize: '14px',
                                cursor: 'pointer',
                                backgroundColor: '#3e4451',
                                color: '#e0e0e0',
                                border: 'none',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            SVG
                        </button>
                    </div>
                </div>

                <div
                    ref={codeRef}
                    style={{
                        padding: '40px',
                        boxSizing: 'border-box',
                        backgroundColor: 'transparent',
                    }}
                >
                    <div
                        style={{
                            position: 'relative',
                            backgroundColor: currentBgColor, // Set dynamically based on CM theme
                            paddingTop: '20px',
                            paddingBottom: '20px',
                            borderRadius: '8px',
                            boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                            boxSizing: 'border-box',
                            height: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            // Add horizontal padding here to the parent of CodeMirror, not CodeMirror itself.
                            paddingLeft: '20px',
                            paddingRight: '20px',
                            overflow: 'hidden',
                            lineHeight: '120%'

                        }}
                    >
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', paddingLeft: '0px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56', border: '1px solid #e0443e' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', border: '1px solid #e0a22a' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', border: '1px solid #22b53b' }}></div>
                        </div>

                        {/* CodeMirror Component */}
                        <CodeMirror
                            value={code}
                            options={{
                                mode: languageOptions.find(opt => opt.value === selectedLanguage)?.cmMode || 'javascript',
                                theme: currentCmThemeOption ? currentCmThemeOption.cmTheme : 'dracula',
                                lineNumbers: true,
                                lineWrapping: true,
                                readOnly: false,
                                viewportMargin: Infinity, // Important for showing all lines
                            }}
                            onChange={(editor, data, value) => {
                                setCode(value);
                            }}
                            editorDidMount={(editor) => {
                                // Store the editor instance
                                codeMirrorInstance.current = editor;
                                // Immediately refresh after mounting
                                editor.refresh();
                            }}
                            className="react-codemirror2-wrapper"
                            style={{
                                flexGrow: 1,
                                fontSize: '13px',
                                fontFamily: 'monospace',
                                paddingLeft: '20px',
                                paddingRight: '20px',
                                height: 'auto'
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;