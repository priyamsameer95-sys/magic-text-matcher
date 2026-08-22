const regexInput = document.getElementById('regex');
const flagsInput = document.getElementById('flags');
const testString = document.getElementById('test-string');
const highlighter = document.getElementById('highlighter');
const errorMsg = document.getElementById('error-msg');

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function updateHighlighting() {
    let text = testString.value;
    let pattern = regexInput.value;
    let flags = flagsInput.value;
    
    // Sync scroll
    highlighter.scrollTop = testString.scrollTop;

    if (!pattern) {
        highlighter.innerHTML = escapeHtml(text) + "<br>";
        errorMsg.style.display = 'none';
        return;
    }

    try {
        // Ensure global flag is present for matchAll
        let safeFlags = flags;
        if (!safeFlags.includes('g')) {
            safeFlags += 'g';
        }
        
        const re = new RegExp(pattern, safeFlags);
        errorMsg.style.display = 'none';
        
        const matches = [...text.matchAll(re)];
        
        if (matches.length === 0) {
            highlighter.innerHTML = escapeHtml(text) + "<br>";
            return;
        }

        let highlightedHTML = "";
        let lastIndex = 0;

        matches.forEach(match => {
            const matchStart = match.index;
            const matchEnd = match.index + match[0].length;
            
            // Add unmatched text before this match
            highlightedHTML += escapeHtml(text.substring(lastIndex, matchStart));
            
            // Build the match HTML
            let matchText = match[0];
            let innerHTML = "";
            
            // Check for capture groups
            let groupSpans = [];
            let currentOffset = 0;
            
            // Try to map groups back to the string (simple approach for sub-strings)
            // Note: complex nested groups are hard to render perfectly inline without a tree,
            // but we can highlight the first few non-overlapping ones visually.
            for (let i = 1; i < match.length; i++) {
                if (match[i] !== undefined) {
                    const groupStr = match[i];
                    const localIdx = matchText.indexOf(groupStr, currentOffset);
                    if (localIdx !== -1) {
                        // Add text before group
                        innerHTML += escapeHtml(matchText.substring(currentOffset, localIdx));
                        // Add group
                        let groupClass = `group-${((i - 1) % 3) + 1}`;
                        innerHTML += `<mark class="${groupClass}">${escapeHtml(groupStr)}</mark>`;
                        currentOffset = localIdx + groupStr.length;
                    }
                }
            }
            
            // Add remaining match text
            innerHTML += escapeHtml(matchText.substring(currentOffset));
            
            // Wrap whole match
            highlightedHTML += `<mark>${innerHTML}</mark>`;
            lastIndex = matchEnd;
        });

        // Add remaining text
        highlightedHTML += escapeHtml(text.substring(lastIndex));
        
        // Add <br> so the div height matches textarea when ending with a newline
        highlighter.innerHTML = highlightedHTML + "<br>";

    } catch (err) {
        errorMsg.style.display = 'block';
        errorMsg.textContent = err.message;
        highlighter.innerHTML = escapeHtml(text) + "<br>";
    }
}

// Event Listeners
regexInput.addEventListener('input', updateHighlighting);
flagsInput.addEventListener('input', updateHighlighting);
testString.addEventListener('input', updateHighlighting);
testString.addEventListener('scroll', () => { highlighter.scrollTop = testString.scrollTop; });

// Init
updateHighlighting();
