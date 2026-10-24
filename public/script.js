const form=document.querySelector("#contact-form");
const statusText=document.querySelector("#form-status");
const year=document.querySelector("#year");
const whatsappNumber="2349041367646";
if(year) year.textContent=String(new Date().getFullYear());
if(form) form.addEventListener("submit",event=>{
  event.preventDefault();
  if(!form.reportValidity()) return;
  const formData=new FormData(form);
  const name=(formData.get("name")||"").toString().trim();
  const email=(formData.get("email")||"").toString().trim();
  const message=(formData.get("message")||"").toString().trim();
  const text=encodeURIComponent(`Hello Boluwatife, my name is ${name}. Email: ${email}. Message: ${message}`);
  const whatsappUrl=`https://wa.me/${whatsappNumber}?text=${text}`;
  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  statusText.textContent="Your WhatsApp chat has been opened with the pre-filled message.";
  form.reset();
});
