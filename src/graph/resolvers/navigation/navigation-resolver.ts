import { dbClient } from "../../../client-orm.js";

function buildTree(items: any, parentId: number | null = null) {
  return items
    .filter((item: any) => item.parent_id === parentId)
    .sort((a: any, b: any) => a.sort - b.sort)
    .map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      children: buildTree(items, item.id),
    }));
}

export async function getAllNavigation() {
  const flatMenu = await dbClient.navigation.findMany({});
  return buildTree(flatMenu);
}
