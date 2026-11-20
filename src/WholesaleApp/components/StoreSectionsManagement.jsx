import {useState} from "react";
import {Check,Plus,Trash2,X} from "lucide-react";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";

const emptySection={title:"",subtitle:"",productIds:[]};
const sectionKey=section=>String(section._id||section._key);

export default function StoreSectionsManagement({business,products,onSaved,onAddProduct,canAddProduct=true}){
  const [sections,setSections]=useState(()=>business.storeSections||[]);
  const [draft,setDraft]=useState(emptySection),[editingId,setEditingId]=useState(""),[editorOpen,setEditorOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
  const activeProducts=products.filter(product=>product.status==="ACTIVE");

  function resetDraft(){
    setDraft(emptySection);
    setEditingId("");
    setEditorOpen(false);
    setError("");
  }
  function openNewSection(){
    setDraft(emptySection);
    setEditingId("");
    setError("");
    setEditorOpen(true);
  }
  function editSection(section){
    setDraft({title:section.title,subtitle:section.subtitle||"",productIds:section.productIds.map(String)});
    setEditingId(sectionKey(section));
    setError("");
    setEditorOpen(true);
  }
  async function persistSections(nextSections){
    const {data}=await api.patch("/business/store-sections",{sections:nextSections.map(({title,subtitle,productIds})=>({title,subtitle,productIds}))});
    onSaved(data.business);
    setSections(data.business.storeSections||[]);
    notify(data.message);
  }
  async function saveDraft(event){
    event.preventDefault();
    if(!draft.productIds.length){setError("Choose at least one active product for this section.");return;}
    const nextSections=editingId
      ?sections.map(section=>sectionKey(section)===editingId?{...section,...draft}:section)
      :[...sections,{...draft,_key:`new-${Date.now()}`}];
    setBusy(true);
    setError("");
    try{
      await persistSections(nextSections);
      resetDraft();
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    finally{setBusy(false);}
  }
  async function deleteSection(section,index){
    if(!window.confirm(`Delete the "${section.title}" storefront section?`))return;
    const nextSections=sections.filter((_,itemIndex)=>itemIndex!==index);
    setBusy(true);
    setError("");
    try{
      await persistSections(nextSections);
      if(editingId===sectionKey(section))resetDraft();
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    finally{setBusy(false);}
  }
  function toggleProduct(productId,checked){
    setDraft(current=>({...current,productIds:checked?[...new Set([...current.productIds,productId])]:current.productIds.filter(id=>id!==productId)}));
  }
  function addProductToSection(productId){
    if(draft.productIds.length>=20){setError("A section can contain up to 20 products.");return;}
    setDraft(current=>({...current,productIds:[...new Set([...current.productIds,productId])]}));
  }
  function createProductForSection(){
    setEditorOpen(false);
    onAddProduct(productId=>{
      addProductToSection(productId);
      setEditorOpen(true);
    });
  }

  return <section className="panel store-sections-management">
    <header><div><span className="store-eyebrow">CUSTOMER STOREFRONT</span><h2>Custom product sections</h2><p>Create titled sections with a subtitle and choose products from your catalogue.</p></div><div className="store-section-heading-actions"><b>{sections.length}/8</b><button className="primary" type="button" disabled={busy||sections.length>=8} onClick={openNewSection}><Plus size={14}/> Add section</button></div></header>
    <div className="store-section-list">{sections.map((section,index)=><article key={section._id||section._key}><div><b>{section.title}</b><span>{section.subtitle||"No subtitle"}</span><small>{section.productIds.length} selected product{section.productIds.length===1?"":"s"}</small></div><button className="secondary-button" type="button" disabled={busy} onClick={()=>editSection(section)}>Edit</button><button className="icon-action danger" type="button" disabled={busy} aria-label={`Delete ${section.title}`} onClick={()=>deleteSection(section,index)}><Trash2 size={15}/></button></article>)}</div>
    {sections.length===0&&<p className="store-section-empty">No custom sections yet. Your selected products will appear together under their own title on the customer storefront.</p>}
    {error&&!editorOpen&&<div className="error" role="alert">{error}</div>}
    {editorOpen&&<div className="product-modal-backdrop store-section-modal-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)resetDraft();}}>
      <section className="product-modal store-section-modal" role="dialog" aria-modal="true" aria-labelledby="store-section-modal-title">
        <header><h2 id="store-section-modal-title">{editingId?"Edit storefront section":"Add storefront section"}</h2><button className="secondary-button" type="button" aria-label="Close section editor" onClick={resetDraft}><X size={15}/></button></header>
        <form className="store-section-editor" onSubmit={saveDraft}>
          <label>Section title<input required minLength="2" maxLength="80" value={draft.title} onChange={event=>setDraft(current=>({...current,title:event.target.value}))} placeholder="For example, Best sellers"/></label>
          <label>Subtitle<textarea maxLength="180" rows="2" value={draft.subtitle} onChange={event=>setDraft(current=>({...current,subtitle:event.target.value}))} placeholder="A short message below the section title"/></label>
          <fieldset>
            <legend>Products in this section</legend>
            {onAddProduct&&<button className="secondary-button store-section-add-product" type="button" disabled={!canAddProduct||busy} onClick={createProductForSection}><Plus size={14}/>{canAddProduct?"Add a new product":"Product limit reached"}</button>}
            {activeProducts.length?<div className="store-section-product-options">{activeProducts.map(product=>{
              const productId=String(product._id);
              return <label className="store-section-product-option" key={productId}><input type="checkbox" checked={draft.productIds.includes(productId)} onChange={event=>toggleProduct(productId,event.target.checked)} disabled={!draft.productIds.includes(productId)&&draft.productIds.length>=20}/><span>{product.name}<small>{product.category} · ₹{product.packetPrice}</small></span></label>;
            })}</div>:<p>Add active products before creating a section.</p>}
          </fieldset>
          {error&&<div className="error" role="alert">{error}</div>}
          <div className="store-section-editor-actions"><button className="primary" type="submit" disabled={busy||!activeProducts.length}>{busy?"Saving…":<><Check size={14}/>{editingId?"Update section":"Add section"}</>}</button><button className="secondary-button" type="button" disabled={busy} onClick={resetDraft}><X size={14}/> Cancel</button></div>
        </form>
      </section>
    </div>}
  </section>;
}
