const photoSources=const photoSources={
  "thar":"/assets/thar.jpg",
  "scorpio":"/assets/scorpio.jpg",
  "baleno":"/assets/baleno.jpg",
  "dzire":"/assets/dzire.jpg",
  "swift":"/assets/swift.jpg",
  "ertiga":"/assets/eartiga.jpg",
  "exter":"/assets/Exter.jpg"
};
const cars=[
{id:"thar",name:"Mahindra Thar",type:"SUV",price:2499,transmission:"Manual",seats:"4",fuel:"Diesel",drive:"4×4",description:"Iconic off-road SUV for beach roads, highways and weekend adventures."},
{id:"scorpio",name:"Mahindra Scorpio",type:"SUV",price:2999,transmission:"Manual",seats:"7",fuel:"Diesel",drive:"RWD",description:"Spacious SUV with a commanding driving position and long-distance comfort."},
{id:"baleno",name:"Maruti Baleno",type:"Hatchback",price:1499,transmission:"Manual",seats:"5",fuel:"Petrol",drive:"FWD",description:"Premium hatchback suited for city drives and efficient everyday travel."},
{id:"dzire",name:"Maruti Dzire",type:"Sedan",price:1599,transmission:"Manual",seats:"5",fuel:"Petrol",drive:"FWD",description:"Comfortable sedan with a practical cabin and smooth highway manners."},
{id:"swift",name:"Maruti Swift",type:"Hatchback",price:1399,transmission:"Manual",seats:"5",fuel:"Petrol",drive:"FWD",description:"Fun, compact hatchback that is easy to drive around Porbandar and beyond."},
{id:"exter",name:"Hyundai Exter",type:"SUV",price:1699,transmission:"Manual",seats:"5",fuel:"Petrol",drive:"FWD",description:"Compact SUV with a high seating position and versatile urban character."},
{id:"ertiga",name:"Maruti Ertiga",type:"MPV",price:1899,transmission:"Manual",seats:"7",fuel:"Petrol",drive:"FWD",description:"Spacious 7-seater MPV for family trips, airport runs and comfortable highway travel."}
];
const $=s=>document.querySelector(s);
function photo(id){return photoSources[id]}
$("#heroCar").src=photo("thar");
cars.forEach(c=>{
  const img=photo(c.id);
  $("#carGrid").insertAdjacentHTML("beforeend",`<article class="glass card">
    <img src="${img}" alt="${c.name}" loading="lazy" onerror="this.style.display='none'">
    <h3>${c.name}</h3><small>${c.type} · ${c.price ? `From ₹${c.price}/day` : "Call for Price"}</small><br><br>
    <button class="btn red" onclick="openCarDetails('${c.id}')">VIEW DETAILS</button>
    <button type="button" class="btn glass-btn detail-btn" onclick="goBooking('${c.id}')">BOOK</button>
  </article>`);
  $("#car").insertAdjacentHTML("beforeend",`<option value="${c.id}">${c.name}</option>`);
});
$("#galleryGrid").innerHTML=cars.map(c=>`<img src="${photo(c.id)}" alt="${c.name}" loading="lazy" onerror="this.src='/assets/${c.id}.svg'" onclick="openCarDetails('${c.id}')">`).join("");
function selectCar(id){$("#car").value=id}
function goBooking(id){if(id)selectCar(id); const el=$("#booking"); el.scrollIntoView({behavior:'smooth',block:'start'}); setTimeout(()=>$("#name").focus(),450)}
function openCarDetails(id){
 const c=cars.find(x=>x.id===id); if(!c)return;
 $("#modalPhoto").src=photo(c.id); $("#modalPhoto").alt=c.name;
 $("#modalName").textContent=c.name; $("#modalType").textContent=`${c.type} · PREMIUM SELF DRIVE`;
 $("#modalDescription").textContent=c.description;
 $("#modalPrice").textContent=c.price ? `₹${c.price.toLocaleString("en-IN")}` : "CALL FOR PRICE";
 $("#modalSpecs").innerHTML=[
   ["TRANSMISSION",c.transmission],["SEATS",c.seats],["FUEL",c.fuel],["DRIVE",c.drive]
 ].map(s=>`<div class="spec"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");
 $("#modalBook").onclick=()=>{selectCar(c.id);closeCarDetails();location.hash="booking"};
 $("#carModal").classList.add("open"); document.body.style.overflow="hidden";
}
function closeCarDetails(){$("#carModal").classList.remove("open");document.body.style.overflow=""}
function closeConfirm(){$("#confirmModal").classList.remove("open");document.body.style.overflow=""}
async function api(url,options){const r=await fetch(url,options);return r.json()}
$("#check").onclick=async()=>{
 const from=$("#from").value,to=$("#to").value;
 if(!from||!to)return alert("Please select both dates.");
 const data=await api(`/api/availability?from=${from}&to=${to}`);
 $("#availabilityResult").innerHTML=data.map(x=>`<div class="status ${x.available?"ok":"no"}"><b>${x.name}</b><br><small>${x.available?"AVAILABLE":"BOOKED"}</small></div>`).join("");
};
$("#bookingForm").onsubmit=async e=>{
 e.preventDefault();
 const p={carId:$("#car").value,name:$("#name").value.trim(),phone:$("#phone").value.trim(),from:$("#bfrom").value,to:$("#bto").value};
 if(!p.carId||!p.name||!p.phone||!p.from||!p.to)return;
 if(p.from>p.to){alert("Return date cannot be before pickup date.");return;}
 const c=cars.find(x=>x.id===p.carId);
 const msg=`Hello RB SELF DRIVE, I want to book ${c?c.name:"a car"}.\n\nName: ${p.name}\nMobile: ${p.phone}\nPickup Date: ${p.from}\nReturn Date: ${p.to}`;
 try{
   const r=await api("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(p)});
   if(!r.success){alert(r.message||"This car is not available for those dates.");return;}
   window.location.href="https://wa.me/919924294444?text="+encodeURIComponent(msg);
   $("#confirmTitle").textContent="Booking request sent!";
   $("#confirmText").textContent=`${c?c.name:"Your car"} · ${p.from} → ${p.to}. WhatsApp has opened with your booking details.`;
   $("#confirmModal").classList.add("open"); document.body.style.overflow="hidden";
   e.target.reset();
 }catch(err){alert("Please try again.");}
};

$("#theme").onclick=()=>{document.body.classList.toggle("light");localStorage.setItem("rbtheme",document.body.classList.contains("light")?"light":"dark")};
if(localStorage.getItem("rbtheme")==="light")document.body.classList.add("light");
(async()=>{
 const r=await api("/api/reviews");
 $("#reviewsGrid").innerHTML=r.map(x=>`<article class="glass card"><b>★★★★★</b><p>“${x.text}”</p><strong>${x.name}</strong><small> · ${x.city||""}</small></article>`).join("");
})();
