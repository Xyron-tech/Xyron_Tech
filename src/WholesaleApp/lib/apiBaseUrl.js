export function resolveApiBaseUrl(configuredUrl,isProduction,fallbackUrl){
  if(isProduction)return fallbackUrl;
  const baseUrl=String(configuredUrl||"").trim().replace(/\/+$/,"");
  if(!baseUrl)return fallbackUrl;
  return /\/api$/i.test(baseUrl)?baseUrl:`${baseUrl}/api`;
}
