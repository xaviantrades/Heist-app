
/***
LOGIN STATE ICONE WHATS OR LOGIN
*/

  const userId = localStorage.getItem("userId");

  const whatsappHTML = `
    <a class="whatsapp-link" href="#" target="_blank" title="Join our WhatsApp Channel">
      <svg width="33" height="33" viewBox="0 0 24 24" style="color: green;">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.48 1.32 5.01L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.78 14.09c-.24.68-1.4 1.32-1.93 1.36-.51.05-1.02.24-3.42-.71-2.9-1.15-4.76-4.14-4.9-4.33-.14-.19-1.17-1.56-1.17-2.97 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.42-.07.65.5.24.58.82 2 .89 2.14.07.14.12.31.02.5-.1.19-.14.31-.29.48-.14.17-.3.38-.43.51-.14.14-.29.29-.13.57.17.29.75 1.24 1.62 2.01 1.11.99 2.05 1.3 2.34 1.44.29.14.46.12.63-.07.17-.19.72-.84.92-1.13.19-.29.38-.24.64-.14.26.1 1.66.78 1.94.92.29.14.48.21.55.33.07.12.07.68-.17 1.35z"/>
      </svg>
    </a>
  `;

  const loginHTML = `
    <div>
      <a class="btn small" href="login.html">Login</a>
    </div>
  `;

  const loginState = document.querySelector(".loginstate");
if (loginState){
  loginState.innerHTML = userId ? whatsappHTML : loginHTML;
}
function clearAuthData() {
  localStorage.removeItem("userId");
  localStorage.removeItem("isLogin");
}

const logout = document.querySelector(".logout");
if(logout){
logout.addEventListener("click", function(){
  clearAuthData();
  window.location.href="home.html";
})}