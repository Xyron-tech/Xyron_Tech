import {Facebook,Instagram,Linkedin,Send,Youtube} from "lucide-react";

const networks=[
  {key:"instagramUrl",name:"Instagram",Icon:Instagram},
  {key:"youtubeUrl",name:"YouTube",Icon:Youtube},
  {key:"facebookUrl",name:"Facebook",Icon:Facebook},
  {key:"linkedinUrl",name:"LinkedIn",Icon:Linkedin},
  {key:"twitterUrl",name:"X / Twitter",label:"X"},
  {key:"telegramUrl",name:"Telegram",Icon:Send}
];

export default function SocialLinks({links={},label="Social links",className="social-links"}){
  const available=networks.filter(network=>links[network.key]);
  if(!available.length)return null;
  return <nav className={className} aria-label={label}>{available.map(({key,name,Icon,label:shortLabel})=><a key={key} href={links[key]} target="_blank" rel="noopener noreferrer" aria-label={`${label} on ${name}`}>{Icon?<Icon size={16}/>:<b>{shortLabel}</b>}</a>)}</nav>;
}
