const categories=[
 {slug:"tablets",name:"Tablets",description:"Explore tablet products from ADJAAS Pharmaceuticals."},
 {slug:"capsules",name:"Capsules",description:"Explore capsule products from ADJAAS Pharmaceuticals."},
 {slug:"syrups",name:"Syrups",description:"Explore syrup products from ADJAAS Pharmaceuticals."},
 {slug:"injections",name:"Injections",description:"Explore injectable products from ADJAAS Pharmaceuticals."},
 {slug:"creams",name:"Ointments & Creams",description:"Explore topical ointment and cream products from ADJAAS Pharmaceuticals."},
 {slug:"dry-syrups",name:"Dry Syrups",description:"Explore dry syrup products from ADJAAS Pharmaceuticals."},
 {slug:"nutraceuticals",name:"Nutraceuticals",description:"Explore nutraceutical products from ADJAAS Pharmaceuticals."}
];
const slug=location.pathname.replace(/\/+$/,"").split("/").pop().toLowerCase();
const category=categories.find(item=>item.slug===slug);
const title=document.querySelector("#category-title"),description=document.querySelector("#category-description"),grid=document.querySelector("#category-grid"),status=document.querySelector("#category-status");
const safe=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
document.querySelector("#year").textContent=new Date().getFullYear();
const toggle=document.querySelector("#producttoggle"),menu=document.querySelector("#productmenu"),nav=document.querySelector("nav"),menuButton=document.querySelector("#menu");
menu.innerHTML=categories.map(c=>'<a href="/products/'+c.slug+'">'+c.name+'</a>').join("");
toggle.addEventListener("click",()=>{const open=toggle.getAttribute("aria-expanded")!=="true";toggle.setAttribute("aria-expanded",String(open));menu.hidden=!open});
document.addEventListener("click",e=>{if(!e.target.closest(".productnav")){toggle.setAttribute("aria-expanded","false");menu.hidden=true}});
menuButton.addEventListener("click",()=>{const open=menuButton.getAttribute("aria-expanded")!=="true";menuButton.setAttribute("aria-expanded",String(open));nav.classList.toggle("open",open)});
nav.addEventListener("click",e=>{if(e.target.closest("a")){nav.classList.remove("open");menuButton.setAttribute("aria-expanded","false")}});
async function load(){
 if(!category){title.textContent="Product category not found";description.textContent="Please choose a category from the Product menu.";status.textContent="";return}
 document.title=category.name+" | ADJAAS Pharmaceuticals";
 title.textContent=category.name;description.textContent=category.description;
 status.textContent="Loading products…";
 try{
  const response=await fetch("/api/products?category="+encodeURIComponent(category.name),{cache:"no-store"});
  const data=await response.json();
  if(!response.ok)throw new Error(data.error||"Products are temporarily unavailable.");
  const products=data.products||[];
  if(!products.length){status.textContent="No products have been published in this category yet.";return}
  grid.innerHTML=products.map(p=>'<article class="product"><div class="productphoto">'+(p.image_data?'<img src="'+safe(p.image_data)+'" alt="'+safe(p.name)+'" loading="lazy">':'')+'</div><h3>'+safe(p.name)+'</h3>'+(p.description?'<p>'+safe(p.description)+'</p>':'')+(p.composition?'<p><strong>Composition:</strong> '+safe(p.composition)+'</p>':'')+(p.pack_size?'<p><strong>Pack:</strong> '+safe(p.pack_size)+'</p>':'')+(p.mrp?'<p><strong>MRP:</strong> '+safe(p.mrp)+'</p>':'')+(p.manufacturer?'<p><strong>Manufacturer:</strong> '+safe(p.manufacturer)+'</p>':'')+(p.uses?'<details><summary>More information</summary><p>'+safe(p.uses)+'</p></details>':'')+'<a class="textlink" href="mailto:sales@adjaaspharma.in?subject='+encodeURIComponent("Product enquiry: "+p.name)+'">Enquire about product ↗</a></article>').join("");
  status.textContent=products.length+" product"+(products.length===1?"":"s")+" in this category";
 }catch(error){status.textContent=error.message||"Unable to load products right now."}
}
load();