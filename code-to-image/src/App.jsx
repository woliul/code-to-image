import React, { useState, useRef, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
// --- THEME IMPORTS ---
import {
    atomOneDark,
    atomOneLight,
    dracula,
    githubGist,
    vs,
    monokai,
    hybrid,
    rainbow,
    arta,
    solarizedDark,
    solarizedLight,
    vs2015,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { toPng, toSvg, toJpeg } from 'html-to-image';


// --- LANGUAGE IMPORTS ---
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml'; // HTML is typically 'xml' for hljs
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';

// --- LANGUAGE REGISTRATION ---
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('html', xml); // Register 'html' to use 'xml' highlighter
SyntaxHighlighter.registerLanguage('json', json);


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
    // codeRef points to the outermost container that will be captured,
    // which includes the transparent padding for shadows and clipped text.
    const codeRef = useRef(null);
    // textareaRef points to the transparent textarea for user input.
    const textareaRef = useRef(null);
    const [selectedLanguage, setSelectedLanguage] = useState('javascript');
    const [selectedThemeName, setSelectedThemeName] = useState('vs2015');
    const [currentBgColor, setCurrentBgColor] = useState('#1e1e1e');


    const languageOptions = [
        { label: 'JavaScript', value: 'javascript' },
        { label: 'Python', value: 'python' },
        { label: 'CSS', value: 'css' },
        { label: 'HTML/XML', value: 'html' },
        { label: 'JSON', value: 'json' },
    ];

    // Map theme options to their corresponding HLJS theme objects and background colors
    const themeOptions = [
        { label: 'Atom One Dark', value: 'atomOneDark', themeObject: atomOneDark, backgroundColor: '#282c34' },
        { label: 'Atom One Light', value: 'atomOneLight', themeObject: atomOneLight, backgroundColor: '#fafafa' },
        { label: 'Dracula', value: 'dracula', themeObject: dracula, backgroundColor: '#282a36' },
        { label: 'GitHub (Dark)', value: 'githubGist', themeObject: githubGist, backgroundColor: '#24292e' },
        { label: 'GitHub (Light)', value: 'vs', themeObject: vs, backgroundColor: '#ffffff' },
        { label: 'Monokai', value: 'monokai', themeObject: monokai, backgroundColor: '#272822' },
        { label: 'Hybrid', value: 'hybrid', themeObject: hybrid, backgroundColor: '#1d1f21' },
        { label: 'Rainbow', value: 'rainbow', themeObject: rainbow, backgroundColor: '#3f4144' },
        { label: 'Arta', value: 'arta', themeObject: arta, backgroundColor: '#222222' },
        { label: 'Solarized Dark', value: 'solarizedDark', themeObject: solarizedDark, backgroundColor: '#002b36' },
        { label: 'Solarized Light', value: 'solarizedLight', themeObject: solarizedLight, backgroundColor: '#fdf6e3' },
        { label: 'VS Code Modern Dark', value: 'vs2015', themeObject: vs2015, backgroundColor: '#1e1e1e' },
    ];

    // Effect to synchronize the scroll position of the textarea with the SyntaxHighlighter's <pre> tag
    useEffect(() => {
        const textarea = textareaRef.current;
        // The highlighter's <pre> tag is a descendant of the div with data-code-window and gets the .hljs class
        const codeWindowInner = codeRef.current?.querySelector('[data-code-window]');
        const highlighterPre = codeWindowInner?.querySelector('.hljs');

        if (textarea && highlighterPre) {
            const handleScroll = () => {
                highlighterPre.scrollTop = textarea.scrollTop;
                highlighterPre.scrollLeft = textarea.scrollLeft;
            };
            textarea.addEventListener('scroll', handleScroll);
            return () => {
                textarea.removeEventListener('scroll', handleScroll);
            };
        }
    }, [selectedThemeName, code]); // Re-run if theme or code changes

    // Function to handle downloading the image in various formats
    const handleDownloadImage = async (format) => {
        if (!codeRef.current) {
            alert('Code snippet element not found. Cannot capture image.');
            return;
        }

        const nodeToCapture = codeRef.current;
        const textarea = textareaRef.current;
        // Select the actual <pre> element inside SyntaxHighlighter which gets the 'hljs' class
        const highlighterPre = nodeToCapture.querySelector('.hljs');

        // Store original styles to restore them after capture
        let originalTextareaVisibility;
        let originalTextareaOverflow;
        let originalHighlighterOverflowX;

        // Temporarily modify styles to ensure clean capture
        if (textarea) {
            originalTextareaVisibility = textarea.style.visibility;
            originalTextareaOverflow = textarea.style.overflow;
            textarea.style.visibility = 'hidden'; // Hide the transparent textarea during capture
            textarea.style.overflow = 'hidden'; // Crucial: Hide textarea scrollbar
        }
        if (highlighterPre) {
            originalHighlighterOverflowX = highlighterPre.style.overflowX;
            highlighterPre.style.overflowX = 'hidden'; // Crucial: Hide highlighter horizontal scrollbar
        }

        try {
            const commonOptions = {
                cacheBust: true, // Prevents caching issues with dynamically generated content
                backgroundColor: 'transparent', // Ensures transparency for PNG/SVG background
            };

            let imagePromise;
            let fileName;

            // Choose the appropriate html-to-image function based on format
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
                    // JPEG does not support transparency, so a white background is used by default
                    imagePromise = toJpeg(nodeToCapture, { ...commonOptions, backgroundColor: 'white' });
                    fileName = 'code-snippet.jpeg';
                    break;
                default:
                    alert('Invalid image format selected.');
                    return;
            }

            // Await the image generation and trigger download
            const dataUrl = await imagePromise;
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            document.body.appendChild(link); // Append to body to ensure it's clickable in all browsers
            link.click();
            document.body.removeChild(link); // Clean up the created link element

        } catch (err) {
            console.error(`Failed to download image as ${format}:`, err);
            alert(`Failed to download image as ${format}. Please check the browser console for details: ${err.message}`);
        } finally {
            // Restore original styles after capture, even if an error occurred
            if (textarea) {
                textarea.style.visibility = originalTextareaVisibility;
                textarea.style.overflow = originalTextareaOverflow;
            }
            if (highlighterPre) {
                highlighterPre.style.overflowX = originalHighlighterOverflowX;
            }
        }
    };

    return (
        // Main container for the entire application, controlling overall width and font
        <div style={{
            width: '100%',
            maxWidth: '900px',
            boxSizing: 'border-box',
            fontFamily: 'Inter, sans-serif'
        }}>
            {/* Outer wrapper for the app's visual window, including controls and code area */}
            <div style={{
                backgroundColor: 'rgb(231 236 239)', // Light gray background for the overall app window
                borderRadius: '12px',
                padding: '40px',
                width: '100%',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Top Bar: Language, Theme selectors and Export Buttons */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                    paddingBottom: '10px',
                    flexWrap: 'wrap', // Allow wrapping on smaller screens
                    gap: '20px', // Space between left and right sections when wrapped
                }}>
                    {/* Left Section: Language & Theme Selectors */}
                    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {/* Language Select Dropdown */}
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

                        {/* Theme Select Dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <label htmlFor="theme-select" style={{ marginRight: '8px', fontSize: '15px', color: 'rgb(62 68 81)' }}>Theme:</label>
                            <select
                                id="theme-select"
                                value={selectedThemeName}
                                onChange={(e) => {
                                    const newThemeName = e.target.value;
                                    setSelectedThemeName(newThemeName);
                                    const chosenThemeOption = themeOptions.find(option => option.value === newThemeName);
                                    if (chosenThemeOption) {
                                        setCurrentBgColor(chosenThemeOption.backgroundColor);
                                    }
                                }}
                                style={{
                                    padding: '6px 10px',
                                    fontSize: '14px',
                                    borderRadius: '6px',
                                    border: '1px solid rgb(62, 68, 82)',
                                    backgroundColor: 'white',
                                    color: 'rgb(62 68 80)',
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

                    {/* Right Section: Action Buttons (PNG, SVG, JPEG) */}
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

                {/* This is the new wrapper for the shadow and the element to be captured.
                    codeRef points to this div. Its padding provides transparent space for shadows/overflow. */}
                <div
                    ref={codeRef}
                    style={{
                         // Increased padding to ensure no clipping, especially for shadows
                        boxSizing: 'border-box',
                        backgroundColor: 'transparent', // Important for transparent image backgrounds
                    }}
                >
                    {/* Inner Unified Code Input/Display Area - this is the actual visual code window
                        with the background color, border radius, and shadow */}
                    <div
                        data-code-window // Data attribute for easier selection within useEffect
                        style={{
                            position: 'relative',
                            backgroundColor: currentBgColor, // Background color based on selected theme
                            padding: '20px', // Inner padding for the code content itself
                            borderRadius: '8px', // Rounded corners for the code window
                            boxShadow: '0 8px 16px rgba(0,0,0,0.4)', // Drop shadow for depth
                            boxSizing: 'border-box',
                            minHeight: '200px', // Minimum height for the code area
                            overflow: 'hidden', // Ensures content respects rounded corners in browser view
                        }}
                    >
                        {/* Traffic Light Dots for visual appeal */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5f56', border: '1px solid #e0443e' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffbd2e', border: '1px solid #e0a22a' }}></div>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#27c93f', border: '1px solid #22b53b' }}></div>
                        </div>

                        {/* Transparent Textarea for actual user input, overlaid on highlighter */}
                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            style={{
                                position: 'absolute',
                                top: '47px', // Calculated offset: (20px top padding + 12px dot height + 15px margin-bottom)
                                left: '20px', // Matches inner left padding
                                width: 'calc(100% - 40px)', // Full width minus 20px padding on each side
                                height: 'calc(100% - 47px)', // Full height minus calculated top offset
                                backgroundColor: 'rgba(0,0,0,0.0)', // Transparent background
                                color: 'transparent', // Hide text, only caret is visible
                                caretColor: '#f8f8f2', // Caret color for visibility
                                padding: '0',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                fontFamily: 'monospace',
                                border: 'none',
                                resize: 'none', // Disable textarea resizing
                                outline: 'none',
                                overflow: 'auto', // Allows scrolling for long code in live view (temporarily hidden for capture)
                                whiteSpace: 'pre-wrap', // Preserves whitespace and wraps lines
                                wordBreak: 'break-word', // Breaks long words if necessary
                                boxSizing: 'border-box',
                                zIndex: 2, // Ensures textarea is above highlighter for input
                            }}
                            spellCheck="false"
                            placeholder="Paste your code here..."
                        />

                        {/* SyntaxHighlighter for visual display of the code */}
                        <div
                            style={{
                                position: 'relative',
                                zIndex: 1, // Below textarea
                                height: '100%',
                                overflow: 'hidden', // Keeps highlighter content within its bounds
                                backgroundColor: 'transparent',
                            }}
                        >
                            <SyntaxHighlighter
                                language={selectedLanguage}
                                // Dynamically select theme object based on selectedThemeName
                                style={themeOptions.find(opt => opt.value === selectedThemeName)?.themeObject || atomOneDark}
                                customStyle={{
                                    margin: '0',
                                    padding: '0 20px 20px 20px', // Aligned with the textarea's effective content area
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    fontFamily: 'monospace',
                                    backgroundColor: 'transparent',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    height: '100%',
                                    boxSizing: 'border-box',
                                    overflow: 'hidden', // Ensures highlighter content stays within bounds
                                }}
                            >
                                {code}
                            </SyntaxHighlighter>
                        </div>
                    </div>
                </div>
                {/* Optional margin at the bottom of the entire component */}
                <div style={{ marginBottom: '20px' }}></div>
            </div>
        </div>
    );
}

export default App;