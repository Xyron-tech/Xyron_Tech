export function groupCatalogProductsBySection(products,sections){
  const productsById=new Map(products.map(product=>[String(product._id),product]));
  const assignedProductIds=new Set();
  const groupedSections=(sections||[]).map(section=>{
    const seenProductIds=new Set();
    const sectionProducts=(section.productIds||[]).flatMap(id=>{
      const productId=String(id);
      const product=productsById.get(productId);
      if(!product||seenProductIds.has(productId))return [];
      seenProductIds.add(productId);
      assignedProductIds.add(productId);
      return [product];
    });
    return {section,products:sectionProducts};
  }).filter(group=>group.products.length>0);

  return {
    sections:groupedSections,
    unassignedProducts:products.filter(product=>!assignedProductIds.has(String(product._id)))
  };
}
