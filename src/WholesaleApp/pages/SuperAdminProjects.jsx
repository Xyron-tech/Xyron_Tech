import {useEffect,useMemo,useRef,useState} from "react";
import {ExternalLink,FolderKanban,ImagePlus,Pencil,Plus,RefreshCw,Trash2,X} from "lucide-react";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";

const emptyForm={title:"",imageUrl:"",link:"",tools:"",color:"blue",sortOrder:"0",status:"PUBLISHED"};

export default function SuperAdminProjects(){
  const [projects,setProjects]=useState([]),[form,setForm]=useState(emptyForm),[editingId,setEditingId]=useState(""),[imageFile,setImageFile]=useState(null),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[busyId,setBusyId]=useState(""),[error,setError]=useState("");
  const imageInputRef=useRef(null);
  const previewUrlRef=useRef("");
  const [localPreview,setLocalPreview]=useState("");

  useEffect(()=>{
    return ()=>{if(previewUrlRef.current)URL.revokeObjectURL(previewUrlRef.current);};
  },[]);

  async function load(){
    setError("");
    try{
      const {data}=await api.get("/super-admin/projects");
      setProjects(data.projects);
    }catch(error){setError(getApiError(error));}
    finally{setLoading(false);}
  }

  useEffect(()=>{
    let active=true;
    api.get("/super-admin/projects").then(({data})=>{
      if(active){setProjects(data.projects);setError("");}
    }).catch(error=>{if(active)setError(getApiError(error));}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[]);

  function resetForm(){
    setForm({...emptyForm,sortOrder:String(projects.length)});
    setEditingId("");
    setImageFile(null);
    clearImagePreview();
    if(imageInputRef.current)imageInputRef.current.value="";
  }

  function clearImagePreview(){
    if(previewUrlRef.current)URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current="";
    setLocalPreview("");
  }

  function editProject(project){
    setEditingId(project.id);
    setForm({
      title:project.title,
      imageUrl:project.imageUrl,
      link:project.link,
      tools:project.tools.join(", "),
      color:project.color,
      sortOrder:String(project.sortOrder),
      status:project.status
    });
    setImageFile(null);
    clearImagePreview();
    if(imageInputRef.current)imageInputRef.current.value="";
    setError("");
    document.querySelector(".super-admin-project-form")?.scrollIntoView({behavior:"smooth",block:"start"});
  }

  async function saveProject(event){
    event.preventDefault();
    setError("");
    if(!imageFile&&!form.imageUrl.trim()){
      setError("Upload a project image or enter an image URL.");
      return;
    }
    if(imageFile&&(!/^image\/(jpeg|png|webp)$/.test(imageFile.type)||imageFile.size>5*1024*1024)){
      setError("Choose a JPG, PNG, or WebP image under 5 MB.");
      return;
    }
    setSaving(true);
    try{
      const details={
        ...form,
        title:form.title.trim(),
        imageUrl:form.imageUrl.trim(),
        link:form.link.trim(),
        tools:form.tools.split(",").map(tool=>tool.trim()).filter(Boolean),
        sortOrder:Number(form.sortOrder)
      };
      const body=new FormData();
      body.append("details",JSON.stringify(details));
      if(imageFile)body.append("image",imageFile);
      const options={headers:{"Content-Type":"multipart/form-data"}};
      const {data}=editingId
        ?await api.patch(`/super-admin/projects/${editingId}`,body,options)
        :await api.post("/super-admin/projects",body,options);
      notify(data.warning||data.message,data.warning?"error":"success");
      resetForm();
      await load();
    }catch(error){setError(getApiError(error));}
    finally{setSaving(false);}
  }

  async function deleteProject(project){
    if(!window.confirm(`Remove "${project.title}" from the portfolio?`))return;
    setBusyId(project.id);
    setError("");
    try{
      const {data}=await api.delete(`/super-admin/projects/${project.id}`);
      notify(data.warning||data.message,data.warning?"error":"success");
      await load();
    }catch(error){setError(getApiError(error));}
    finally{setBusyId("");}
  }

  const publishedCount=useMemo(()=>projects.filter(project=>project.status==="PUBLISHED").length,[projects]);
  const previewImage=localPreview||form.imageUrl;

  return <section className="super-admin-projects">
    <header className="admin-head">
      <div><small>PORTFOLIO CONTENT</small><h1>Project management</h1><p>Add and manage published work on the portfolio Projects page. Existing featured projects remain in place.</p></div>
      <span><FolderKanban size={15}/> Super Admin</span>
    </header>
    <div className="super-admin-project-summary"><span>Managed projects <b>{projects.length}</b></span><span>Published <b>{publishedCount}</b></span></div>
    {error&&<div className="error" role="alert">{error}</div>}
    <section className="panel super-admin-project-form-panel">
      <div className="super-admin-project-panel-heading"><div><span className="store-eyebrow">{editingId?"EDIT PROJECT":"NEW PROJECT"}</span><h2>{editingId?"Update portfolio project":"Add a portfolio project"}</h2></div>{editingId&&<button type="button" className="secondary-button" onClick={resetForm}><X size={15}/> Cancel edit</button>}</div>
      <form className="super-admin-project-form" onSubmit={saveProject}>
        <div className="super-admin-project-fields">
          <label>Project title<input maxLength="100" required value={form.title} onChange={event=>setForm(current=>({...current,title:event.target.value}))} placeholder="Example: Local business online store"/></label>
          <label>Project link<input type="url" required value={form.link} onChange={event=>setForm(current=>({...current,link:event.target.value}))} placeholder="https://example.com"/></label>
          <label>Built with <small>Separate technologies with commas</small><input value={form.tools} onChange={event=>setForm(current=>({...current,tools:event.target.value}))} placeholder="React, Node.js, MongoDB"/></label>
          <label>Image URL <small>Optional when uploading an image</small><input type="url" value={form.imageUrl} onChange={event=>setForm(current=>({...current,imageUrl:event.target.value}))} placeholder="https://..."/></label>
          <label>Display order<input type="number" min="0" max="10000" value={form.sortOrder} onChange={event=>setForm(current=>({...current,sortOrder:event.target.value}))}/></label>
          <label>Project color<select value={form.color} onChange={event=>setForm(current=>({...current,color:event.target.value}))}><option value="blue">Blue</option><option value="purple">Purple</option></select></label>
          <label>Visibility<select value={form.status} onChange={event=>setForm(current=>({...current,status:event.target.value}))}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option></select></label>
        </div>
        <div className="super-admin-project-image-row">
          <label className="super-admin-project-upload">Upload image<input ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={event=>{clearImagePreview();const file=event.target.files?.[0]||null;if(file){previewUrlRef.current=URL.createObjectURL(file);setLocalPreview(previewUrlRef.current);}setImageFile(file);}}/><small>JPG, PNG, or WebP · up to 5 MB</small></label>
          {previewImage?<img className="super-admin-project-preview" src={previewImage} alt="Project preview"/>:<div className="super-admin-project-preview-empty"><ImagePlus size={22}/>Project image preview</div>}
        </div>
        <div className="super-admin-project-form-actions"><button type="submit" className="primary" disabled={saving}>{saving?<RefreshCw size={15} className="spin"/>:editingId?<Pencil size={15}/>:<Plus size={15}/>} {saving?"Saving…":editingId?"Save changes":"Add project"}</button></div>
      </form>
    </section>
    <section className="super-admin-project-list-section" aria-labelledby="managed-projects-title">
      <div className="super-admin-project-list-heading"><div><span className="store-eyebrow">PROJECT LIBRARY</span><h2 id="managed-projects-title">Managed projects</h2></div><button type="button" className="secondary-button" onClick={load} disabled={loading}><RefreshCw size={15}/> Refresh</button></div>
      {loading?<div className="panel">Loading projects…</div>:projects.length===0?<div className="panel super-admin-project-empty">No managed projects yet. Add one above to show it on the portfolio Projects page.</div>:<div className="super-admin-project-list">
        {projects.map(project=><article className="super-admin-project-card" key={project.id}>
          <img src={project.imageUrl} alt=""/>
          <div className="super-admin-project-card-copy"><div><span className={`tag ${project.status==="PUBLISHED"?"approved":"pending"}`}>{project.status}</span><small>Order {project.sortOrder}</small></div><h3>{project.title}</h3><p>{project.tools.join(" · ")||"No technologies listed"}</p><a href={project.link} target="_blank" rel="noopener noreferrer">Open project <ExternalLink size={14}/></a></div>
          <div className="super-admin-project-card-actions"><button type="button" className="secondary-button" onClick={()=>editProject(project)} aria-label={`Edit ${project.title}`}><Pencil size={15}/> Edit</button><button type="button" className="reject" disabled={busyId===project.id} onClick={()=>deleteProject(project)} aria-label={`Delete ${project.title}`}><Trash2 size={15}/> Remove</button></div>
        </article>)}
      </div>}
    </section>
  </section>;
}
