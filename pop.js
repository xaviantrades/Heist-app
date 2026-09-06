(function() { const overlay = document.getElementById('overlay'); const closeBtn = document.getElementById('closeBtn'); // Show overlay after 5 seconds 
  setTimeout(function() { overlay.classList.add('show'); }, 5000); // Close overlay 
              function closeOverlay() { overlay.classList.remove('show'); overlay.classList.add('hidden'); } // Close using X button 
              closeBtn.addEventListener('click', closeOverlay); // Close when clicking outside the card
              overlay.addEventListener('click', function(e) { if (e.target === overlay) { closeOverlay(); } }); // Close using Escape key 
              document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && overlay.classList.contains('show')) { closeOverlay(); } }); })();