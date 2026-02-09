/**
 * ui.js
 * Common UI interactions and effects for Studio344
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Mouse Tracking for Spotlight Effects ---
  const body = document.body;
  
  // Update CSS variables for mouse position
  // This allows CSS radial-gradients to follow the mouse
  document.addEventListener("mousemove", (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    // Set custom properties on body (or documentElement for broader support)
    document.documentElement.style.setProperty("--mouse-x", `${x}px`);
    document.documentElement.style.setProperty("--mouse-y", `${y}px`);
  });

  // --- 2. Typing Animation ---
  const typingTarget = document.getElementById("typing");
  if (typingTarget) {
    const text = "Engineer / Rookie Dad";
    let index = 0;

    function typeWriter() {
      if (index < text.length) {
        typingTarget.textContent += text.charAt(index);
        index++;
        setTimeout(typeWriter, 80);
      }
    }
    
    // Start slightly delayed
    setTimeout(typeWriter, 1000);
  }
});
