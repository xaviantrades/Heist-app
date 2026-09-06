const userIid = localStorage.getItem("userId");
const dontdisplay = document.querySelector(".notshow");
const userinfo = document.querySelector(".user-info");


if (!userIid) {
  if (dontdisplay) dontdisplay.style.display = "none";
  if (userinfo) userinfo.style.display = "none";
  
}